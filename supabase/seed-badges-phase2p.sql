-- Phase 2P — Seed v1 badges (run once after add-badges-phase2p.sql)

INSERT INTO public.badges (id, name, criteria, role)
VALUES
  ('badge_certified_chef', 'Certified Chef', 'Complete all required education modules.', 'CHEF'),
  ('badge_food_safety_ready', 'Food Safety Ready', 'Complete the Food Safety & Prep Basics module.', 'CHEF'),
  ('badge_on_time_pro', 'On-Time Pro', '≥95% on-time completion on last 10 jobs.', 'CHEF'),
  ('badge_prep_perfect', 'Prep Perfect', '100% prep checklist completion on last 5 jobs.', 'CHEF')
ON CONFLICT (id) DO NOTHING;
