import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormField from '../ui/FormField';
import {
  briefSchema,
  briefDefaultValues,
  type BriefFormValues,
} from '../../lib/validation/briefSchema';

const INDUSTRIES = ['Web Development', 'Design', 'Marketing', 'Consulting', 'Other'];
const PROJECT_TYPES = ['Website', 'Mobile App', 'Branding', 'Consulting', 'Retainer', 'Other'];
const BUDGET_RANGES = ['Under $1,000', '$1,000 – $5,000', '$5,000 – $15,000', '$15,000+'];

interface BriefFormProps {
  onSubmit: (data: BriefFormValues) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
  defaultValues?: Partial<BriefFormValues>;
}

function fieldClass(hasError: boolean) {
  return `input-field ${hasError ? 'input-field-error' : ''}`;
}

export default function BriefForm({
  onSubmit,
  submitting = false,
  submitLabel = 'Save brief',
  defaultValues,
}: BriefFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BriefFormValues>({
    resolver: yupResolver(briefSchema),
    mode: 'onTouched',
    defaultValues: { ...briefDefaultValues, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label="Client name *" htmlFor="clientName" error={errors.clientName?.message}>
          <input
            id="clientName"
            type="text"
            className={fieldClass(!!errors.clientName)}
            placeholder="Acme Corp"
            aria-invalid={!!errors.clientName}
            {...register('clientName')}
          />
        </FormField>

        <FormField label="Client email" htmlFor="clientEmail" error={errors.clientEmail?.message}>
          <input
            id="clientEmail"
            type="email"
            className={fieldClass(!!errors.clientEmail)}
            placeholder="client@company.com"
            aria-invalid={!!errors.clientEmail}
            {...register('clientEmail')}
          />
        </FormField>

        <div className="md:col-span-2">
          <FormField
            label="Project title *"
            htmlFor="projectTitle"
            error={errors.projectTitle?.message}
          >
            <input
              id="projectTitle"
              type="text"
              className={fieldClass(!!errors.projectTitle)}
              placeholder="Website redesign"
              aria-invalid={!!errors.projectTitle}
              {...register('projectTitle')}
            />
          </FormField>
        </div>

        <FormField label="Industry" htmlFor="industry" error={errors.industry?.message}>
          <select
            id="industry"
            className={fieldClass(!!errors.industry)}
            aria-invalid={!!errors.industry}
            {...register('industry')}
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Project type *" htmlFor="projectType" error={errors.projectType?.message}>
          <select
            id="projectType"
            className={fieldClass(!!errors.projectType)}
            aria-invalid={!!errors.projectType}
            {...register('projectType')}
          >
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Budget range *" htmlFor="budgetRange" error={errors.budgetRange?.message}>
          <select
            id="budgetRange"
            className={fieldClass(!!errors.budgetRange)}
            aria-invalid={!!errors.budgetRange}
            {...register('budgetRange')}
          >
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Timeline *" htmlFor="timeline" error={errors.timeline?.message}>
          <input
            id="timeline"
            type="text"
            className={fieldClass(!!errors.timeline)}
            placeholder="e.g. 4 weeks, 7 weeks"
            aria-invalid={!!errors.timeline}
            {...register('timeline')}
          />
        </FormField>

        <div className="md:col-span-2">
          <FormField
            label="Client website"
            htmlFor="clientWebsite"
            error={errors.clientWebsite?.message}
          >
            <input
              id="clientWebsite"
              type="text"
              className={fieldClass(!!errors.clientWebsite)}
              placeholder="https://example.com"
              aria-invalid={!!errors.clientWebsite}
              {...register('clientWebsite')}
            />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField
            label="Deliverables *"
            htmlFor="deliverables"
            error={errors.deliverables?.message}
          >
            <textarea
              id="deliverables"
              rows={4}
              className={`${fieldClass(!!errors.deliverables)} min-h-[100px]`}
              placeholder="List what you'll deliver..."
              aria-invalid={!!errors.deliverables}
              {...register('deliverables')}
            />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField label="Goals *" htmlFor="goals" error={errors.goals?.message}>
            <textarea
              id="goals"
              rows={3}
              className={`${fieldClass(!!errors.goals)} min-h-[80px]`}
              placeholder="What does success look like?"
              aria-invalid={!!errors.goals}
              {...register('goals')}
            />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField label="Constraints" htmlFor="constraints" error={errors.constraints?.message}>
            <textarea
              id="constraints"
              rows={2}
              className={`${fieldClass(!!errors.constraints)} min-h-[60px]`}
              placeholder="Tech stack, brand guidelines..."
              aria-invalid={!!errors.constraints}
              {...register('constraints')}
            />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField
            label="Additional notes"
            htmlFor="additionalNotes"
            error={errors.additionalNotes?.message}
          >
            <textarea
              id="additionalNotes"
              rows={2}
              className={`${fieldClass(!!errors.additionalNotes)} min-h-[60px]`}
              placeholder="Anything else we should know..."
              aria-invalid={!!errors.additionalNotes}
              {...register('additionalNotes')}
            />
          </FormField>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

export type { BriefFormValues };
