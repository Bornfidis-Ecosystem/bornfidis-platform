# BORNFIDIS SECURITY & PRIVACY

## Environment Security

### Environment Variable Rules:
1. **NEVER hardcode** API keys, passwords, or secrets in code
2. Use `.env.local` for local development (gitignored)
3. Use Vercel environment variables for production
4. Rotate sensitive credentials quarterly
5. Use separate keys for development and production

### Sensitive Variables (Server-Side Only):
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `ADMIN_PASSWORD`

### Public Variables (Safe for Client):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (limited permissions via RLS)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

---

## Form Security

### Spam Protection:
1. **Honeypot Field:** Hidden field that bots fill but humans don't
```html
   <input type="text" name="website_url" style="display:none" />
```
   Reject submission if this field is not empty

2. **Rate Limiting:** Max 3 submissions per IP per hour
   - Implement via Vercel Edge Middleware or Upstash Redis
   - Return 429 error if exceeded

3. **Email Domain Validation:**
   - Block known spam domains (temp-mail.org, etc.)
   - Maintain blocklist in environment or Supabase

4. **CAPTCHA (Phase 2):**
   - Add hCaptcha or Cloudflare Turnstile for high-risk traffic
   - Only show if rate limit triggered or suspicious patterns detected

### Input Validation:
- **Client-Side:** Immediate feedback, UX improvement
- **Server-Side:** Security boundary (NEVER trust client)
- Use Zod for schema validation
- Sanitize all text inputs (prevent XSS)
- Validate file uploads (Phase 2+)

---

## Database Security

### Row Level Security (RLS):
- **Enable RLS** on all tables
- Public role can only INSERT (submit forms)
- Authenticated role (admin) can SELECT/UPDATE
- Service role has full access (server-side only)

### SQL Injection Prevention:
- Use Supabase client methods (parameterized queries)
- Never concatenate user input into SQL strings
- Validate all inputs before database operations

### Data Encryption:
- **In Transit:** HTTPS enforced (Vercel + Supabase default)
- **At Rest:** Supabase encrypts database at rest
- **Sensitive Fields:** Consider encryption for notes containing PII

---

## Authentication & Authorization

### Phase 1 (Temporary):
- Admin dashboard protected by environment variable password
- Simple check in admin layout component
- **Good for:** MVP, single admin user
- **Limitations:** Not scalable, no user management

### Phase 2 (Proper Auth):
- Implement Supabase Auth
- Email + password login for admin
- Session management
- Role-based access (admin, staff, viewer)
- Multi-factor authentication (optional)

### Admin Access Rules:
- Admin routes: `/admin/*`
- Require authentication check in layout
- Redirect to login if not authenticated
- Log admin actions (who updated what, when)

---

## API Security

### API Route Protection:
```typescript
// Example: Protected API route
export async function POST(request: Request) {
  // 1. Check authentication
  const session = await getServerSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // 2. Validate input
  const body = await request.json();
  const validated = schema.safeParse(body);
  if (!validated.success) {
    return new Response('Invalid input', { status: 400 });
  }
  
  // 3. Execute logic
  // ...
}
```

### CORS Configuration:
- Restrict API calls to own domain only
- Set proper CORS headers in Next.js config
- For webhooks (Stripe): validate webhook signatures

### Webhook Security (Stripe):
```typescript
// Verify Stripe webhook signature
const signature = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
// Only process if signature valid
```

---

## Data Privacy & Compliance

### Privacy Policy (Required - Simple Version):

**What we collect:**
- Name, email, phone number (for event coordination)
- Event details (date, location, preferences)
- Payment information (processed by Stripe, not stored by us)

**Why we collect it:**
- To coordinate your event and provide our services
- To send booking confirmations and updates
- To process payments securely

**How long we keep it:**
- Active bookings: Indefinitely
- Completed events: 2 years
- Financial records: 7 years (tax compliance)

**Who we share it with:**
- No one. Your data stays with Bornfidis.
- Exception: Payment processor (Stripe) for secure transactions

