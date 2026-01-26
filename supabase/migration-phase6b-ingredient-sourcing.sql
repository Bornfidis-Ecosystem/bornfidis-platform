-- Phase 6B: Ingredient Sourcing Engine (Island Harvest Hub)
-- Create ingredient catalog, farmer-ingredient links, and booking ingredient tracking

-- Ingredients catalog table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- produce, fish, meat, dairy, spice, beverage
  unit TEXT NOT NULL, -- lb, kg, bunch, bottle, piece, etc.
  
  -- Regenerative metrics
  regenerative_score INTEGER DEFAULT 50, -- 0-100 scale
  seasonality TEXT, -- e.g., "Year-round", "May-September", "Peak: June-August"
  notes TEXT, -- Additional notes about sourcing, quality, etc.
  
  -- Search and organization
  search_keywords TEXT[], -- Array for search functionality
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Farmer ingredients (what each farmer supplies)
CREATE TABLE IF NOT EXISTS farmer_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  
  -- Pricing
  price_cents INTEGER NOT NULL, -- Price per unit in cents
  
  -- Availability
  availability TEXT NOT NULL DEFAULT 'in_stock', -- in_stock | limited | out_of_season
  
  -- Quality indicators
  certified BOOLEAN DEFAULT FALSE NOT NULL, -- Organic, Fair Trade, etc.
  regenerative_practices TEXT, -- Specific practices for this ingredient
  
  -- Notes
  notes TEXT NULL,
  
  -- Ensure unique farmer-ingredient combination
  UNIQUE(farmer_id, ingredient_id)
);

-- Booking ingredients (ingredients needed for a booking, matched to farmers)
CREATE TABLE IF NOT EXISTS booking_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  booking_id UUID NOT NULL REFERENCES booking_inquiries(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
  
  -- Quantity and pricing
  quantity NUMERIC NOT NULL, -- Can be decimal (e.g., 2.5 lbs)
  unit TEXT NOT NULL,
  price_cents INTEGER NOT NULL, -- Price per unit at time of order
  total_cents INTEGER NOT NULL, -- quantity * price_cents
  
  -- Fulfillment tracking
  fulfillment_status TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | delivered | paid
  
  -- Timestamps
  confirmed_at TIMESTAMP WITH TIME ZONE NULL,
  delivered_at TIMESTAMP WITH TIME ZONE NULL,
  paid_at TIMESTAMP WITH TIME ZONE NULL,
  
  -- Payment tracking
  payout_status TEXT NOT NULL DEFAULT 'pending', -- pending | on_hold | paid | failed
  transfer_id TEXT NULL,
  
  -- Notes
  notes TEXT NULL,
  
  -- Allow multiple farmers for same ingredient (backup suppliers)
  -- But typically one primary supplier per ingredient per booking
  UNIQUE(booking_id, ingredient_id, farmer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);
CREATE INDEX IF NOT EXISTS idx_ingredients_regenerative_score ON ingredients(regenerative_score DESC);
CREATE INDEX IF NOT EXISTS idx_ingredients_active ON ingredients(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_farmer_ingredients_farmer_id ON farmer_ingredients(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_ingredients_ingredient_id ON farmer_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_farmer_ingredients_availability ON farmer_ingredients(availability);
CREATE INDEX IF NOT EXISTS idx_farmer_ingredients_certified ON farmer_ingredients(certified) WHERE certified = TRUE;

CREATE INDEX IF NOT EXISTS idx_booking_ingredients_booking_id ON booking_ingredients(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_ingredients_ingredient_id ON booking_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_booking_ingredients_farmer_id ON booking_ingredients(farmer_id);
CREATE INDEX IF NOT EXISTS idx_booking_ingredients_fulfillment_status ON booking_ingredients(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_booking_ingredients_payout_status ON booking_ingredients(payout_status);

-- Enable RLS
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_ingredients ENABLE ROW LEVEL SECURITY;

-- Update trigger for updated_at
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farmer_ingredients_updated_at BEFORE UPDATE ON farmer_ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_ingredients_updated_at BEFORE UPDATE ON booking_ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: ingredient.category values:
-- 'produce' - Fruits, vegetables, herbs
-- 'fish' - Seafood
-- 'meat' - Meat products
-- 'dairy' - Dairy products
-- 'spice' - Spices and seasonings
-- 'beverage' - Beverages

-- Note: farmer_ingredients.availability values:
-- 'in_stock' - Available now
-- 'limited' - Limited availability
-- 'out_of_season' - Not currently available

-- Note: booking_ingredients.fulfillment_status values:
-- 'pending' - Order placed, awaiting confirmation
-- 'confirmed' - Farmer confirmed order
-- 'delivered' - Ingredient delivered
-- 'paid' - Payment completed

-- Note: booking_ingredients.payout_status values:
-- 'pending' - Eligible for payout, awaiting completion
-- 'on_hold' - Payout blocked
-- 'paid' - Payout completed
-- 'failed' - Payout attempt failed
