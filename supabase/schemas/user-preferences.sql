create table "public"."user_preferences" (
    "user_id" uuid not null references auth.users(id) on delete cascade,
    "theme" text not null default 'light',
    "font_face" text not null default 'Inter',
    "font_size_scale" float not null default 100,
    "bionic_reading" boolean not null default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    primary key ("user_id")
);

alter table "public"."user_preferences" enable row level security;

create policy "Users can view their own preferences"
on "public"."user_preferences"
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own preferences"
on "public"."user_preferences"
for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
on "public"."user_preferences"
for insert
to authenticated
with check (auth.uid() = user_id);

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
before update on public.user_preferences
for each row
execute procedure public.handle_updated_at();