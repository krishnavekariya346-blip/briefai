import * as yup from 'yup';

export const brandingSchema = yup.object({
  brandingCompanyName: yup.string().trim().max(120, 'Company name is too long').default(''),
  brandingLogoUrl: yup
    .string()
    .trim()
    .max(500, 'URL is too long')
    .test('url', 'Enter a valid URL (https://...)', (value) => {
      if (!value) return true;
      return /^https?:\/\/.+/i.test(value);
    })
    .default(''),
});

export type BrandingFormValues = yup.InferType<typeof brandingSchema>;
