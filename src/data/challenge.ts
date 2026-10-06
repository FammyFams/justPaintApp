import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

export type ChallengePrompt = {
  day: number;
  // YYYY-MM-DD, a calendar day in the challenge's time zone.
  date: string;
  prompt: string;
};

export type Challenge = {
  name: string;
  hashtag: string;
  timeZone: string;
  startDate: string;
  endDate: string;
  prompts: ChallengePrompt[];
  rules: string[];
};

// From the website (GET /api/app/v1/challenge, a static file there).
export function useChallenge() {
  return useQuery({
    queryKey: ['challenge'],
    queryFn: async () => (await api<{ challenge: Challenge }>('challenge')).challenge,
    // Only changes when the website is redeployed.
    staleTime: 60 * 60 * 1000,
  });
}

export type ChallengeToday =
  | { phase: 'before' }
  | { phase: 'during'; prompt: ChallengePrompt }
  | { phase: 'after' };

// Where the challenge is today, by the calendar in its time zone (the website
// uses Pacific time), not the phone's.
export function challengeToday(challenge: Challenge, now = new Date()): ChallengeToday {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: challenge.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;

  if (today < challenge.startDate) return { phase: 'before' };
  const prompt = challenge.prompts.find((p) => p.date === today);
  return prompt ? { phase: 'during', prompt } : { phase: 'after' };
}
