/**
 * Demo/dummy data is authored with fixed calendar dates (e.g. "2026-06-18").
 * Left as-is, that data silently ages out of "last 7 days" / "last 30 days"
 * dashboard filters as real time passes, and each record's authored date can
 * be weeks apart from the others — so a single "shift everything by one
 * offset" pass still leaves most records outside a 7-day window.
 *
 * This instead rebases *per record*: each record gets its own day-offset,
 * chosen deterministically (from the record's id/index) so its primary
 * anchor date always lands within the last `DEFAULT_FILTER_WINDOW_DAYS`
 * days of "today" — every time the app runs, on every page load, forever.
 * Every other ISO date/datetime string found in that same record is shifted
 * by the identical offset, so relative spacing within a record (invoice
 * date vs. reminder date vs. stage-change date) stays exactly as authored.
 *
 * Call once per exported mock array, passing a function that extracts each
 * record's primary anchor date string (the field actually used by
 * `isWithinDateRange` for that list — e.g. `r => r.created_at`).
 */

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?$/;

// Conversation entries in the Accounts Receivable mock data use
// "DD/MM/YYYY HH:MM" timestamps (see ConversationEntry.timestamp in
// src/lib/supabase/receivables.ts) instead of ISO — shift those too, or
// every email/WhatsApp/call thread silently falls outside the 7-day filter
// even after the record's own created_at/updated_at gets rebased.
const DMY_DATE_RE = /^(\d{2})\/(\d{2})\/(\d{4})( \d{2}:\d{2})?$/;

/** How many days back the dashboards' default filter looks — see ClientWrapper's dateRange initial state. */
const DEFAULT_FILTER_WINDOW_DAYS = 7;

function parseIsoDateOnly(y: string, m: string, d: string): number {
  return Date.UTC(Number(y), Number(m) - 1, Number(d));
}

function toUtcDayStart(value: string): number | null {
  const isoMatch = value.match(ISO_DATE_RE);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return parseIsoDateOnly(y, m, d);
  }
  const dmyMatch = value.match(DMY_DATE_RE);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return parseIsoDateOnly(y, m, d);
  }
  return null;
}

function shiftIsoString(value: string, dayOffset: number): string {
  const isoMatch = value.match(ISO_DATE_RE);
  if (isoMatch) {
    const [, y, m, d, timePart] = isoMatch;
    const dt = new Date(parseIsoDateOnly(y, m, d));
    dt.setUTCDate(dt.getUTCDate() + dayOffset);
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dt.getUTCDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}${timePart ?? ''}`;
  }

  const dmyMatch = value.match(DMY_DATE_RE);
  if (dmyMatch) {
    const [, d, m, y, timePart] = dmyMatch;
    const dt = new Date(parseIsoDateOnly(y, m, d));
    dt.setUTCDate(dt.getUTCDate() + dayOffset);
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dt.getUTCDate()).padStart(2, '0');
    return `${dd}/${mm}/${yy}${timePart ?? ''}`;
  }

  return value;
}

function shiftAllIsoStrings<T>(value: T, dayOffset: number): T {
  if (typeof value === 'string') {
    return shiftIsoString(value, dayOffset) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => shiftAllIsoStrings(item, dayOffset)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      out[key] = shiftAllIsoStrings((value as Record<string, unknown>)[key], dayOffset);
    }
    return out as T;
  }
  return value;
}

/** Simple deterministic hash so the same record always gets the same target day. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Rebases every record in `records` so each one's primary anchor date
 * (from `getAnchor`) lands within the last `DEFAULT_FILTER_WINDOW_DAYS`
 * days of today — deterministically, so a given record always maps to the
 * same relative recency on every load. All other ISO date/datetime strings
 * in that record shift by the same offset, preserving relative spacing.
 *
 * `getId` picks a stable per-record key (e.g. `r => r.id`) used to seed the
 * deterministic day placement, so re-renders/re-imports are stable.
 */
export function rebaseRecordsToRecentWindow<T>(
  records: T[],
  getAnchor: (record: T) => string | null | undefined,
  getId: (record: T) => string | number
): T[] {
  const todayUtc = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );

  return records.map((record) => {
    const anchorValue = getAnchor(record);
    if (!anchorValue) return record;
    const anchorDay = toUtcDayStart(anchorValue);
    if (anchorDay === null) return record;

    // Deterministic target: spread across days 0..(WINDOW-1) back from today,
    // skewed slightly so most records land in days 1-6 (reads more natural
    // than everything bunched on "today").
    const id = String(getId(record));
    const targetDaysBack = hashString(id) % DEFAULT_FILTER_WINDOW_DAYS;
    const targetDay = todayUtc - targetDaysBack * 86_400_000;

    const dayOffset = Math.round((targetDay - anchorDay) / 86_400_000);
    if (dayOffset === 0) return record;
    return shiftAllIsoStrings(record, dayOffset);
  });
}

/**
 * Back-compat helper: rebases a whole dataset (object of arrays, or a single
 * array) by one shared offset computed from `anchors`. Prefer
 * `rebaseRecordsToRecentWindow` for lists where each record should
 * independently land in the last-7-days window; use this only when every
 * record in `data` must shift together by the same amount (e.g. a single
 * record, or records that must stay mutually consistent).
 */
export function rebaseMockDates<T>(data: T, anchors: Array<string | null | undefined>): T {
  const anchorTimes = anchors
    .map((a) => (a ? toUtcDayStart(a) : null))
    .filter((t): t is number => t !== null);

  if (anchorTimes.length === 0) return data;

  const newestAnchor = Math.max(...anchorTimes);
  const todayUtc = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );
  const targetNewest = todayUtc - 1 * 86_400_000;
  const dayOffset = Math.round((targetNewest - newestAnchor) / 86_400_000);

  if (dayOffset === 0) return data;
  return shiftAllIsoStrings(data, dayOffset);
}
