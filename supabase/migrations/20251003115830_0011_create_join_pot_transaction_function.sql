-- Database function for atomic pot joining
-- Ensures all validations and updates happen in a single transaction

CREATE OR REPLACE FUNCTION join_pot_transaction(
    p_pot_id UUID,
    p_user_id UUID,
    p_ticket_count INTEGER,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    pot_id UUID,
    user_id UUID,
    ticket_count INTEGER,
    credits_spent NUMERIC,
    ticket_start_index INTEGER,
    ticket_end_index INTEGER,
    ip_hash TEXT,
    device_hash TEXT,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    pot_record RECORD;
    user_balance NUMERIC;
    total_cost NUMERIC;
    existing_tickets INTEGER;
    new_ticket_start INTEGER;
    new_ticket_end INTEGER;
    pot_update_result RECORD;
    balance_update_result RECORD;
BEGIN
    -- Get pot and validate it's open
    SELECT * INTO pot_record FROM pots WHERE id = p_pot_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pot not found';
    END IF;
    
    IF pot_record.status != 'open' THEN
        RAISE EXCEPTION 'Pot is not open for entries';
    END IF;
    
    -- Check if pot would be overfilled
    IF pot_record.total_tickets + p_ticket_count > pot_record.max_tickets THEN
        RAISE EXCEPTION 'Not enough tickets remaining in pot';
    END IF;
    
    -- Check if pot has expired
    IF pot_record.expires_at IS NOT NULL AND pot_record.expires_at < now() THEN
        RAISE EXCEPTION 'Pot has expired';
    END IF;
    
    -- Get user balance
    SELECT balance INTO user_balance FROM user_profiles WHERE user_id = p_user_id FOR UPDATE;
    
    IF user_balance IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;
    
    -- Calculate total cost
    total_cost := p_ticket_count * pot_record.entry_cost;
    
    -- Check if user has sufficient balance
    IF user_balance < total_cost THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;
    
    -- Check per-user limit
    SELECT COALESCE(SUM(ticket_count), 0) INTO existing_tickets
    FROM pot_entries 
    WHERE pot_id = p_pot_id AND user_id = p_user_id;
    
    IF existing_tickets + p_ticket_count > pot_record.max_per_user THEN
        RAISE EXCEPTION 'Exceeds maximum tickets per user';
    END IF;
    
    -- Calculate ticket indices
    new_ticket_start := pot_record.total_tickets;
    new_ticket_end := new_ticket_start + p_ticket_count - 1;
    
    -- Update pot totals
    UPDATE pots 
    SET 
        total_tickets = total_tickets + p_ticket_count,
        total_value = total_value + total_cost,
        updated_at = now()
    WHERE id = p_pot_id
    RETURNING * INTO pot_update_result;
    
    -- Update user balance (deduct credits)
    UPDATE user_profiles 
    SET 
        balance = balance - total_cost,
        updated_at = now()
    WHERE user_id = p_user_id
    RETURNING * INTO balance_update_result;
    
    -- Create the pot entry
    INSERT INTO pot_entries (
        pot_id,
        user_id,
        ticket_count,
        credits_spent,
        ticket_start_index,
        ticket_end_index,
        ip_hash,
        device_hash
    ) VALUES (
        p_pot_id,
        p_user_id,
        p_ticket_count,
        total_cost,
        new_ticket_start,
        new_ticket_end,
        encode(sha256(p_ip_address || COALESCE(p_user_agent, '')::bytea), 'hex'),
        encode(sha256(COALESCE(p_user_agent, '')::bytea), 'hex')
    )
    RETURNING *;
    
    -- Check if pot is now full and should be locked
    IF pot_update_result.total_tickets >= pot_update_result.max_tickets THEN
        UPDATE pots 
        SET status = 'locked',
            updated_at = now()
        WHERE id = p_pot_id;
    END IF;
    
    -- Return the created entry
    RETURN QUERY
    SELECT 
        pe.id,
        pe.pot_id,
        pe.user_id,
        pe.ticket_count,
        pe.credits_spent,
        pe.ticket_start_index,
        pe.ticket_end_index,
        pe.ip_hash,
        pe.device_hash,
        pe.created_at
    FROM pot_entries pe
    WHERE pe.pot_id = p_pot_id 
    AND pe.user_id = p_user_id 
    ORDER BY pe.created_at DESC 
    LIMIT 1;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pot statistics
CREATE OR REPLACE FUNCTION get_pot_stats(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    total_pots BIGINT,
    active_pots BIGINT,
    settled_pots BIGINT,
    total_volume NUMERIC,
    average_pot_size NUMERIC,
    biggest_pot NUMERIC,
    user_participations BIGINT,
    user_wins BIGINT,
    user_profit NUMERIC
) AS $$
BEGIN
    -- Overall stats
    SELECT 
        COUNT(*) FILTER (WHERE true),
        COUNT(*) FILTER (WHERE status IN ('open', 'locked')),
        COUNT(*) FILTER (WHERE status = 'settled'),
        COALESCE(SUM(total_value), 0),
        COALESCE(AVG(total_value), 0),
        COALESCE(MAX(total_value), 0),
        0, -- user_participations
        0, -- user_wins  
        0  -- user_profit
    INTO 
        total_pots, active_pots, settled_pots, total_volume, 
        average_pot_size, biggest_pot, user_participations, user_wins, user_profit
    FROM pots;
    
    -- User-specific stats if user_id provided
    IF p_user_id IS NOT NULL THEN
        SELECT 
            COUNT(DISTINCT pe.pot_id),
            COUNT(DISTINCT p.id) FILTER (WHERE p.winner_user_id = p_user_id),
            COALESCE(SUM(
                CASE WHEN p.winner_user_id = p_user_id THEN p.total_value ELSE 0 END
            ) - COALESCE(SUM(pe.credits_spent), 0), 0)
        INTO 
            user_participations, user_wins, user_profit
        FROM pot_entries pe
        LEFT JOIN pots p ON pe.pot_id = p.id
        WHERE pe.user_id = p_user_id;
    END IF;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION join_pot_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION get_pot_stats TO authenticated;;
