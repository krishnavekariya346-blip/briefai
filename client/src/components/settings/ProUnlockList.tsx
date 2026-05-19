interface ProUnlockListProps {
  features?: string[];
  title?: string;
}

const DEFAULT_FEATURES = [
  'Unlimited AI proposals per month',
  'Enhanced AI (richer scope, pricing, and detail)',
  'Stripe payment links when you publish (with Stripe test keys)',
  'Custom logo and company name on client proposal links',
  'Email notifications (welcome, publish, client delivery, payments)',
];

export default function ProUnlockList({
  features = DEFAULT_FEATURES,
  title = 'What you unlock with Pro',
}: ProUnlockListProps) {
  return (
    <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-4">
      <p className="text-sm font-semibold text-brand-200">{title}</p>
      <ul className="mt-3 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-slate-300">
            <span className="shrink-0 text-brand-400">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
