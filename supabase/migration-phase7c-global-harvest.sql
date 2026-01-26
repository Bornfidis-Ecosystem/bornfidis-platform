-- Phase 7C: Global Harvest & Kingdom Capital Engine
-- Tracks global regeneration metrics and manages kingdom funds

-- harvest_metrics table
CREATE TABLE IF NOT EXISTS harvest_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES replication_regions(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  food_tons INTEGER NOT NULL DEFAULT 0,
  farmers_supported INTEGER NOT NULL DEFAULT 0,
  chefs_deployed INTEGER NOT NULL DEFAULT 0,
  meals_served INTEGER NOT NULL DEFAULT 0,
  land_regenerated_acres NUMERIC(10, 2) NOT NULL DEFAULT 0,
  disciples_trained INTEGER NOT NULL DEFAULT 0,
  community_events INTEGER NOT NULL DEFAULT 0,
  scholarships_funded INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE harvest_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for harvest_metrics
CREATE POLICY "Public metrics are viewable by everyone." ON harvest_metrics
  FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can insert metrics." ON harvest_metrics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update metrics." ON harvest_metrics
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete metrics." ON harvest_metrics
  FOR DELETE USING (auth.role() = 'authenticated');

-- kingdom_funds table
CREATE TABLE IF NOT EXISTS kingdom_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES replication_regions(id) ON DELETE SET NULL,
  fund_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  description TEXT,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  target_balance_cents INTEGER,
  fund_type TEXT NOT NULL DEFAULT 'general', -- 'general', 'scholarship', 'land', 'training', 'emergency'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE kingdom_funds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kingdom_funds
CREATE POLICY "Public funds are viewable by everyone." ON kingdom_funds
  FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can insert funds." ON kingdom_funds
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update funds." ON kingdom_funds
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete funds." ON kingdom_funds
  FOR DELETE USING (auth.role() = 'authenticated');

-- impact_transactions table
CREATE TABLE IF NOT EXISTS impact_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES kingdom_funds(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'booking', 'donation', 'investment', 'grant', 'transfer'
  source_reference_id UUID, -- booking_id, investor_id, etc.
  amount_cents INTEGER NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'credit', -- 'credit' or 'debit'
  purpose TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE impact_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for impact_transactions
CREATE POLICY "Public transactions are viewable by everyone." ON impact_transactions
  FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can insert transactions." ON impact_transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update transactions." ON impact_transactions
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete transactions." ON impact_transactions
  FOR DELETE USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_harvest_metrics_region_id ON harvest_metrics(region_id);
CREATE INDEX IF NOT EXISTS idx_harvest_metrics_period ON harvest_metrics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_kingdom_funds_region_id ON kingdom_funds(region_id);
CREATE INDEX IF NOT EXISTS idx_kingdom_funds_type ON kingdom_funds(fund_type);
CREATE INDEX IF NOT EXISTS idx_impact_transactions_fund_id ON impact_transactions(fund_id);
CREATE INDEX IF NOT EXISTS idx_impact_transactions_source ON impact_transactions(source);
CREATE INDEX IF NOT EXISTS idx_impact_transactions_created_at ON impact_transactions(created_at);

-- Function to update fund balance when transaction is created
CREATE OR REPLACE FUNCTION update_fund_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'credit' THEN
    UPDATE kingdom_funds
    SET balance_cents = balance_cents + NEW.amount_cents,
        updated_at = NOW()
    WHERE id = NEW.fund_id;
  ELSIF NEW.transaction_type = 'debit' THEN
    UPDATE kingdom_funds
    SET balance_cents = balance_cents - NEW.amount_cents,
        updated_at = NOW()
    WHERE id = NEW.fund_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update fund balance
CREATE TRIGGER trigger_update_fund_balance
  AFTER INSERT ON impact_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_fund_balance();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_harvest_metrics_updated_at
  BEFORE UPDATE ON harvest_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_kingdom_funds_updated_at
  BEFORE UPDATE ON kingdom_funds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
