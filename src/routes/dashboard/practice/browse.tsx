import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components'
import {
  fetchPassagesLibrary,
  fetchPractices,
} from '@/integration'
import {
  filterPassages,
  getAvailableDifficulties,
  getAvailableTags,
  LENGTH_BUCKET_LABELS,
  PRACTICE_ICONS,
  PRACTICES,
  PRACTICE_ROUTES,
  splitIntoWords,
  type LengthBucket,
} from '@/lib'
import { usePracticeStore, useAppStore } from '@/store'
import type { Passage } from '@/types'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'

export const Route = createFileRoute('/dashboard/practice/browse')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(fetchPassagesLibrary)
    await context.queryClient.ensureQueryData(fetchPractices)
  },
})

const ALL = '__all__'

const MODES: PRACTICES[] = [
  PRACTICES.enum.SPEED_READING,
  PRACTICES.enum.TELEPROMPTER,
  PRACTICES.enum.WORD_CHUNKING,
]

const MODE_LABELS: Record<PRACTICES, string> = {
  SPEED_READING: 'Speed Reading',
  TELEPROMPTER: 'Teleprompter',
  WORD_CHUNKING: 'Word Chunking',
}

function RouteComponent() {
  const { data: passages } = useQuery(fetchPassagesLibrary)
  const { data: practices } = useQuery(fetchPractices)

  const [difficulty, setDifficulty] = useState<string>(ALL)
  const [tag, setTag] = useState<string>(ALL)
  const [length, setLength] = useState<string>(ALL)
  const [mode, setMode] = useState<PRACTICES>(PRACTICES.enum.SPEED_READING)

  const setSelectedPassage = usePracticeStore((s) => s.setSelectedPassage)
  const setExerciseType = usePracticeStore((s) => s.setExerciseType)
  const setActivePractice = useAppStore((s) => s.setActivePractice)
  const navigate = useNavigate()

  const allPassages = useMemo(() => passages ?? [], [passages])
  const availableTags = useMemo(() => getAvailableTags(allPassages), [
    allPassages,
  ])
  const availableDifficulties = useMemo(
    () => getAvailableDifficulties(allPassages),
    [allPassages],
  )

  const filtered = useMemo(
    () =>
      filterPassages(allPassages, {
        difficulty: difficulty === ALL ? null : difficulty,
        tag: tag === ALL ? null : tag,
        length: length === ALL ? null : (length as LengthBucket),
      }),
    [allPassages, difficulty, tag, length],
  )

  const handleStart = (passage: (typeof allPassages)[number]) => {
    const practice = practices?.find((p) => p.exercise === mode)
    if (practice) setActivePractice(practice)

    setExerciseType(mode)
    setSelectedPassage({
      id: passage.id,
      text: passage.text,
      title: passage.title,
      category: passage.tags[0] ?? '',
      difficulty: passage.difficulty as Passage['difficulty'],
      questions: (passage.questions ?? []) as Passage['questions'],
    })
    // Route is built from PRACTICE_ROUTES (keyed by the PRACTICES enum) at
    // runtime, so the router's literal-union `to` type can't verify it at
    // compile time -- same load-bearing cast as StartPracticeCard.
    navigate({ to: `${PRACTICE_ROUTES[mode]}/browsed` as any })
  }

  return (
    <motion.div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Browse Passages</h2>
        <p className='text-muted-foreground text-sm mt-1'>
          Pick a specific passage instead of a random one.
        </p>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-3'>
        <Select value={mode} onValueChange={(v) => setMode(v as PRACTICES)}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Practice mode' />
          </SelectTrigger>
          <SelectContent>
            {MODES.map((m) => (
              <SelectItem key={m} value={m}>
                {MODE_LABELS[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Difficulty' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All difficulties</SelectItem>
            {availableDifficulties.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger className='w-[160px]'>
            <SelectValue placeholder='Topic' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All topics</SelectItem>
            {availableTags.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={length} onValueChange={setLength}>
          <SelectTrigger className='w-[220px]'>
            <SelectValue placeholder='Length' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any length</SelectItem>
            {(Object.keys(LENGTH_BUCKET_LABELS) as LengthBucket[]).map(
              (bucket) => (
                <SelectItem key={bucket} value={bucket}>
                  {LENGTH_BUCKET_LABELS[bucket]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className='text-center text-muted-foreground py-16'>
          No passages match those filters.
        </p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filtered.map((passage) => {
            const wordCount = splitIntoWords(passage.text).length
            const Icon = PRACTICE_ICONS[mode]
            return (
              <Card key={passage.id} className='flex flex-col'>
                <CardContent className='p-5 flex flex-col gap-3 flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <h3 className='font-semibold leading-snug'>
                      {passage.title}
                    </h3>
                    <Badge variant='outline' className='shrink-0'>
                      {passage.difficulty}
                    </Badge>
                  </div>

                  <p className='text-sm text-muted-foreground line-clamp-3 flex-1'>
                    {passage.text}
                  </p>

                  <div className='flex flex-wrap gap-1.5'>
                    {passage.tags.map((t) => (
                      <Badge key={t} variant='secondary' className='text-xs'>
                        {t}
                      </Badge>
                    ))}
                  </div>

                  <p className='text-xs text-muted-foreground'>
                    {wordCount.toLocaleString()} words
                  </p>

                  <Button
                    onClick={() => handleStart(passage)}
                    className='w-full gap-2'>
                    <Icon className='w-4 h-4' />
                    Practice this
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
