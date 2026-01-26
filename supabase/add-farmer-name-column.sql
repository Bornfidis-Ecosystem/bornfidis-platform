-- Optional: Add farmer_name column to whatsapp_messages table
-- This is optional - the code now works without it, but adding it allows storing farmer names later

ALTER TABLE whatsapp_messages 
ADD COLUMN IF NOT EXISTS farmer_name TEXT;

-- Add comment
COMMENT ON COLUMN whatsapp_messages.farmer_name IS 'Optional: Farmer name if extracted from message';
