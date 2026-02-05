-- Phase 2M — Seed starter chef education modules (run once after add-education-modules-phase2m.sql)

INSERT INTO public.education_modules (id, title, role, content, required, created_at)
VALUES
  (
    'mod_standards',
    'Bornfidis Standards & Values',
    'CHEF',
    E'# Bornfidis Standards & Values\n\nWe build trust through consistency and care.\n\n- **Quality first**: Use the best ingredients and methods for every dish.\n- **Community**: Support local farmers and transparent sourcing.\n- **Integrity**: Communicate clearly with clients and the team.\n- **Excellence**: Prep well, show up on time, and follow through.\n\nComplete this module to align with our values before taking bookings.',
    true,
    now()
  ),
  (
    'mod_food_safety',
    'Food Safety & Prep Basics',
    'CHEF',
    E'# Food Safety & Prep Basics\n\n- **Temperature**: Keep hot food hot, cold food cold. Use a thermometer.\n- **Cross-contamination**: Separate raw and cooked; clean surfaces and hands.\n- **Allergens**: Confirm dietary needs and avoid cross-contact.\n- **Prep timeline**: Plan so food is ready on time without sitting unsafe.\n\nRequired for all chefs.',
    true,
    now()
  ),
  (
    'mod_booking_payouts',
    'Booking Flow & Payouts',
    'CHEF',
    E'# Booking Flow & Payouts\n\n- **Confirm** when assigned, **Start prep** when ready, **Mark complete** when the job is done.\n- Use the prep checklist for each booking so nothing is missed.\n- Payouts are processed by admin after job completion; check **Chef → Payouts** for status.\n- Questions? Contact the team before the event.',
    false,
    now()
  )
ON CONFLICT (id) DO NOTHING;
