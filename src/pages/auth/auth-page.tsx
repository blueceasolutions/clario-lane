import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DatePicker,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  Input,
  Spinner,
} from '@/components'

import { catchError } from '@/lib'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/store'
import { AuthValidationSchema } from '@/types'
import type { AnyFieldApi } from '@tanstack/react-form'
import { useForm } from '@tanstack/react-form'
import { Link, useRouter } from '@tanstack/react-router'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

import { supabaseService } from '~supabase/clientServices'

export default function AuthPage({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [authState, setAuthState] = useState<'signin' | 'signup'>('signin')
  const { updateProfile } = useOnboardingStore()
  const route = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const successMessage =
    authState === 'signin' ? 'Logged in successfully' : 'Signed up successfully'

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      date_of_birth: '',
      password: '',
      confirmPassword: '',
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    validators: { onBlur: AuthValidationSchema },
    onSubmit: async ({ value: { confirmPassword, password, ...rest } }) => {
      try {
        updateProfile({ ...rest })

        if (authState === 'signup') {
          await supabaseService.signUp(rest.email, password, rest.name)
        }
        if (authState === 'signin') {
          await supabaseService.signIn(rest.email, password)
        }
        toast.success(successMessage)
      } catch (error) {
        catchError(error)
      } finally {
        route.invalidate()
      }
    },
  })

  const toggleAuthState = () => {
    setAuthState((prev) => (prev === 'signin' ? 'signup' : 'signin'))
    form.reset()
  }

  const handleSubmit = (event: FormEvent) => {
    event?.preventDefault()
    event.stopPropagation()
    form.handleSubmit()
  }

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)
    try {
      await supabaseService.signInWithGoogle()
    } catch (error) {
      catchError(error)
    } finally {
      route.invalidate()
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>
            {authState === 'signin' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>Continue with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  variant='outline'
                  type='button'
                  size={'lg'}
                  onClick={handleGoogleSignIn}>
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <>
                      {/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 24 24'>
                        <path
                          d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                          fill='currentColor'
                        />
                      </svg>
                    </>
                  )}
                  {authState === 'signin'
                    ? 'Login with Google'
                    : 'Sign up with Google'}
                </Button>
              </Field>
              <FieldSeparator className='*:data-[slot=field-separator-content]:bg-card'>
                Or continue with
              </FieldSeparator>
              {authState === 'signup' ? (
                <>
                  <form.Field
                    name='name'
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                        <Input
                          type='text'
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder='Ikenna Okoro'
                          required
                        />
                        <FieldInfo field={field} />
                      </Field>
                    )}
                  />
                  <form.Field
                    name='date_of_birth'
                    children={(field) => (
                      <Field>
                        <DatePicker field={field} />
                        <FieldInfo field={field} />
                      </Field>
                    )}
                  />
                </>
              ) : null}
              <form.Field
                name='email'
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      icon={<Mail />}
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
              <form.Field
                name='password'
                children={(field) => (
                  <Field>
                    <div className='flex items-center'>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <div className='ml-auto flex gap-2'>
                        <Link
                          to='/auth/forgot-password'
                          className='text-sm underline-offset-4 hover:underline'>
                          Forgot your password?
                        </Link>
                      </div>
                    </div>
                    <Input
                      id={field.name}
                      hasIcon
                      icon={<Lock />}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder='••••••••'
                      required
                    />
                    <FieldInfo field={field} />
                  </Field>
                )}
              />
              {authState === 'signup' ? (
                <form.Field
                  name='confirmPassword'
                  validators={{
                    onBlurListenTo: ['password'],
                    onBlur: ({ value, fieldApi }) => {
                      if (value !== fieldApi.form.getFieldValue('password')) {
                        return 'Passwords do not match'
                      }
                      return
                    },
                  }}
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
                        hasIcon
                        icon={<Lock />}
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        required
                      />
                      <FieldInfo field={field} />
                    </Field>
                  )}
                />
              ) : null}
              <Field>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button type='submit' size={'lg'} disabled={!canSubmit}>
                      {isSubmitting ? <Spinner /> : null}
                      {authState === 'signin' ? ' Sign in' : 'Create account'}
                    </Button>
                  )}
                />
                <FieldDescription className='text-center'>
                  <Button variant='ghost' onClick={toggleAuthState}>
                    {authState === 'signin'
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Sign in'}
                  </Button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className='px-6 text-center'>
        By clicking continue, you agree to our{' '}
        <Link to='/'>Terms of Service</Link> and{' '}
        <Link to='/'>Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid
        ? field.state.meta.errors.map((error) => (
            <span
              key={error.message}
              className='text-sm text-red-500 dark:text-red-400'>
              {error.message ?? error}
            </span>
          ))
        : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}
