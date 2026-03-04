import { Link } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { Copyright } from './copyright'

export const Footer = () => {
  return (
    <footer className='bg-card border-t py-12 px-4'>
      <div className='container mx-auto max-w-6xl'>
        <div className='flex flex-wrap justify-between gap-8'>
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <BookOpen className='size-6 text-primary' />
              <span className='text-xl'>Clariolane</span>
            </div>
            <p className='text-sm text-muted-foreground'>
              The clear path to reading mastery.
            </p>
          </div>
          {/* 
          <div className='hidden'>
            <h3 className='mb-4'>Product</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link to='/' className='hover:text-foreground'>
                  Features
                </Link>
              </li>
              <li>
                <Link to='/pricing' className='hover:text-foreground'>
                  Pricing
                </Link>
              </li>
              <li>
                <Link to='/' className='hover:text-foreground'>
                  FAQ
                </Link>
              </li>
            </ul>
          </div> 
          <div className='hidden'>
            <h3 className='mb-4'>Company</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link to='/' className='hover:text-foreground'>
                  About
                </Link>
              </li>
              <li>
                <Link to='/' className='hover:text-foreground'>
                  Contact
                </Link>
              </li>
              <li>
                <Link to='/' className='hover:text-foreground'>
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          */}
          <div>
            <h3 className='mb-4'>Legal</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link to='/privacy-policy' className='hover:text-foreground'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to='/terms-of-service' className='hover:text-foreground'>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='mb-4'>Partners</h3>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <a
                  href='https://affiliate.bluecea.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-foreground'>
                  Bluecea Referral Program
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Copyright />
      </div>
    </footer>
  )
}
