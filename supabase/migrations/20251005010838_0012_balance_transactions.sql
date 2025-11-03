-- Create balance_transactions table for audit trail
CREATE TABLE IF NOT EXISTS balance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('pot_join', 'pot_win', 'marketplace_purchase', 'marketplace_sale', 'battle_entry', 'battle_win', 'deposit', 'withdrawal')),
    reference_id UUID, -- Reference to pot, listing, battle, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes separately
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at);

-- Enable RLS
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own transactions" ON balance_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON balance_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create balance transaction
CREATE OR REPLACE FUNCTION create_balance_transaction(
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_type VARCHAR(50),
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    -- Validate transaction type
    IF p_type NOT IN ('pot_join', 'pot_win', 'marketplace_purchase', 'marketplace_sale', 'battle_entry', 'battle_win', 'deposit', 'withdrawal') THEN
        RAISE EXCEPTION 'Invalid transaction type: %', p_type;
    END IF;
    
    -- Insert transaction
    INSERT INTO balance_transactions (user_id, amount, type, reference_id, description)
    VALUES (p_user_id, p_amount, p_type, p_reference_id, p_description)
    RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT ON balance_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION create_balance_transaction TO authenticated;;
