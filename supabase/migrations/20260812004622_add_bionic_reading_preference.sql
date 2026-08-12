-- Adds the bionic-reading display toggle alongside the existing
-- theme/font_face/font_size_scale preferences.
alter table public.user_preferences
  add column if not exists bionic_reading boolean not null default false;