**Your rights:**
- Request a copy of your data
- Request deletion (honored within 30 days)
- Opt out of marketing emails anytime

**Contact:** brian@bornfidis.com

### GDPR Compliance (If Serving EU Customers):
- Add cookie consent banner (Phase 2)
- Provide data export functionality
- Honor deletion requests within 30 days
- Document data processing activities

### Data Breach Response Plan:
1. Identify scope of breach
2. Secure systems immediately
3. Notify affected users within 72 hours
4. Report to authorities if required (GDPR, state laws)
5. Document incident and response

---

## Code Security Best Practices

### Dependency Management:
- Run `npm audit` regularly
- Update dependencies monthly
- Use Dependabot (GitHub) for automated security updates
- Review changes before updating major versions

### Secret Scanning:
- Use GitHub secret scanning (automatic)
- Run `git secrets` before committing
- Never commit `.env.local` or similar files

### Code Review Checklist:
- [ ] No hardcoded secrets
- [ ] All inputs validated
- [ ] SQL injection prevention (use ORM/parameterized queries)
- [ ] XSS prevention (sanitize outputs)
- [ ] Authentication checks on protected routes
- [ ] Error messages don't leak sensitive info

---

## Error Handling & Logging

### Error Messages:
- **User-facing:** Generic, helpful ("Something went wrong. Please try again.")
- **Server logs:** Detailed (full error, stack trace, context)
- Never expose system details to users

### Logging Strategy:
- Log all API requests (timestamp, endpoint, status)
- Log authentication attempts (success/failure)
- Log admin actions (who changed what)
- Use Vercel logs (built-in) or external service (Sentry, LogRocket)

### Sensitive Data in Logs:
- Never log passwords, API keys, or payment details
- Redact sensitive fields (email → `b***@example.com`)
- Implement log retention policy (90 days standard)

---

## Deployment Security

### Vercel Security:
- Enable "Automatically expose System Environment Variables" (OFF for secrets)
- Use environment-specific variables (dev, preview, production)
- Enable "Vercel Authentication" for preview deployments (if sharing links)

### GitHub Security:
- Enable two-factor authentication (2FA)
- Use branch protection rules (require reviews for main)
- Limit repository access (only necessary team members)
- Use deploy keys instead of personal tokens

### Domain Security:
- Enable DNSSEC (if registrar supports)
- Use strong DNS provider (Cloudflare recommended)
- Set up CAA records (restrict certificate authorities)

---

## Monitoring & Alerts

### What to Monitor:
- Uptime (Vercel handles, but use external monitor like UptimeRobot)
- Error rates (spike in 500 errors = investigate)
- Form submissions (sudden spike = potential spam attack)
- Database usage (approaching limits)

### Alert Setup (Phase 2):
- Email alerts for downtime
- Slack/Discord webhook for errors
- Daily summary reports (submissions, quotes, conversions)

---

## Incident Response Plan

### If Site Goes Down:
1. Check Vercel status page
2. Check Supabase status page
3. Review recent deployments (rollback if needed)
4. Check error logs
5. Notify customers if extended outage (email/social media)

### If Data Breach Suspected:
1. **STOP** - Secure systems immediately
2. Identify what data was accessed
3. Change all credentials
4. Review access logs
5. Notify affected users
6. Document incident thoroughly

### If Spam Attack Detected:
1. Enable CAPTCHA immediately
2. Tighten rate limits
3. Review and block malicious IPs
4. Clean database of spam submissions
5. Investigate vulnerability that allowed attack

---

## Compliance Checklist

### Before Launch:
- [ ] Privacy policy published
- [ ] Contact email for privacy requests listed
- [ ] HTTPS enabled (Vercel default)
- [ ] Environment variables secured
- [ ] Database RLS policies active
- [ ] Spam protection implemented
- [ ] Admin routes password-protected
- [ ] Error messages sanitized

### After Launch (Ongoing):
- [ ] Review dependencies monthly
- [ ] Rotate admin password quarterly
- [ ] Review access logs monthly
- [ ] Test backup/restore process
- [ ] Update privacy policy if services change
- [ ] Monitor for security advisories