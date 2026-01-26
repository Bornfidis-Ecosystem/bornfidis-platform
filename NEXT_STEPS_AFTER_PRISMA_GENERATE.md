# Next Steps After Prisma Client Generation ✅

## ✅ What's Complete

1. ✅ Prisma client generated successfully
2. ✅ Schema is valid and synced
3. ✅ Database connection configured

## 🧪 Step 1: Test Database Connection

Test that your database connection works:

```bash
# Visit in browser or use curl:
http://localhost:3000/api/test-db
```

**Expected response:**
```json
{
  "success": true,
  "message": "Database connectivity test passed"
}
```

If you see errors, check:
- `.env.local` has correct `DATABASE_URL`
- Dev server is running
- Database is accessible

## 📊 Step 2: Verify Database Tables Exist

Check if your tables are created in Supabase:

1. Go to Supabase Dashboard → Table Editor
2. Verify these tables exist:
   - ✅ `farmer_intakes`
   - ✅ `farmers` (if Phase 11G.2 is applied)
   - ✅ `farmer_crops` (if Phase 11G.2 is applied)
   - ✅ `intakes` (if you created this separately)

## 🔄 Step 3: Apply Database Migrations (If Needed)

If tables don't exist, apply migrations:

### Option A: Use Prisma Migrate (if DIRECT_URL works)
```bash
npx prisma migrate dev
```

### Option B: Apply Manually via Supabase SQL Editor
1. Open Supabase Dashboard → SQL Editor
2. Copy SQL from: `prisma/migrations/20250122234200_phase11g2_schema_updates/migration.sql`
3. Paste and run
4. Mark as applied: `npx prisma migrate resolve --applied 20250122234200_phase11g2_schema_updates`

## 🧪 Step 4: Test Intake Processing API

Test the Phase 11G.2A intake processing:

```bash
# First, get an intake ID from your database
# Then test processing:
curl -X POST http://localhost:3000/api/intakes/process \
  -H "Content-Type: application/json" \
  -d '{"intakeId": "your-intake-id-here"}'
```

**Expected response:**
```json
{
  "status": "parsed" | "needs_followup",
  "parsed": {
    "name": "...",
    "phone": "...",
    "parish": "...",
    "crops": [...]
  }
}
```

## 📱 Step 5: Test WhatsApp Webhook

1. **Ensure dev server is running:**
   ```bash
   npm run dev
   ```

2. **Set up ngrok (if testing locally):**
   ```bash
   ngrok http 3000
   ```

3. **Update Twilio webhook URL:**
   - Go to Twilio Console → WhatsApp Sandbox
   - Set webhook URL to: `https://your-ngrok-url.ngrok.io/api/whatsapp/inbound`

4. **Send a test WhatsApp message:**
   - Message: "My name is John. I'm in Portland. I grow yam and banana."

5. **Check admin dashboard:**
   - Visit: `http://localhost:3000/admin/intakes`
   - You should see the new intake with parsed data

## 🎯 Step 6: Verify Admin Dashboard

Visit the admin intakes page:

```
http://localhost:3000/admin/intakes
```

**What to check:**
- ✅ Page loads without errors
- ✅ Intakes are displayed in table
- ✅ Status badges show correctly (received, parsed, profile_created, needs_review)
- ✅ Farmer names and parishes display
- ✅ Crop badges show for parsed crops
- ✅ "Reprocess" button works

## 🔧 Step 7: Test Reprocessing (If Implemented)

1. Find an intake with status `needs_review`
2. Click "Reprocess" button
3. Verify status updates to `parsed` or `profile_created`

## 📝 Step 8: Review Phase 11G.2A Implementation

Check that these files exist and work:

- ✅ `lib/intake/types.ts` - Parsing contract
- ✅ `lib/intake/parseIntake.ts` - Deterministic parser
- ✅ `app/api/intakes/process/route.ts` - Processing API
- ✅ `lib/intakeParser.ts` - Original parser (still used by WhatsApp route)

## 🚀 Step 9: Ready for Production?

Before going live:

- [ ] All migrations applied
- [ ] Database connection tested
- [ ] WhatsApp webhook tested
- [ ] Admin dashboard functional
- [ ] Error handling verified
- [ ] Logging in place
- [ ] Environment variables secured

## 🐛 Troubleshooting

### If `/api/test-db` fails:
- Check `.env.local` has `DATABASE_URL`
- Verify connection string format
- Check Supabase project is active

### If migrations fail:
- Use manual SQL application via Supabase SQL Editor
- Check for existing tables/constraints
- Review migration SQL for conflicts

### If WhatsApp webhook doesn't work:
- Check ngrok is running
- Verify Twilio webhook URL is correct
- Check server logs for errors
- Ensure route returns valid TwiML

## 📚 Documentation

- `PHASE11G2A_IMPLEMENTATION.md` - Full Phase 11G.2A details
- `CORRECT_CONNECTION_STRINGS.md` - Database connection guide
- `DATABASE_CONNECTION_CLARIFICATION.md` - Connection troubleshooting

## 🎉 Success Indicators

You're ready when:
- ✅ `/api/test-db` returns success
- ✅ `/admin/intakes` shows data
- ✅ WhatsApp messages create intakes
- ✅ Parsing works correctly
- ✅ Status updates properly

---

**Next Phase:** Once this is working, you can proceed to:
- Phase 11G.2B: AI-enhanced parsing
- Phase 11G.3: WhatsApp Coordinator Hub
- Or continue with other phases
