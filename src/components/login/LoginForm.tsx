'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Coffee, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { loginSchema, LoginSchema } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

const CONFIG = {
  MESSAGES: {
    LOGGING_IN: 'Logging in...',
  },
  FORM_FIELDS: [
    {
      name: 'username' as const,
      label: 'Username',
      type: 'text',
      placeholder: 'Enter your username',
      autoComplete: 'username',
    },
    {
      name: 'password' as const,
      label: 'Password',
      type: 'password',
      placeholder: 'Enter your password',
      autoComplete: 'current-password',
    },
  ],
} as const;

const STYLES = {
  input: 'px-4 py-2 text-[16px] rounded-md bg-neutral-50',
  label: 'text-neutral-900 text-[16px]',
  button: 'bg-indigo-600 hover:bg-indigo-700 w-full text-[16px] font-bold text-white rounded-md',
  form: 'w-full max-w-sm space-y-6 bg-indigo-50 rounded-xl p-10 shadow-md relative',
} as const;

const FormFieldComponent = ({ field, isLoading }: { field: (typeof CONFIG.FORM_FIELDS)[number]; isLoading: boolean }) => (
  <FormField
    name={field.name}
    render={({ field: fieldProps }) => (
      <FormItem>
        <FormLabel className={STYLES.label}>{field.label}</FormLabel>
        <FormControl>
          <Input
            {...fieldProps}
            type={field.type}
            disabled={isLoading}
            className={STYLES.input}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default function LoginForm() {
  const { login, isLoading, error: authError } = useAuth();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (credentials: LoginSchema) => {
    try {
      await login(credentials);
    } catch (err) {
      console.error('Login error:', err);
      form.setValue('password', '');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className={STYLES.form}
      >
        <div className="space-y-2 text-center">
          <Coffee className="mx-auto w-12 h-12 text-indigo-600" />
          <h2 className="text-2xl text-indigo-600 font-bold">Login</h2>
        </div>

        {authError && (
          <Alert variant="destructive">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        {CONFIG.FORM_FIELDS.map(field => (
          <FormFieldComponent
            key={field.name}
            field={field}
            isLoading={isLoading}
          />
        ))}

        <Button
          type="submit"
          disabled={isLoading}
          className={STYLES.button}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {CONFIG.MESSAGES.LOGGING_IN}
            </>
          ) : (
            'Login'
          )}
        </Button>
      </form>
    </Form>
  );
}
