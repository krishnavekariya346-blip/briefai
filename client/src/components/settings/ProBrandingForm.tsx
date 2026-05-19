import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import FormField from '../ui/FormField';
import { brandingSchema, type BrandingFormValues } from '../../lib/validation/brandingSchema';

function fieldClass(hasError: boolean) {
  return `input-field ${hasError ? 'input-field-error' : ''}`;
}

export default function ProBrandingForm() {
  const { user, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandingFormValues>({
    resolver: yupResolver(brandingSchema),
    mode: 'onTouched',
    defaultValues: {
      brandingCompanyName: user?.brandingCompanyName ?? '',
      brandingLogoUrl: user?.brandingLogoUrl ?? '',
    },
  });

  useEffect(() => {
    reset({
      brandingCompanyName: user?.brandingCompanyName ?? '',
      brandingLogoUrl: user?.brandingLogoUrl ?? '',
    });
  }, [user?.brandingCompanyName, user?.brandingLogoUrl, reset]);

  const onSubmit = async (values: BrandingFormValues) => {
    await api.patch('/auth/branding', {
      brandingCompanyName: values.brandingCompanyName.trim() || undefined,
      brandingLogoUrl: values.brandingLogoUrl.trim() || undefined,
    });
    await refreshUser();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-slate-400">
        Shown on public proposal links instead of the BriefAI header — your logo and company name.
      </p>

      <FormField
        label="Company / studio name"
        htmlFor="brandingCompanyName"
        error={errors.brandingCompanyName?.message}
      >
        <input
          id="brandingCompanyName"
          type="text"
          className={fieldClass(!!errors.brandingCompanyName)}
          placeholder={user?.name ?? 'Your studio'}
          {...register('brandingCompanyName')}
        />
      </FormField>

      <FormField label="Logo URL" htmlFor="brandingLogoUrl" error={errors.brandingLogoUrl?.message}>
        <input
          id="brandingLogoUrl"
          type="url"
          className={fieldClass(!!errors.brandingLogoUrl)}
          placeholder="https://yoursite.com/logo.png"
          {...register('brandingLogoUrl')}
        />
      </FormField>

      <button type="submit" className="btn-secondary w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save branding'}
      </button>
    </form>
  );
}
