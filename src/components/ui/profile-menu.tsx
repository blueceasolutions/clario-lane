import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from '@/components/'
import { useAuth } from '@/context/auth-provider'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'

export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const { session, logout, user } = useAuth()

  if (!session) return <Skeleton className='h-8 w-8 rounded-full' />

  const { user_metadata } = session.user
  const name =
    user?.name || user_metadata.displayName || user_metadata.full_name
  const picture = user_metadata.avatar_url || user_metadata.picture || undefined
  const fallbackInitials = name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)

  const onOpenChanged = () => {
    setOpen((prev) => !prev)
  }

  return (
    <DropdownMenu onOpenChange={onOpenChanged} open={open}>
      <DropdownMenuTrigger asChild>
        <Avatar className='h-9 w-9 cursor-pointer transition-transform hover:scale-105 focus:scale-95 active:scale-95 ring-2 ring-transparent hover:ring-primary/20'>
          <AvatarImage src={picture} alt={name} className='object-cover' />
          <AvatarFallback className='uppercase bg-primary/10 text-primary font-medium text-xs'>
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56 rounded-xl p-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-xl'
        align='end'
        sideOffset={8}>
        <DropdownMenuLabel className='font-normal p-3'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-semibold leading-none text-foreground'>
              {name}
            </p>
            <p className='text-xs leading-none text-muted-foreground truncate'>
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-border/50' />
        <DropdownMenuGroup className='p-1'>
          <DropdownMenuItem
            asChild
            className='rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer'>
            <Link
              onClick={() => setOpen(false)}
              to='/dashboard'
              className='flex w-full items-center gap-2 px-2 py-2 text-sm font-medium'>
              <LayoutDashboard className='h-4 w-4' />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className='rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer'>
            <Link
              onClick={() => setOpen(false)}
              to='/dashboard/settings'
              className='flex w-full items-center gap-2 px-2 py-2 text-sm font-medium'>
              <Settings className='h-4 w-4' />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='bg-border/50' />
        <DropdownMenuItem
          onClick={() => {
            setOpen(false)
            logout()
          }}
          className='rounded-lg text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-600 dark:focus:text-red-400 cursor-pointer p-2 m-1 gap-2'>
          <LogOut className='h-4 w-4 text-inherit' />
          <span className='font-medium text-inherit'>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
