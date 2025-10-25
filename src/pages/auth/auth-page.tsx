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
} from "@/components";
import { supabaseService } from "@/integration/supabase/supabase-services";
import { catchError } from "@/lib";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ValidationSchema } from "./type";

export default function AuthPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [authState, setAuthState] = useState<"signin" | "signup">("signin");
  const { updateProfile } = useOnboardingStore();
  const route = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const successMessage =
    authState === "signin"
      ? "Logged in successfully"
      : "Signed up successfully";

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      dateOfBirth: "",
      password: "",
      confirmPassword: "",
      authType: authState,
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    validators: { onBlur: ValidationSchema },
    onSubmit: async ({ value }) => {
      try {
        updateProfile({ ...value });

        if (authState === "signup") {
          await supabaseService.signUp(value.email, value.password, value.name);
        }
        if (authState === "signin") {
          await supabaseService.signIn(value.email, value.password);
        }
        toast.success(successMessage);
        route.invalidate();
        route.navigate({ to: "/onboarding" });
      } catch (error) {
        catchError(error);
      }
    },
  });

  const toggleAuthState = () => {
    setAuthState((prev) => (prev === "signin" ? "signup" : "signin"));
    form.reset();
  };

  const handleSubmit = (event: FormEvent) => {
    event?.preventDefault();
    event.stopPropagation();
    form.handleSubmit();
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await supabaseService.signInWithGoogle();
    } catch (error) {
      catchError(error);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {authState === "signin" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            Continue with your Apple or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleSignIn}
                >
                  {isSubmitting ? (
                    <Spinner />
                  ) : (
                    <>
                      {/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                    </>
                  )}
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              {authState === "signup" ? (
                <>
                  <form.Field
                    name="name"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                        <Input
                          type="text"
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Ikenna Okoro"
                          required
                        />
                        <FieldInfo field={field} />
                      </Field>
                    )}
                  />
                  <form.Field
                    name="dateOfBirth"
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
                name="email"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                    <FieldInfo field={field} />
                  </Field>
                )}
              />
              <form.Field
                name="password"
                children={(field) => (
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Link
                        to="/"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="password"
                      required
                    />
                    <FieldInfo field={field} />
                  </Field>
                )}
              />
              {authState === "signup" ? (
                <form.Field
                  name="confirmPassword"
                  validators={{
                    onBlurListenTo: ["password"],
                    onBlur: ({ value, fieldApi }) => {
                      if (value !== fieldApi.form.getFieldValue("password")) {
                        return "Passwords do not match";
                      }
                      return;
                    },
                  }}
                  children={(field) => (
                    <Field>
                      <div className="flex items-center">
                        <FieldLabel htmlFor={field.name}>
                          Confirm Password
                        </FieldLabel>
                      </div>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="password"
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
                    <Button type="submit" disabled={!canSubmit}>
                      {isSubmitting ? <Spinner /> : null}
                      {authState === "signin" ? " Sign in" : "Create account"}
                    </Button>
                  )}
                />
                <FieldDescription className="text-center">
                  <Button variant="ghost" onClick={toggleAuthState}>
                    {authState === "signin"
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </Button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link to="/">Terms of Service</Link> and{" "}
        <Link to="/">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid
        ? field.state.meta.errors.map((error) => (
            <span
              key={error.message}
              className="text-sm text-red-500 dark:text-red-400"
            >
              {error.message ?? error}
            </span>
          ))
        : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}
