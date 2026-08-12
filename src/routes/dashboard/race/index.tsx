import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components'
import { createRaceMutation, joinRaceMutation } from '@/integration'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Swords } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/race/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')

  const { mutate: createRace, isPending: isCreating } = useMutation({
    ...createRaceMutation,
    onSuccess: (data) => {
      navigate({ to: '/dashboard/race/$raceId', params: { raceId: data.race_id } })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create a race')
    },
  })

  const { mutate: joinRace, isPending: isJoining } = useMutation({
    ...joinRaceMutation,
    onSuccess: (data) => {
      navigate({ to: '/dashboard/race/$raceId', params: { raceId: data.race_id } })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to join that race')
    },
  })

  return (
    <motion.div className='space-y-6 max-w-xl mx-auto'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          Head-to-Head Race
        </h2>
        <p className='text-muted-foreground text-sm mt-1'>
          Read the same passage as someone else, at the same time, and see
          who comes out ahead on speed and comprehension.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Swords className='w-5 h-5' />
            Start a Race
          </CardTitle>
          <CardDescription>
            Get a room code to share with whoever you're racing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className='w-full'
            disabled={isCreating}
            onClick={() => createRace()}>
            {isCreating ? 'Creating…' : 'Create a Race'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join a Race</CardTitle>
          <CardDescription>
            Got a room code from someone else? Enter it here.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <Label htmlFor='room-code'>Room Code</Label>
          <Input
            id='room-code'
            placeholder='e.g. AB3D9K'
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            className='uppercase tracking-widest'
          />
          <Button
            variant='outline'
            disabled={isJoining || roomCode.trim().length === 0}
            onClick={() => joinRace(roomCode.trim())}>
            {isJoining ? 'Joining…' : 'Join Race'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
