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
import { Eye, EyeOff, Lock } from 'lucide-react'

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
    <div>
      <Card className='w-full '>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Set new password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <form.Field
                name='password'
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      hasIcon
                      icon={<Lock />}
                      placeholder='••••••••'
                    />
                    <FieldInfo field={field} />
                  </Field>
                )}
              />
              <form.Field
                name='confirmPassword'
                children={(field) => (
                  <Field>
                    <div className='flex items-center'>
                      <FieldLabel htmlFor={field.name}>
                        Confirm Password
                      </FieldLabel>
                      <Button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        variant='ghost'
                        size='icon'
                        className='ml-auto size-7'>
                        {showPassword ? (
                          <EyeOff className='size-4' />
                        ) : (
                          <Eye className='size-4' />
                        )}
                      </Button>
                    </div>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      required
                      hasIcon
                      icon={<Lock />}
                      placeholder='••••••••'
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
                      {isSubmitting ? <Spinner /> : 'Update Password'}
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
