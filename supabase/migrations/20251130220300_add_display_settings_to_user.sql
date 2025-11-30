drop policy "Authenticated users can select challenges" on "public"."challenges";

drop policy "Authenticated users can select content types" on "public"."content_types";

drop policy "Authenticated users can select exercises" on "public"."exercises";

drop policy "Authenticated users can select goals" on "public"."goals";

drop policy "Authenticated users can select passages" on "public"."passages";

alter table "public"."users" add column "display_settings" jsonb default '{"fontSize": 48, "fontFamily": "Inter"}'::jsonb;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_avg_scores(uid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  avg_wpm numeric;
  avg_comprehension numeric;
  sessions numeric;
begin
  select count(*), round(avg(wpm)), round(avg(comprehension)) 
  into sessions, avg_wpm, avg_comprehension 
  from practice_sessions 
  where user_id = update_avg_scores.uid;

  update users 
  set current_wpm = avg_wpm, 
      current_comprehension_score = avg_comprehension, 
      total_sessions = sessions 
  where id = update_avg_scores.uid;
  
  return jsonb_build_object(
    'avg_wpm', avg_wpm,
    'avg_comprehension', avg_comprehension
  );
end;
$function$
;


  create policy "Authenticated users can select challenges"
  on "public"."challenges"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Authenticated users can select content types"
  on "public"."content_types"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Authenticated users can select exercises"
  on "public"."exercises"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Authenticated users can select goals"
  on "public"."goals"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Authenticated users can select passages"
  on "public"."passages"
  as permissive
  for select
  to anon, authenticated
using (true);



