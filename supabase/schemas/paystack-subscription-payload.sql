-- Paystack payloads table with RLS (service role only)
create table if not exists paystack_subscription_payloads (
    id uuid primary key default gen_random_uuid(),
    user_id uuid null references auth.users(id) on delete set null,
    payload jsonb not null default '{}'::jsonb,
    created_at timestamptz default now()
);

-- Enable RLS
alter table paystack_subscription_payloads enable row level security;

-- RLS Policies for paystack_subscription_payloads table (service role only)
create policy "Service role can manage paystack subscription payloads"
on paystack_subscription_payloads for all
to service_role
using (true)
with check (true);
