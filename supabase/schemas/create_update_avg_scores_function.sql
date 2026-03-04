-- Create function to update user's average scores from practice sessions
create or replace function update_avg_scores(uid uuid)
returns jsonb as $$
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
$$ language plpgsql security definer;
