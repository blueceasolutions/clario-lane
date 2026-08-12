-- Head-to-head reading race: room-code-paired two-player races. See
-- supabase/schemas/zz_reading_races.sql for the declarative source of
-- truth this mirrors.

create table "public"."reading_race_results" (
    "race_id" uuid not null,
    "user_id" uuid not null,
    "wpm" numeric not null,
    "comprehension" numeric not null,
    "finished_at" timestamp with time zone not null default now()
);

alter table "public"."reading_race_results" enable row level security;

create table "public"."reading_races" (
    "id" uuid not null default gen_random_uuid(),
    "room_code" text not null,
    "passage_id" uuid not null,
    "creator_id" uuid not null,
    "opponent_id" uuid,
    "status" text not null default 'waiting'::text,
    "started_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
);

alter table "public"."reading_races" enable row level security;

CREATE UNIQUE INDEX reading_race_results_pkey ON public.reading_race_results USING btree (race_id, user_id);

CREATE UNIQUE INDEX reading_races_pkey ON public.reading_races USING btree (id);

CREATE UNIQUE INDEX reading_races_room_code_key ON public.reading_races USING btree (room_code);

alter table "public"."reading_race_results" add constraint "reading_race_results_pkey" PRIMARY KEY using index "reading_race_results_pkey";

alter table "public"."reading_races" add constraint "reading_races_pkey" PRIMARY KEY using index "reading_races_pkey";

alter table "public"."reading_race_results" add constraint "reading_race_results_race_id_fkey" FOREIGN KEY (race_id) REFERENCES public.reading_races(id) ON DELETE CASCADE not valid;

alter table "public"."reading_race_results" validate constraint "reading_race_results_race_id_fkey";

alter table "public"."reading_race_results" add constraint "reading_race_results_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reading_race_results" validate constraint "reading_race_results_user_id_fkey";

alter table "public"."reading_races" add constraint "reading_races_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reading_races" validate constraint "reading_races_creator_id_fkey";

alter table "public"."reading_races" add constraint "reading_races_opponent_id_fkey" FOREIGN KEY (opponent_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reading_races" validate constraint "reading_races_opponent_id_fkey";

alter table "public"."reading_races" add constraint "reading_races_passage_id_fkey" FOREIGN KEY (passage_id) REFERENCES public.passages(id) ON DELETE CASCADE not valid;

alter table "public"."reading_races" validate constraint "reading_races_passage_id_fkey";

alter table "public"."reading_races" add constraint "reading_races_room_code_key" UNIQUE using index "reading_races_room_code_key";

alter table "public"."reading_races" add constraint "reading_races_status_check" CHECK ((status = ANY (ARRAY['waiting'::text, 'racing'::text, 'finished'::text]))) not valid;

alter table "public"."reading_races" validate constraint "reading_races_status_check";

CREATE OR REPLACE FUNCTION public.check_race_finished()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if (select count(*) from reading_race_results where race_id = new.race_id) >= 2 then
    update reading_races set status = 'finished' where id = new.race_id and status = 'racing';
  end if;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_race()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.join_race(p_room_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

revoke execute on function public.create_race() from public;
grant execute on function public.create_race() to authenticated;

revoke execute on function public.join_race(text) from public;
grant execute on function public.join_race(text) to authenticated;

grant delete on table "public"."reading_race_results" to "anon";
grant insert on table "public"."reading_race_results" to "anon";
grant references on table "public"."reading_race_results" to "anon";
grant select on table "public"."reading_race_results" to "anon";
grant trigger on table "public"."reading_race_results" to "anon";
grant truncate on table "public"."reading_race_results" to "anon";
grant update on table "public"."reading_race_results" to "anon";

grant delete on table "public"."reading_race_results" to "authenticated";
grant insert on table "public"."reading_race_results" to "authenticated";
grant references on table "public"."reading_race_results" to "authenticated";
grant select on table "public"."reading_race_results" to "authenticated";
grant trigger on table "public"."reading_race_results" to "authenticated";
grant truncate on table "public"."reading_race_results" to "authenticated";
grant update on table "public"."reading_race_results" to "authenticated";

grant delete on table "public"."reading_race_results" to "service_role";
grant insert on table "public"."reading_race_results" to "service_role";
grant references on table "public"."reading_race_results" to "service_role";
grant select on table "public"."reading_race_results" to "service_role";
grant trigger on table "public"."reading_race_results" to "service_role";
grant truncate on table "public"."reading_race_results" to "service_role";
grant update on table "public"."reading_race_results" to "service_role";

grant delete on table "public"."reading_races" to "anon";
grant insert on table "public"."reading_races" to "anon";
grant references on table "public"."reading_races" to "anon";
grant select on table "public"."reading_races" to "anon";
grant trigger on table "public"."reading_races" to "anon";
grant truncate on table "public"."reading_races" to "anon";
grant update on table "public"."reading_races" to "anon";

grant delete on table "public"."reading_races" to "authenticated";
grant insert on table "public"."reading_races" to "authenticated";
grant references on table "public"."reading_races" to "authenticated";
grant select on table "public"."reading_races" to "authenticated";
grant trigger on table "public"."reading_races" to "authenticated";
grant truncate on table "public"."reading_races" to "authenticated";
grant update on table "public"."reading_races" to "authenticated";

grant delete on table "public"."reading_races" to "service_role";
grant insert on table "public"."reading_races" to "service_role";
grant references on table "public"."reading_races" to "service_role";
grant select on table "public"."reading_races" to "service_role";
grant trigger on table "public"."reading_races" to "service_role";
grant truncate on table "public"."reading_races" to "service_role";
grant update on table "public"."reading_races" to "service_role";

create policy "Participants can submit their own race result"
on "public"."reading_race_results"
as permissive
for insert
to authenticated
with check (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM public.reading_races r
  WHERE ((r.id = reading_race_results.race_id) AND (r.status = 'racing'::text) AND ((r.creator_id = auth.uid()) OR (r.opponent_id = auth.uid())))))));

create policy "Participants can view their race's results"
on "public"."reading_race_results"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM public.reading_races r
  WHERE ((r.id = reading_race_results.race_id) AND ((r.creator_id = auth.uid()) OR (r.opponent_id = auth.uid()))))));

create policy "Users can view races they're in, or open ones"
on "public"."reading_races"
as permissive
for select
to authenticated
using (((auth.uid() = creator_id) OR (auth.uid() = opponent_id) OR (status = 'waiting'::text)));

CREATE TRIGGER on_race_result_insert AFTER INSERT ON public.reading_race_results FOR EACH ROW EXECUTE FUNCTION public.check_race_finished();

alter publication supabase_realtime add table "public"."reading_races";
