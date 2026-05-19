import type { ProposalContent } from '../../types';

interface ProposalPreviewProps {
  content: ProposalContent | null | undefined;
}

export default function ProposalPreview({ content }: ProposalPreviewProps) {
  if (!content) return null;

  const { pricing } = content;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">{content.title}</h1>
        <p className="mt-4 leading-relaxed text-slate-300">{content.executiveSummary}</p>
      </div>

      {content.scope?.map((phase) => (
        <section key={phase.phase} className="card">
          <h2 className="mb-3 text-lg font-semibold text-brand-300">{phase.phase}</h2>
          <ul className="list-inside list-disc space-y-1 text-slate-300">
            {phase.items?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      {content.timeline?.length > 0 && (
        <section className="card">
          <h2 className="mb-4 text-lg font-semibold text-white">Timeline</h2>
          <div className="space-y-3">
            {content.timeline.map((t, index) => (
              <div
                key={`${t.week}-${index}`}
                className="flex gap-4 border-l-2 border-brand-600 pl-4"
              >
                <span className="w-28 shrink-0 text-sm font-medium text-brand-400">{t.week}</span>
                <span className="text-slate-300">{t.milestone}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.deliverables?.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold text-white">Deliverables</h2>
          <ul className="flex flex-wrap gap-2">
            {content.deliverables.map((d) => (
              <li key={d} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                {d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {pricing && (
        <section className="card border-brand-600/30 bg-gradient-to-br from-brand-600/10 to-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-white">Investment</h2>
          <p className="text-3xl font-bold text-white">
            ${pricing.recommendedTotal?.toLocaleString()}{' '}
            <span className="text-lg font-normal text-slate-400">{pricing.currency}</span>
          </p>
          {pricing.breakdown?.length > 0 && (
            <ul className="mt-4 space-y-2">
              {pricing.breakdown.map((row) => (
                <li key={row.label} className="flex justify-between text-sm text-slate-300">
                  <span>{row.label}</span>
                  <span>${row.amount?.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-sm text-slate-400">{pricing.paymentTerms}</p>
        </section>
      )}

      {content.assumptions?.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Assumptions
          </h2>
          <ul className="list-inside list-disc text-sm text-slate-400">
            {content.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      {content.nextSteps?.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold text-white">Next steps</h2>
          <ol className="list-inside list-decimal space-y-2 text-slate-300">
            {content.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {content.validUntil && (
            <p className="mt-4 text-xs text-slate-500">Valid until: {content.validUntil}</p>
          )}
        </section>
      )}
    </div>
  );
}
