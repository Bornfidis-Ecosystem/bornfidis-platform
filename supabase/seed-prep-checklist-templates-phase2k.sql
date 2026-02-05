-- Phase 2K — Seed default prep checklist templates (run once after add-prep-checklist-phase2k.sql)

INSERT INTO public.prep_checklist_templates (id, name, items, created_at)
VALUES
  (
    'tpl_standard_service',
    'Standard Service',
    '[
      {"label": "Ingredients checked", "required": true},
      {"label": "Equipment ready", "required": true},
      {"label": "Menu reviewed", "required": true},
      {"label": "Travel confirmed", "required": true}
    ]'::jsonb,
    now()
  ),
  (
    'tpl_event_catering',
    'Event / Catering',
    '[
      {"label": "Headcount confirmed", "required": true},
      {"label": "Prep timeline set", "required": true},
      {"label": "Food safety check", "required": true},
      {"label": "Backup plan", "required": false}
    ]'::jsonb,
    now()
  )
ON CONFLICT DO NOTHING;
