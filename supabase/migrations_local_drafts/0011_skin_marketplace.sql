-- Skin Marketplace System
-- Allows users to buy, sell, and trade CS2 skins

BEGIN;

-- User inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL, -- Steam asset ID
  classid TEXT NOT NULL, -- Steam class ID
  instanceid TEXT NOT NULL, -- Steam instance ID
  name TEXT NOT NULL,
  market_name TEXT NOT NULL,
  icon_url TEXT,
  tradable BOOLEAN NOT NULL DEFAULT false,
  marketable BOOLEAN NOT NULL DEFAULT false,
  market_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  rarity TEXT NOT NULL,
  type TEXT,
  wear_condition TEXT,
  exterior TEXT,
  description TEXT,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint for user+asset
  UNIQUE(user_id, asset_id)
);

-- Marketplace listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES user_inventory(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sold_at TIMESTAMPTZ,
  buyer_id UUID REFERENCES auth.users(id)
);

-- Trade offers table
CREATE TABLE IF NOT EXISTS trade_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  creator_inventory_id UUID REFERENCES user_inventory(id) ON DELETE CASCADE,
  recipient_inventory_id UUID REFERENCES user_inventory(id) ON DELETE CASCADE,
  creator_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  recipient_value NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Trade history table
CREATE TABLE IF NOT EXISTS trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_offer_id UUID NOT NULL REFERENCES trade_offers(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  creator_inventory_id UUID NOT NULL REFERENCES user_inventory(id),
  recipient_inventory_id UUID NOT NULL REFERENCES user_inventory(id),
  creator_value NUMERIC(10,2) NOT NULL,
  recipient_value NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_asset_id ON user_inventory(asset_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_market_value ON user_inventory(market_value DESC);
CREATE INDEX IF NOT EXISTS idx_user_inventory_rarity ON user_inventory(rarity);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_user_id ON marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON marketplace_listings(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_expires_at ON marketplace_listings(expires_at);

CREATE INDEX IF NOT EXISTS idx_trade_offers_creator_id ON trade_offers(creator_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_recipient_id ON trade_offers(recipient_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_status ON trade_offers(status);
CREATE INDEX IF NOT EXISTS idx_trade_offers_expires_at ON trade_offers(expires_at);

CREATE INDEX IF NOT EXISTS idx_trade_history_creator_id ON trade_history(creator_id);
CREATE INDEX IF NOT EXISTS idx_trade_history_recipient_id ON trade_history(recipient_id);

-- RLS Policies
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;

-- User inventory: Users can see their own, public can see all
CREATE POLICY "Users can view their own inventory"
  ON user_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON user_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON user_inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON user_inventory FOR DELETE
  USING (auth.uid() = user_id);

-- Marketplace listings: Public read, users can manage own
CREATE POLICY "All users can view marketplace listings"
  ON marketplace_listings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own listings"
  ON marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON marketplace_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON marketplace_listings FOR DELETE
  USING (auth.uid() = user_id);

-- Trade offers: Participants can view their own trades
CREATE POLICY "Trade participants can view their trades"
  ON trade_offers FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create trade offers as creator"
  ON trade_offers FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their trade offers"
  ON trade_offers FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Trade participants can delete their trades"
  ON trade_offers FOR DELETE
  USING (auth.uid() = creator_id OR auth.uid() = recipient_id);

-- Trade history: Public read for transparency
CREATE POLICY "Trade history is viewable by everyone"
  ON trade_history FOR SELECT
  USING (true);

-- Add inventory to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_listings;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER user_inventory_updated_at_trigger
  BEFORE UPDATE ON user_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER marketplace_listings_updated_at_trigger
  BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trade_offers_updated_at_trigger
  BEFORE UPDATE ON trade_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to check if user owns an inventory item
CREATE OR REPLACE FUNCTION user_owns_inventory_item(p_user_id UUID, p_inventory_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_inventory 
    WHERE id = p_inventory_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's total inventory value
CREATE OR REPLACE FUNCTION get_user_inventory_value(p_user_id UUID)
RETURNS NUMERIC(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(market_value) FROM user_inventory WHERE user_id = p_user_id),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
