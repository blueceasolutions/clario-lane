import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Spinner,
} from '@/components'

import { useAuth } from '@/context/auth-provider'
import { catchError } from '@/lib'
import { cn } from '@/lib/utils'
import { useOnboardingStore } from '@/store'
import { AuthValidationSchema } from '@/types'
import type { AnyFieldApi } from '@tanstack/react-form'
import { useForm } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'
import { BookOpen, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

export default function AuthPage({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [authState, setAuthState] = useState<'signin' | 'signup'>('signin')
  const { updateProfile } = useOnboardingStore()
  // const route = useRouter()
  const { login, signup } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const successMessage =
    authState === 'signin' ? 'Logged in successfully' : 'Signed up successfully'

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      // date_of_birth: '',
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
          await signup(rest.email, password, rest.name)
        }
        if (authState === 'signin') {
          await login('email', rest.email, password)
        }

        toast.success(successMessage)
      } catch (error) {
        catchError(error)
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
      await login('google')
    } catch (error) {
      catchError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='w-full max-w-md mx-auto border-none shadow-none  md:shadow-xl rounded-2xl bg-transparent md:bg-white/80 md:dark:bg-zinc-900/80 backdrop-blur-xl'>
        <CardHeader className='text-center space-y-2 pb-6 px-0 md:px-6'>
          <div className='mx-auto bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-2'>
            <BookOpen className='w-6 h-6 text-primary' />
          </div>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            {authState === 'signin' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription className='text-base'>
            {authState === 'signin'
              ? 'Enter your details to sign in to your account'
              : 'Enter your details to create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6 px-0 md:px-6'>
          <div className='grid gap-4'>
            <Button
              variant='outline'
              type='button'
              size={'lg'}
              className='w-full font-medium h-11 bg-white hover:bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-200 dark:border-zinc-700'
              onClick={handleGoogleSignIn}>
              {isSubmitting ? (
                <Spinner />
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    className='mr-2 h-5 w-5'>
                    <path
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      fill='#4285F4'
                    />
                    <path
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      fill='#34A853'
                    />
                    <path
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      fill='#FBBC05'
                    />
                    <path
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      fill='#EA4335'
                    />
                  </svg>
                  {authState === 'signin'
                    ? 'Sign in with Google'
                    : 'Sign up with Google'}
                </>
              )}
            </Button>
          </div>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-gray-200 dark:border-zinc-700' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-white dark:bg-zinc-900 px-2 text-muted-foreground'>
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <FieldGroup>
              {authState === 'signup' ? (
                <>
                  <form.Field
                    name='name'
                    children={(field) => (
                      <Field>
                        <FieldLabel
                          htmlFor={field.name}
                          className='text-sm font-medium'>
                          Full Name
                        </FieldLabel>
                        <Input
                          type='text'
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder='e.g. Will Smith'
                          autoComplete='name'
                          className='h-11'
                          required
                        />
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
                      autoComplete='email'
                      className='h-11'
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
                    <div className='flex items-center justify-between'>
                      <FieldLabel
                        htmlFor={field.name}
                        className='text-sm font-medium'>
                        Password
                      </FieldLabel>
                    </div>
                    <div className='relative'>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        autoComplete={
                          authState === 'signup'
                            ? 'new-password'
                            : 'current-password'
                        }
                        className='h-11 pr-10'
                        required
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
                    {authState === 'signin' && (
                      <div className='flex justify-end mt-1'>
                        <Link
                          to='/auth/forgot-password'
                          className='text-xs font-medium text-primary hover:text-primary/80 hover:underline'>
                          Forgot password?
                        </Link>
                      </div>
                    )}
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
                          placeholder='••••••••'
                          className='h-11'
                          required
                        />
                      </div>
                      <FieldInfo field={field} />
                    </Field>
                  )}
                />
              ) : null}

              <div className='pt-2'>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type='submit'
                      size={'lg'}
                      disabled={!canSubmit}
                      className='w-full h-11 text-base font-semibold shadow-md active:scale-[0.98] transition-transform'>
                      {isSubmitting ? <Spinner className='mr-2' /> : null}
                      {authState === 'signin' ? 'Sign in' : 'Create account'}
                    </Button>
                  )}
                />
              </div>

              <div className='text-center'>
                <span className='text-sm text-muted-foreground'>
                  {authState === 'signin'
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                </span>
                <Button
                  variant='link'
                  className='p-0 h-auto font-semibold text-primary'
                  onClick={toggleAuthState}
                  type='button'>
                  {authState === 'signin' ? 'Sign up' : 'Sign in'}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
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
