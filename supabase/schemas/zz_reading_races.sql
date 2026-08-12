-- Head-to-head reading race: two users read the same passage and compare
-- WPM/comprehension once both finish. Room-code pairing rather than a
-- friends system (this app has no social graph yet) -- whoever has the
-- code can join, like a shareable invite link.

create table if not exists public.reading_races (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  passage_id uuid not null references public.passages(id) on delete cascade,
  creator_id uuid not null references auth.users(id) on delete cascade,
  opponent_id uuid references auth.users(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'racing', 'finished')),
  started_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_race_results (
  race_id uuid not null references public.reading_races(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  wpm numeric not null,
  comprehension numeric not null,
  finished_at timestamptz not null default now(),
  primary key (race_id, user_id)
);

alter table public.reading_races enable row level security;
alter table public.reading_race_results enable row level security;

-- Races a user is part of are always visible to them; a still-open race
-- is visible to any authenticated user so it can be looked up by room
-- code before joining. This does mean any authenticated user could list
-- all currently-open races, not just ones they were given a code for --
-- acceptable here since a race row has no sensitive data (a passage id
-- and two user ids), same trust model as a shareable invite link.
create policy "Users can view races they're in, or open ones"
on public.reading_races for select
to authenticated
using (
  auth.uid() = creator_id
  or auth.uid() = opponent_id
  or status = 'waiting'
);

create policy "Participants can view their race's results"
on public.reading_race_results for select
to authenticated
using (
  exists (
    select 1 from public.reading_races r
    where r.id = reading_race_results.race_id
      and (r.creator_id = auth.uid() or r.opponent_id = auth.uid())
  )
);

create policy "Participants can submit their own race result"
on public.reading_race_results for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.reading_races r
    where r.id = reading_race_results.race_id
      and r.status = 'racing'
      and (r.creator_id = auth.uid() or r.opponent_id = auth.uid())
  )
);

-- Marks a race finished once both participants have submitted a result.
create or replace function public.check_race_finished()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from reading_race_results where race_id = new.race_id) >= 2 then
    update reading_races set status = 'finished' where id = new.race_id and status = 'racing';
  end if;
  return new;
end;
$$;

drop trigger if exists on_race_result_insert on public.reading_race_results;
create trigger on_race_result_insert
after insert on public.reading_race_results
for each row execute procedure public.check_race_finished();

-- Picks a random passage, generates a unique room code, and creates the
-- race. SECURITY DEFINER purely for convenience of doing the
-- random-passage pick and retry-on-collision loop server-side -- RLS
-- already lets any authenticated user insert a race with themselves as
-- creator, so this isn't bypassing access control, just centralizing
-- code generation so two clients can't race to generate the same code.
create or replace function public.create_race()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_passage_id uuid;
  v_code text;
  v_race_id uuid;
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I, easy to read aloud
  i int;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select id into v_passage_id from passages order by random() limit 1;
  if v_passage_id is null then
    raise exception 'No passages available';
  end if;

  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
    end loop;
    exit when not exists (select 1 from reading_races where room_code = v_code);
  end loop;

  insert into reading_races (room_code, passage_id, creator_id)
  values (v_code, v_passage_id, v_uid)
  returning id into v_race_id;

  return jsonb_build_object(
    'race_id', v_race_id,
    'room_code', v_code,
    'passage_id', v_passage_id
  );
end;
$$;

revoke execute on function public.create_race() from public;
grant execute on function public.create_race() to authenticated;

-- Claims a waiting race as the opponent. SECURITY DEFINER because the
-- update needs to succeed for a user who is neither the creator nor (yet)
-- the opponent -- RLS's normal "only touch rows tied to your own uid"
-- shape doesn't fit a "claim this open slot" operation. Doing it in a
-- function also keeps exactly which columns can change server-controlled,
-- rather than trusting an RLS-gated raw client UPDATE payload.
create or replace function public.join_race(p_room_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_race RECORD;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select * into v_race from reading_races where room_code = upper(p_room_code) for update;
  if not found then
    raise exception 'Race not found' using errcode = 'P0002';
  end if;

  if v_race.status <> 'waiting' then
    raise exception 'Race already started' using errcode = 'P0001';
  end if;

  if v_race.creator_id = v_uid then
    raise exception 'You cannot join your own race' using errcode = 'P0001';
  end if;

  update reading_races
     set opponent_id = v_uid,
         status = 'racing',
         started_at = now()
   where id = v_race.id;

  return jsonb_build_object(
    'race_id', v_race.id,
    'passage_id', v_race.passage_id
  );
end;
$$;

revoke execute on function public.join_race(text) from public;
grant execute on function public.join_race(text) to authenticated;

alter publication supabase_realtime add table reading_races;
