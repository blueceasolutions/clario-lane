insert into passages (tags, text, title, difficulty, questions) values
(
  ARRAY['non-fiction', 'self-improvement', 'motivational'],
  'People often overestimate what they can achieve in a day and underestimate what they can build in a year. Consistency is the bridge between vision and reality. It’s not about working harder for a short burst—it’s about showing up, again and again, with intention.\n\nThe most successful people aren’t always the most talented; they’re the ones who learned to stay the course. They understand that small, repeated actions shape massive outcomes over time. Writing a page a day turns into a book. Saving a little each month becomes financial freedom. Ten minutes of daily practice transforms into mastery.\n\nConsistency isn’t glamorous. It’s quiet, patient, and often overlooked because progress feels slow. But it builds momentum, trust, and resilience—the kind that outlasts failure and fatigue.\n\nThe truth is, excellence doesn’t come from intensity; it comes from persistence. Every time you follow through on your promise to yourself, you reinforce your belief that you can. And that belief, more than any burst of motivation, is what carries you forward.',
  'The Quiet Power of Consistency',
  'Medium',
  '[
    {
      "question": "According to the passage, what is the main role of consistency?",
      "options": [
        "To achieve instant success",
        "To bridge the gap between vision and reality",
        "To replace talent entirely",
        "To provide temporary motivation"
      ],
      "correctIndex": 1
    },
    {
      "question": "What is an example given in the passage of how small repeated actions lead to large outcomes?",
      "options": [
        "Writing a page a day leads to a book",
        "Exercising once a week leads to mastery",
        "Saving all your money at once leads to financial freedom",
        "Working intensely for one month leads to expertise"
      ],
      "correctIndex": 0
    },
    {
      "question": "Why does the passage describe consistency as ''quiet'' and ''patient''?",
      "options": [
        "Because it always produces immediate results",
        "Because it is often overlooked and progress feels slow",
        "Because it relies on external validation",
        "Because it requires no effort"
      ],
      "correctIndex": 1
    },
    {
      "question": "According to the author, what carries you forward more than motivation?",
      "options": [
        "Talent",
        "Belief reinforced by persistence",
        "Luck",
        "Intense effort"
      ],
      "correctIndex": 1
    },
    {
      "question": "What does the passage suggest about the most successful people?",
      "options": [
        "They are always the most talented",
        "They stay the course and practice persistence",
        "They rely on bursts of inspiration",
        "They avoid consistent daily habits"
      ],
      "correctIndex": 1
    }
  ]'::jsonb
),
(
  ARRAY['non-fiction', 'self-improvement', 'motivational'],
  'Success rarely arrives in a single burst of brilliance—it’s built quietly, through the habit of showing up. Most people wait for motivation, but motivation is fickle. It fades when things get hard. Discipline, however, endures.\n\nShowing up doesn’t always mean performing at your best; it means being present, even when you don’t feel like it. Writers who sit down to write every morning, athletes who train despite exhaustion, entrepreneurs who keep pushing through uncertainty—they all share the same truth: consistency compounds.\n\nEvery small effort plants a seed. You might not see results today, or even next week, but persistence rewires your mind. It turns effort into instinct. Over time, the act of showing up becomes less about willpower and more about identity—you begin to see yourself as the kind of person who follows through.\n\nThe gap between average and exceptional isn’t talent; it’s endurance. The world rewards those who keep going long after the excitement fades. So, the next time you’re tempted to skip the work, remind yourself: showing up is the real victory. Everything else grows from there.',
  'The Discipline of Showing Up',
  'Easy',
  '[
    {
      "question": "According to the passage, what is the main difference between motivation and discipline?",
      "options": [
        "Motivation is stronger than discipline",
        "Motivation is temporary, but discipline lasts",
        "Discipline requires excitement to begin",
        "Motivation and discipline mean the same thing"
      ],
      "correctIndex": 1
    },
    {
      "question": "What does ''showing up'' primarily mean in the passage?",
      "options": [
        "Always performing perfectly",
        "Being present and consistent, even when you don’t feel like it",
        "Only working when you feel inspired",
        "Focusing on results rather than effort"
      ],
      "correctIndex": 1
    },
    {
      "question": "What does the author suggest happens over time through persistence?",
      "options": [
        "Effort becomes instinct",
        "Motivation increases",
        "Success becomes automatic",
        "Discipline becomes unnecessary"
      ],
      "correctIndex": 0
    },
    {
      "question": "What does the author identify as the true gap between average and exceptional people?",
      "options": [
        "Talent",
        "Luck",
        "Endurance",
        "Resources"
      ],
      "correctIndex": 2
    },
    {
      "question": "What is described as ''the real victory'' in the passage?",
      "options": [
        "Winning awards",
        "Finishing first",
        "Showing up and staying consistent",
        "Gaining recognition from others"
      ],
      "correctIndex": 2
    }
  ]'::jsonb
),
(
  ARRAY['fiction', 'mystery', 'supernatural'],
  'The rain hadn’t stopped for three days, and the sound of it on the rusted tin roof echoed through the empty station. Verran used to be alive once—before the mines closed, before the trains stopped running. Now, only one train came through each month, and no one ever seemed to board it.\n\nEli waited anyway. He sat on the same cracked wooden bench, clutching his leather satchel like it held the last of his soul. Inside was a letter—yellowed, creased, and never sent. It was addressed to someone who’d been gone twenty years: Clara.\n\nThe clock on the wall had stopped at 11:47 a long time ago, but when the faint whistle sounded in the distance, it flickered once, then began to tick again. The rails trembled. A dim light appeared through the fog, slicing through the night like a blade.\n\nWhen the train finally screeched to a stop, its metal body shone wet and silver, untouched by rust or time. Eli stood, heart pounding, and stepped toward it. The doors slid open with a sigh. Inside, rows of passengers sat silently, faces pale as moonlight.\n\nHe recognized her instantly—Clara, sitting by the window, looking just as she did before she left for the city, before the letters stopped. She smiled faintly, patting the seat beside her.\n\nEli hesitated, the rain soaking through his coat. Then he stepped aboard.\n\nThe doors closed behind him, and the whistle blew once more.\n\nBy morning, Verran Station was empty again. The rain had stopped. The clock still ticked at 11:47, and on the bench lay Eli’s satchel—empty, save for a small note:\n\n“I finally caught the train.”',
  'The Last Train from Verran Station',
  'Medium',
  '[
    {
      "question": "Why was Eli waiting at Verran Station?",
      "options": [
        "To send a letter to Clara",
        "To board the last remaining train",
        "To meet someone arriving from the city",
        "To escape the rain"
      ],
      "correctIndex": 1
    },
    {
      "question": "What significant event caused Verran Station to become deserted?",
      "options": [
        "A storm destroyed the station",
        "The mines closed and trains stopped running",
        "The townspeople moved to the city",
        "A fire burned down the nearby village"
      ],
      "correctIndex": 1
    },
    {
      "question": "What was inside Eli’s leather satchel?",
      "options": [
        "A photograph of Clara",
        "Money and train tickets",
        "A letter addressed to Clara",
        "A journal of his memories"
      ],
      "correctIndex": 2
    },
    {
      "question": "What unusual thing happened when the train whistle sounded?",
      "options": [
        "The rain stopped suddenly",
        "The clock started ticking again",
        "The lights in the station went out",
        "Eli woke up from a dream"
      ],
      "correctIndex": 1
    },
    {
      "question": "What was found on the bench after the train departed?",
      "options": [
        "Eli’s umbrella",
        "A torn photograph",
        "Eli’s empty satchel with a note",
        "A rusted train ticket"
      ],
      "correctIndex": 2
    }
  ]'::jsonb
);