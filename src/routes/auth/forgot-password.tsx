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
    <div>
      <Card className='w-full '>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Forgot password?</CardTitle>
          <CardDescription>
            Enter your email address to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <form.Field
                name='email'
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type='email'
                      placeholder='email@example.com'
                      required
                    />
                    <FieldInfo field={field} />
                  </Field>
                )}
              />
              <Field>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit]) => (
                    <Button type='submit' disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? <Spinner /> : 'Send Reset Link'}
                    </Button>
                  )}
                />
              </Field>
              <div className='text-center text-sm'>
                <Link
                  to='/auth'
                  className='font-medium text-primary hover:underline'>
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
