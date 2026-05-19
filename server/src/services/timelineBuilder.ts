import type { IBrief } from '../models/Brief.js';
import type { ProposalContent } from '../types/index.js';

export type TimelineEntry = ProposalContent['timeline'][number];

/** Parse "7 weeks", "4 week", "6-8 weeks" from the brief timeline field. */
export function parseDurationWeeks(timeline: string): number | null {
  const t = timeline.trim();
  if (!t) return null;
  const range = t.match(/(\d+)\s*[-–]\s*(\d+)\s*weeks?/i);
  if (range) return parseInt(range[2], 10);
  const single = t.match(/(\d+)\s*weeks?/i);
  if (single) return parseInt(single[1], 10);
  return null;
}

function isDurationOnlyText(text: string): boolean {
  return /^\d+\s*[-–]?\d*\s*weeks?$/i.test(text.trim()) || /^ASAP$/i.test(text.trim());
}

/** Build a logical week-by-week timeline from total project duration. */
export function buildTimelineFromBrief(brief: IBrief): TimelineEntry[] {
  const totalWeeks = parseDurationWeeks(brief.timeline);

  if (totalWeeks && totalWeeks >= 2) {
    if (totalWeeks === 2) {
      return [
        { week: 'Week 1', milestone: 'Discovery, planning & design direction' },
        { week: 'Week 2', milestone: 'Build, review & final delivery' },
      ];
    }
    if (totalWeeks === 3) {
      return [
        { week: 'Week 1', milestone: 'Discovery & planning' },
        { week: 'Week 2', milestone: 'Design & development' },
        { week: 'Week 3', milestone: 'QA, revisions & sign-off' },
      ];
    }

    const buildEnd = totalWeeks - 1;
    return [
      { week: 'Week 1', milestone: 'Discovery, kickoff & project plan' },
      {
        week: buildEnd === 2 ? 'Week 2' : `Weeks 2–${buildEnd}`,
        milestone: 'Design, development & client feedback cycles',
      },
      { week: `Week ${totalWeeks}`, milestone: 'Final QA, handoff & sign-off' },
    ];
  }

  // Non-numeric timelines (e.g. "End of Q2", "ASAP")
  const label = brief.timeline.trim() || 'Project duration';
  return [
    { week: 'Phase 1', milestone: 'Discovery & planning' },
    {
      week: 'Phase 2',
      milestone: `Execution (${label}) — core deliverables per scope`,
    },
    { week: 'Phase 3', milestone: 'Delivery, revisions & sign-off' },
  ];
}

/** Fix AI/mock rows where milestone is just "7 weeks" or week label is vague "Final". */
export function normalizeTimeline(
  timeline: TimelineEntry[],
  brief: IBrief
): TimelineEntry[] {
  const needsRebuild =
    timeline.length === 0 ||
    timeline.some(
      (row) =>
        isDurationOnlyText(row.milestone) ||
        /^final$/i.test(row.week.trim()) ||
        (row.week.toLowerCase().includes('week 2') &&
          isDurationOnlyText(row.milestone))
    );

  if (needsRebuild) {
    return buildTimelineFromBrief(brief);
  }

  const total = parseDurationWeeks(brief.timeline);
  return timeline.map((row) => ({
    week: /^final$/i.test(row.week.trim())
      ? total
        ? `Week ${total}`
        : 'Final phase'
      : row.week,
    milestone: isDurationOnlyText(row.milestone)
      ? 'Design, development & client reviews'
      : row.milestone,
  }));
}

export function applyTimelineRules(
  content: ProposalContent,
  brief: IBrief
): ProposalContent {
  return {
    ...content,
    timeline: normalizeTimeline(content.timeline ?? [], brief),
  };
}
