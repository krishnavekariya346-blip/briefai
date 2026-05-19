import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import FormField from '../components/ui/FormField';
import { registerSchema, type RegisterFormValues } from '../lib/validation/authSchemas';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError('');
    try {
      await registerUser(values.name.trim(), values.email.trim().toLowerCase(), values.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="3 free AI proposals every month — no card required"
    >
      {serverError && <p className="form-error-banner mt-4">{serverError}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={`input-field ${errors.name ? 'input-field-error' : ''}`}
            placeholder="Alex Morgan"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'input-field-error' : ''}`}
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={`input-field ${errors.password ? 'input-field-error' : ''}`}
            placeholder="Min. 8 characters"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
