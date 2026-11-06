/**
 * The periods in the Choice-Point Month pilot privacy note (/pilot/privacy/). They are the figures in the
 * participants' welcome emails and in section 7 of the vault's Pilot Materials note, and they are the
 * founder's to confirm. If one changes, change it here and in the emails together.
 */
export const PILOT_END_ISO = '2027-01-31';
export const RETENTION_MONTHS = 12;
export const WITHDRAW_DAYS = 7;

const LONG_DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function parseIso(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

function toIso(year: number, month: number, day: number): string {
  return [year, String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
}

/** "2027-01-31" becomes "31 January 2027". */
export function formatLongDate(iso: string): string {
  const { year, month, day } = parseIso(iso);
  return LONG_DATE.format(new Date(Date.UTC(year, month - 1, day)));
}

/** Adds whole months to an ISO date, stopping at the end of a shorter month ("31 Jan" + 1 month is "28 Feb"). */
export function addMonths(iso: string, months: number): string {
  const { year, month, day } = parseIso(iso);
  const index = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(index / 12);
  const targetMonth = (index % 12) + 1;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  return toIso(targetYear, targetMonth, Math.min(day, lastDay));
}
