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
import { createFileRoute, Link } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { supabaseService } from '~supabase/clientServices'
import { ArrowLeft, Lock } from 'lucide-react'
import { z } from 'zod'

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onChange: z.object({
        email: z.string().email('Please enter a valid email address'),
      }),
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true)
      try {
        await supabaseService.resetPasswordForEmail(value.email)
        toast.success('Password reset link sent to your email')
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
            Forgot password?
          </CardTitle>
          <CardDescription className='text-base'>
            Enter your email address and we'll send you a link to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent className='px-0 md:px-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <FieldGroup>
              <form.Field
                name='email'
                children={(field) => (
                  <Field>
                    <FieldLabel
                      htmlFor={field.name}
                      className='text-sm font-medium'>
                      Email
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type='email'
                      placeholder='email@example.com'
                      className='h-11'
                      required
                    />
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
                        'Send Reset Link'
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
