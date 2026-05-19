import * as yup from 'yup';

const optionalEmail = yup
  .string()
  .trim()
  .test('email', 'Enter a valid email address', (value) => {
    if (!value) return true;
    return yup.string().email().isValidSync(value);
  })
  .default('');

const optionalUrl = yup
  .string()
  .trim()
  .test('url', 'Enter a valid URL (include https://)', (value) => {
    if (!value) return true;
    try {
      const withProtocol = value.startsWith('http') ? value : `https://${value}`;
      new URL(withProtocol);
      return true;
    } catch {
      return false;
    }
  })
  .default('');

export const briefSchema = yup.object({
  clientName: yup.string().trim().required('Client name is required'),
  clientEmail: optionalEmail,
  projectTitle: yup.string().trim().required('Project title is required'),
  industry: yup.string().required('Industry is required'),
  projectType: yup.string().required('Project type is required'),
  budgetRange: yup.string().required('Budget range is required'),
  timeline: yup.string().trim().required('Timeline is required'),
  deliverables: yup
    .string()
    .trim()
    .required('Deliverables are required')
    .min(10, 'Please describe deliverables in more detail'),
  goals: yup
    .string()
    .trim()
    .required('Goals are required')
    .min(10, 'Please describe project goals in more detail'),
  constraints: yup.string().trim().default(''),
  clientWebsite: optionalUrl,
  additionalNotes: yup.string().trim().default(''),
});

export type BriefFormValues = yup.InferType<typeof briefSchema>;

export const briefDefaultValues: BriefFormValues = {
  clientName: '',
  clientEmail: '',
  projectTitle: '',
  industry: 'Web Development',
  projectType: 'Website',
  budgetRange: '$1,000 – $5,000',
  timeline: '',
  deliverables: '',
  goals: '',
  constraints: '',
  clientWebsite: '',
  additionalNotes: '',
};
