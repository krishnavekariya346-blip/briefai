import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import FormField from '../components/ui/FormField';
import { loginSchema, type LoginFormValues } from '../lib/validation/authSchemas';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError('');
    try {
      await login(values.email.trim().toLowerCase(), values.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your workspace">
      {serverError && <p className="form-error-banner mt-4">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'input-field-error' : ''}`}
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={`input-field ${errors.password ? 'input-field-error' : ''}`}
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </FormField>

        <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        No account?{' '}
        <Link to="/register" className="font-medium text-brand-400 hover:text-brand-300">
          Create one free
        </Link>
      </p>
    </AuthLayout>
  );
}
