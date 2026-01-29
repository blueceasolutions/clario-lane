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
} from '@/components/'
import { useLogout } from '@/hooks'
import type { Session } from '@supabase/supabase-js'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

type Props = {
  session: Session
}

export function ProfileMenu(props: Props) {
  const [open, setOpen] = useState(false)
  const { user_metadata } = props.session.user
  const name = user_metadata.displayName || user_metadata.full_name
  const picture = user_metadata.avatar_url || user_metadata.picture || undefined
  const fallbackInitials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
  const logout = useLogout()

  const onOpenChanged = () => {
    setOpen((prev) => !prev)
  }

  return (
    <DropdownMenu onOpenChange={onOpenChanged} open={open}>
      <DropdownMenuTrigger asChild>
        <Avatar className='transition hover:scale-105 focus:scale-90 active:scale-90'>
          <AvatarImage src={picture} alt={name} />
          <AvatarFallback className='uppercase'>
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-2xs rounded-xl pb-1' align='center'>
        <DropdownMenuLabel className='font-semibold bg-background/60 text-center'>
          {name || 'My Account'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link
              onClick={onOpenChanged}
              to='/dashboard'
              className='w-full h-full px-2 py-1'>
              Dashboard
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            <Link to='/dashboard/settings'>Billing</Link>
          </DropdownMenuItem> */}
          <DropdownMenuItem>
            <Link
              onClick={onOpenChanged}
              to='/dashboard/settings'
              className='w-full h-full px-2 py-1'>
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          variant='destructive'
          className='rouned-md'>
          <span className='px-2 py-1'>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
