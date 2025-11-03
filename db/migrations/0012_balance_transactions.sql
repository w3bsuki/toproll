-- Balance Transactions System
-- Creates tables for tracking all balance operations and transfers

BEGIN;

-- Balance transactions table
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'transfer_in', 'transfer_out')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_entity_type TEXT, -- 'pot', 'battle', 'marketplace_listing', etc.
  related_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Database functions for atomic balance operations

-- Function to transfer balance between users atomically
CREATE OR REPLACE FUNCTION transfer_balance(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount NUMERIC(12,2)
) RETURNS TABLE (
  success BOOLEAN,
  new_from_balance NUMERIC(12,2),
  new_to_balance NUMERIC(12,2),
  error_message TEXT
) LANGUAGE plpgsql AS $$
DECLARE
  v_from_balance NUMERIC(12,2);
  v_to_balance NUMERIC(12,2);
BEGIN
  -- Check amount is positive
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, NULL::NUMERIC, NULL::NUMERIC, 'Amount must be positive'::TEXT;
    RETURN;
  END IF;

  -- Cannot transfer to same user
  IF p_from_user_id = p_to_user_id THEN
    RETURN QUERY SELECT false, NULL::NUMERIC, NULL::NUMERIC, 'Cannot transfer to same user'::TEXT;
    RETURN;
  END IF;

  -- Get current balances with lock
  SELECT balance INTO v_from_balance
  FROM user_profiles
  WHERE user_id = p_from_user_id
  FOR UPDATE;

  SELECT balance INTO v_to_balance
  FROM user_profiles
  WHERE user_id = p_to_user_id
  FOR UPDATE;

  -- Check if from user exists and has sufficient balance
  IF v_from_balance IS NULL THEN
    RETURN QUERY SELECT false, NULL::NUMERIC, NULL::NUMERIC, 'From user not found'::TEXT;
    RETURN;
  END IF;

  IF v_from_balance < p_amount THEN
    RETURN QUERY SELECT false, v_from_balance, NULL::NUMERIC, 'Insufficient balance'::TEXT;
    RETURN;
  END IF;

  -- Check if to user exists
  IF v_to_balance IS NULL THEN
    RETURN QUERY SELECT false, NULL::NUMERIC, NULL::NUMERIC, 'To user not found'::TEXT;
    RETURN;
  END IF;

  -- Update balances atomically
  UPDATE user_profiles
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_from_user_id;

  UPDATE user_profiles
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_to_user_id;

  -- Record transactions
  INSERT INTO balance_transactions (
    user_id, type, amount, description, related_user_id
  ) VALUES (
    p_from_user_id, 'transfer_out', p_amount, 'Balance transfer', p_to_user_id
  );

  INSERT INTO balance_transactions (
    user_id, type, amount, description, related_user_id
  ) VALUES (
    p_to_user_id, 'transfer_in', p_amount, 'Balance transfer', p_from_user_id
  );

  -- Return success with new balances
  RETURN QUERY 
  SELECT true, v_from_balance - p_amount, v_to_balance + p_amount, NULL::TEXT;
END;
$$;

-- Function to deduct balance atomically
CREATE OR REPLACE FUNCTION deduct_balance(
  p_user_id UUID,
  p_amount NUMERIC(12,2)
) RETURNS TABLE (
  success BOOLEAN,
  new_balance NUMERIC(12,2),
  error_message TEXT
) LANGUAGE plpgsql AS $$
DECLARE
  v_current_balance NUMERIC(12,2);
BEGIN
  -- Check amount is positive
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, NULL::NUMERIC, 'Amount must be positive'::TEXT;
    RETURN;
  END IF;

  -- Get current balance with lock
  SELECT balance INTO v_current_balance
  FROM user_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT false, NULL::NUMERIC, 'User not found'::TEXT;
    RETURN;
  END IF;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT false, v_current_balance, 'Insufficient balance'::TEXT;
    RETURN;
  END IF;

  -- Update balance
  UPDATE user_profiles
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO balance_transactions (
    user_id, type, amount, description
  ) VALUES (
    p_user_id, 'debit', p_amount, 'Balance deduction'
  );

  -- Return success with new balance
  RETURN QUERY 
  SELECT true, v_current_balance - p_amount, NULL::TEXT;
END;
$$;

-- Function to add balance atomically
CREATE OR REPLACE FUNCTION add_balance(
  p_user_id UUID,
  p_amount NUMERIC(12,2)
) RETURNS TABLE (
  success BOOLEAN,
  new_balance NUMERIC(12,2),
  error_message TEXT
) LANGUAGE plpgsql AS $$
DECLARE
  v_current_balance NUMERIC(12,2);
BEGIN
  -- Check amount is positive
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, NULL::NUMERIC, 'Amount must be positive'::TEXT;
    RETURN;
  END IF;

  -- Get current balance with lock
  SELECT balance INTO v_current_balance
  FROM user_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT false, NULL::NUMERIC, 'User not found'::TEXT;
    RETURN;
  END IF;

  -- Update balance
  UPDATE user_profiles
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO balance_transactions (
    user_id, type, amount, description
  ) VALUES (
    p_user_id, 'credit', p_amount, 'Balance addition'
  );

  -- Return success with new balance
  RETURN QUERY 
  SELECT true, v_current_balance + p_amount, NULL::TEXT;
END;
$$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON balance_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_type ON balance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_related_entity ON balance_transactions(related_entity_type, related_entity_id);

-- RLS Policies
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own balance transactions"
  ON balance_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert transactions
CREATE POLICY "System can insert balance transactions"
  ON balance_transactions FOR INSERT
  WITH CHECK (true);

-- Add balance_transactions to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE balance_transactions;

COMMIT;