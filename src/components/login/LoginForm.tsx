'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Coffee, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { loginSchema, LoginSchema } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import LoadingOverlay from '../LoadingOverlay';

/**
 * Constants for configuration
 */
const CONFIG = {
  TIMEOUTS: {
    LOGIN: 15000,
    SLOW_CONNECTION: 3000,
  },
  MESSAGES: {
    SLOW_CONNECTION: 'Slow connection detected. Please wait...',
    LOGGING_IN: 'Logging in...',
    LOGIN_TIMEOUT: 'Login timeout. Please check your connection and try again.',
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

/**
 * Common styles
 */
const STYLES = {
  input: 'px-4 py-2 text-[16px] rounded-md bg-neutral-50',
  label: 'text-neutral-900 text-[16px]',
  button: 'bg-indigo-600 hover:bg-indigo-700 w-full text-[16px] font-bold text-white rounded-md',
  form: 'w-full max-w-sm space-y-6 bg-indigo-50 rounded-xl p-10 shadow-md relative',
} as const;

/**
 * FormField component to reduce repetition in form fields
 */
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

/**
 * LoginForm Component
 * Handles user authentication with timeout and slow connection detection
 */
export default function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsSlowConnection(false);
      setShowOverlay(false);
    }
  }, [isLoading]);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleLogin = async (timeoutId: NodeJS.Timeout, slowConnectionTimer: NodeJS.Timeout) => {
    clearTimeout(timeoutId);
    clearTimeout(slowConnectionTimer);
  };

  const onSubmit: SubmitHandler<LoginSchema> = async data => {
    let timeoutId: NodeJS.Timeout | undefined;
    let slowConnectionTimer: NodeJS.Timeout | undefined;

    try {
      slowConnectionTimer = setTimeout(() => {
        setIsSlowConnection(true);
        setShowOverlay(true);
      }, CONFIG.TIMEOUTS.SLOW_CONNECTION);

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(CONFIG.MESSAGES.LOGIN_TIMEOUT));
        }, CONFIG.TIMEOUTS.LOGIN);
      });

      await Promise.race([login(data), timeoutPromise]);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      if (slowConnectionTimer) clearTimeout(slowConnectionTimer);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const renderAlert = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    if (isSlowConnection) {
      return (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">{CONFIG.MESSAGES.SLOW_CONNECTION}</AlertDescription>
        </Alert>
      );
    }
    return null;
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

        {renderAlert()}

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

      {showOverlay && <LoadingOverlay message={isSlowConnection ? CONFIG.MESSAGES.SLOW_CONNECTION : CONFIG.MESSAGES.LOGGING_IN} />}
    </Form>
  );
}
