INSERT INTO public.passages (id, title, difficulty, category, questions, passage)
VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'The History of Coffee',
  'Medium',
  'History',
  '[
    {
      "id": "q1",
      "question": "Where did coffee originate?",
      "options": ["Brazil", "Ethiopia", "Colombia", "Vietnam"],
      "correctIndex": 1
    },
    {
      "id": "q2",
      "question": "What century did coffee reach Europe?",
      "options": ["15th", "16th", "17th", "18th"],
      "correctIndex": 2
    }
  ]'::jsonb,
  '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "The History of Coffee",
    "text": "Coffee grown worldwide can trace its heritage back centuries to the ancient coffee forests on the Ethiopian plateau. There, legend says the goat herder Kaldi first discovered the potential of these beloved beans. The story goes that that Kaldi discovered coffee after he noticed that after eating the berries from a certain tree, his goats became so energetic that they did not want to sleep at night. Kaldi reported his findings to the abbot of the local monastery, who made a drink with the berries and found that it kept him alert through the long hours of evening prayer. The abbot shared his discovery with the other monks at the monastery, and knowledge of the energizing berries began to spread. As word moved east and coffee reached the Arabian peninsula, it began a journey which would bring these beans across the globe.",
    "tags": ["History", "Culture"],
    "difficulty": "Medium",
    "questions": [
      {
        "id": "q1",
        "question": "Where did coffee originate?",
        "options": ["Brazil", "Ethiopia", "Colombia", "Vietnam"],
        "correctIndex": 1
      },
      {
        "id": "q2",
        "question": "What century did coffee reach Europe?",
        "options": ["15th", "16th", "17th", "18th"],
        "correctIndex": 2
      }
    ]
  }'::json
);