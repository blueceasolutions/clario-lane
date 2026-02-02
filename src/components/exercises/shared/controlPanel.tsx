import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useEffect, type ReactNode } from 'react'
import { ReaderControls } from './ReaderControls'
import { Button } from '@/components'
import { Settings } from 'lucide-react'
import { DisplaySettings } from './DisplaySettings'
import { ChunkSizeSlider } from '../wordchunking/ChunkSizeSlider'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePracticeStore } from '@/store'
import type { PRACTICES } from '@/lib'
import { supabaseService } from '~supabase/clientServices'
import { useQuery } from '@tanstack/react-query'

type ReaderControlsProps = {
  children?: ReactNode
  canComplete?: boolean
  canReset?: boolean
  onTriggerClick?: () => void
}

const additionalControls: Record<PRACTICES, ReactNode | null> = {
  WORD_CHUNKING: <ChunkSizeSlider />,
  SPEED_READING: null,
  PERIPHERAL_VISION: null,
  TELEPROMPTER: null,
}

export function ControlPanel({
  children,
  canComplete,
  canReset,
  onTriggerClick,
}: ReaderControlsProps) {
  const { exerciseType } = usePracticeStore()
  const { setWpm } = usePracticeStore()

  const { data: userProfile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: () => supabaseService.getUser(),
  })

  const currentWpm = userProfile?.next_wpm || userProfile?.current_wpm || 250

  useEffect(() => {
    if (userProfile) {
      setWpm(currentWpm)
    }
  }, [userProfile])

  return (
    <Drawer direction={window.innerWidth >= 768 ? 'right' : 'bottom'}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger>
            <Button
              className='rounded-full'
              variant={'outline'}
              onClick={onTriggerClick}>
              <Settings />
            </Button>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent className='p-1.5'>
          <span>Settings</span>
        </TooltipContent>
      </Tooltip>
      <DrawerContent className='bg-accent'>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription>Adjust your reading settings</DrawerDescription>
        </DrawerHeader>
        <div className='space-y-1 p-4 mx-auto w-full max-w-2xl py-6  overflow-y-auto'>
          <ReaderControls canComplete={canComplete} canReset={canReset}>
            {children}
          </ReaderControls>
          <DisplaySettings />
          {additionalControls[exerciseType]}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
