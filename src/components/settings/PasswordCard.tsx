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
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { supabaseService } from '~supabase/clientServices'
import { z } from 'zod'
import { Eye, EyeOff, Lock } from 'lucide-react'

export function PasswordCard() {
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: {
      onMount: z.object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z
          .string()
          .min(6, 'Password must be at least 6 characters'),
      }),
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
      try {
        await supabaseService.updateUserPassword(value.password)
        toast.success('Password updated successfully')
        form.reset()
      } catch (error) {
        catchError(error)
      }
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event?.preventDefault()
    event.stopPropagation()
    form.handleSubmit()
  }

  return (
    <Card className='bg-transparent border-0 shadow-none md:shadow-sm md:bg-card md:border'>
      <CardHeader className='p-0 md:px-6'>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent className=' p-0 md:px-6'>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <form.Field
              name='password'
              children={(field) => (
                <Field>
                  <div className='flex items-center'>
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
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
            <form.Field
              name='confirmPassword'
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
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
                children={([canSubmit, isSubmitting]) => {
                  return (
                    <Button
                      size={'lg'}
                      type='submit'
                      disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? <Spinner /> : 'Update Password'}
                    </Button>
                  )
                }}
              />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
