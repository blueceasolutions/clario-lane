import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useReferralModal } from '@/hooks/use-referral-modal'
import { Rocket, Users, Target, ArrowRight } from 'lucide-react'

export const ReferralModal = () => {
  const { isOpen, handleOpenChange, closeModal } = useReferralModal()

  const handleJoinClick = () => {
    window.open('https://affiliate.bluecea.com', '_blank')
    closeModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md bg-card text-card-foreground border-border'>
        <DialogHeader className='text-center space-y-4'>
          <div className='mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2'>
            <Rocket className='w-8 h-8 text-primary' />
          </div>
          <DialogTitle className='text-2xl font-bold tracking-tight'>
            Turn Your Network into Net Worth! 🚀
          </DialogTitle>
          <DialogDescription className='text-base text-muted-foreground text-center space-y-4 pt-2'>
            <p>
              Love Clariolane? Share it with your friends, colleagues, or
              audience and earn a generous commission for every new user who
              joins through your link.
            </p>
            <div className='flex justify-center gap-6 py-4'>
              <div className='flex flex-col items-center gap-1'>
                <Users className='w-6 h-6 text-primary mb-1' />
                <span className='text-sm font-medium'>Refer Friends</span>
              </div>
              <div className='flex flex-col items-center gap-1'>
                <Target className='w-6 h-6 text-primary mb-1' />
                <span className='text-sm font-medium'>Hit Goals</span>
              </div>
              <div className='flex flex-col items-center gap-1'>
                <Rocket className='w-6 h-6 text-primary mb-1' />
                <span className='text-sm font-medium'>Earn Big</span>
              </div>
            </div>
            <p className='text-sm font-medium text-foreground pb-2'>
              It's our way of saying thank you for spreading the word!
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-3 sm:flex-row justify-center mt-2'>
          <Button
            variant='outline'
            onClick={closeModal}
            className='w-full sm:w-auto'>
            Maybe Later
          </Button>
          <Button
            onClick={handleJoinClick}
            className='w-full sm:w-auto gap-2 group'>
            Join & Start Earning
            <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
