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

type Props = {
  session: Session
}

export function ProfileMenu(props: Props) {
  const { user_metadata } = props.session.user
  const name = user_metadata.displayName || user_metadata.full_name
  const picture = user_metadata.avatar_url || user_metadata.picture || undefined
  const fallbackInitials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
  const logout = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className='transition hover:scale-105 focus:scale-90 active:scale-90'>
          <AvatarImage src={picture} alt={name} />
          <AvatarFallback className='uppercase'>
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='start'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to='/dashboard'>Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to='/dashboard'>Billing</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link to='/dashboard/settings'>Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link to='/dashboard'>Support</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} variant='destructive'>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
