# Bornfidis Provisions - Cursor AI Rules

## Project Context
Premium chef services booking platform. Faith-anchored, professional, clean design.

## Brand Guidelines
- Colors: Forest green (#2C5F2D), Gold (#D4AF37), Cream (#F8F6F3)
- Fonts: Montserrat (headings), Lora (body)
- Tone: Professional, warm, grounded, faith-anchored (not preachy)
- Voice: Active ("We build"), specific, confident, no hype

## Code Standards
- TypeScript strict mode (no `any` types)
- Next.js App Router (no Pages Router)
- Server Components by default, Client only when needed
- Tailwind CSS (no inline styles)
- Mobile-first responsive design
- Accessibility: semantic HTML, ARIA labels, keyboard navigation

## File Organization
- Components: Reusable UI in /components/ui, feature-specific in /components/[feature]
- Server Actions: Prefer over API routes when possible
- Database: All queries through Supabase client, never raw SQL strings
- Types: Centralized in /types, imported consistently

## Security Requirements
- Never hardcode secrets or API keys
- Validate all inputs server-side (even if validated client-side)
- Use environment variables for all sensitive data
- Implement RLS on all Supabase tables
- Sanitize user inputs to prevent XSS

## Error Handling
- User-facing errors: Generic, helpful messages
- Server logs: Detailed errors with context
- Always handle promise rejections
- Show loading states during async operations
- Graceful degradation (form works even if JS disabled)

## Performance
- Lazy load heavy components
- Optimize images (Next.js Image component)
- Minimize bundle size (dynamic imports)
- Cache static data
- Server-side render when possible

## Testing Requirements
- Type check passes: `npm run type-check`
- Build succeeds: `npm run build`
- No console errors in production
- Form submissions tested end-to-end
- Mobile responsive verified

## Documentation
- README.md kept up to date
- Complex logic includes comments
- API routes documented with JSDoc
- Environment variables in .env.example

## Version Control
- Commit after each working feature
- Clear commit messages (feat/fix/docs/refactor)
- Never commit .env.local or secrets
- Keep .gitignore updated

## When Generating Code
1. Follow these rules strictly
2. Ask for clarification if requirements unclear
3. Implement incrementally (one feature at a time)
4. Provide explanation for complex logic
5. Include error handling from the start
6. Write TypeScript types, not `any`
7. Prioritize security and validation
8. Make components reusable when possible