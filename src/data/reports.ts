import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api';

// Reports go through the website (W4), with or without an account, and land
// on its /admin page and in the owner's email. A report is always about a
// painting; a comment is reported on its painting, quoted in the details.

// The website's wording (lib/validations/report.ts there), lowercased.
export const REPORT_REASONS = {
  intimate:
    'intimate or sexual image of me (or someone i represent) shared without consent, including ai fakes',
  minor: 'sexual or exploitative content involving someone under 18',
  harassment: 'harassment, threats, or private information about someone',
  other: 'something else that breaks the rules',
} as const;

export type ReportReason = keyof typeof REPORT_REASONS;

export const REPORT_DETAILS_MAX = 1000;

export type ReportValues = {
  paintingId: string;
  reason: ReportReason | null;
  details: string;
  email: string;
  signature: string;
  goodFaith: boolean;
};

// Resolves to the report's reference number. Quick checks first so an
// unfinished form doesn't use up one of the 5 reports an hour.
export function useSendReport() {
  return useMutation({
    mutationFn: async (values: ReportValues) => {
      if (!values.reason) throw new Error('Pick a reason.');
      if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
        throw new Error('Enter an email we can reply to.');
      }
      if (values.signature.trim().length < 2) {
        throw new Error('Type your full name as your signature.');
      }
      if (!values.goodFaith) throw new Error('Confirm the statement above to send the report.');
      const answer = await api<{ reference: number }>('reports', {
        method: 'POST',
        body: {
          painting: values.paintingId,
          reason: values.reason,
          details: values.details.trim(),
          email: values.email.trim(),
          signature: values.signature.trim(),
          goodFaith: true,
        },
      });
      return answer.reference;
    },
  });
}
