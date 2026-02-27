import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldGroup,
  FieldInfo,
  FieldLabel,
  Input,
  Spinner,
} from '@/components'
import { catchError } from '@/lib'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { supabaseService } from '~supabase/clientServices'
import { z } from 'zod'
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onChange: z.object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z
          .string()
          .min(6, 'Password must be at least 6 characters'),
      }),
      onBlur: ({ value }) => {
        if (value.password !== value.confirmPassword) {
          return 'Passwords do not match'
        }
        return undefined
      },
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        await supabaseService.updateUserPassword(value.password)
        toast.success('Password updated successfully')
        router.navigate({ to: '/auth' })
      } catch (error) {
        catchError(error)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event?.preventDefault()
    event.stopPropagation()
    form.handleSubmit()
  }

  return (
    <div className='flex flex-col gap-6'>
      <Card className='w-full max-w-md mx-auto border-none shadow-xl rounded-2xl bg-transparent md:bg-white/80 md:dark:bg-zinc-900/80 backdrop-blur-xl'>
        <CardHeader className='text-center space-y-2 pb-6 px-0 md:px-6'>
          <div className='mx-auto bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-2'>
            <Lock className='w-6 h-6 text-primary' />
          </div>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            Set new password
          </CardTitle>
          <CardDescription className='text-base'>
            Enter your new password below to update your account
          </CardDescription>
        </CardHeader>
        <CardContent className='px-0 md:px-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <FieldGroup>
              <form.Field
                name='password'
                children={(field) => (
                  <Field>
                    <div className='flex items-center justify-between'>
                      <FieldLabel
                        htmlFor={field.name}
                        className='text-sm font-medium'>
                        New Password
                      </FieldLabel>
                    </div>
                    <div className='relative'>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder='••••••••'
                        className='h-11 pr-10'
                      />
                      <Button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        variant='ghost'
                        size='icon'
                        className='absolute right-0 top-0 h-11 w-11 hover:bg-transparent text-muted-foreground'>
                        {showPassword ? (
                          <EyeOff className='size-4' />
                        ) : (
                          <Eye className='size-4' />
                        )}
                      </Button>
                    </div>
                    <FieldInfo field={field} />
                  </Field>
                )}
              />
              <form.Field
                name='confirmPassword'
                children={(field) => (
                  <Field>
                    <FieldLabel
                      htmlFor={field.name}
                      className='text-sm font-medium'>
                      Confirm Password
                    </FieldLabel>
                    <div className='relative'>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder='••••••••'
                        className='h-11'
                      />
                    </div>
                    <FieldInfo field={field} />
                  </Field>
                )}
              />
              <div className='pt-2'>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit]) => (
                    <Button
                      type='submit'
                      disabled={!canSubmit || isSubmitting}
                      className='w-full h-11 text-base font-semibold shadow-md active:scale-[0.98] transition-transform'
                      size='lg'>
                      {isSubmitting ? (
                        <Spinner className='mr-2' />
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  )}
                />
              </div>
              <div className='text-center'>
                <Link
                  to='/auth'
                  className='text-sm font-medium text-primary hover:text-primary/80 hover:underline flex items-center justify-center gap-2'>
                  <ArrowLeft className='w-4 h-4' />
                  Back to Sign In
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
