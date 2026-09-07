/**
 * ICS / iCalendar export utility.
 *
 * Converts CalendarEvent arrays into downloadable .ics files.
 * Minimal RFC 5545 subset: VCALENDAR + VEVENT with DTSTART, DTEND, SUMMARY,
 * DESCRIPTION, LOCATION, and TIMEZONE-ID.
 */

export interface ExportEvent {
  title: string;
  description?: string;
  start_time: string;   // nanos since epoch
  end_time: string;     // nanos since epoch
  timezone?: string;
  location?: string;
}

/** nanos → YYYYMMDDTHHMMSS in UTC. ICS mandates this form for floating/local times. */
function nanosToIcsDate(nanos: string): string {
  const ms = Number(BigInt(nanos) / 1_000_000n);
  const d = new Date(ms);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds())
  );
}

/** Escape ICS text: backslash before \, ; , \n */
function icsEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** Fold long lines per RFC 5545 (max 75 octets). */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 74) {
    parts.push(i === 0 ? line.slice(i, i + 74) : ' ' + line.slice(i, i + 74));
  }
  return parts.join('\r\n');
}

/**
 * Build a complete .ics string from an array of events.
 *
 * @example
 * ```ts
 * const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url; a.download = 'events.ics'; a.click();
 * ```
 */
export function buildIcs(events: ExportEvent[]): string {
  const now = nanosToIcsDate((BigInt(Date.now()) * 1_000_000n).toString());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Terp Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const ev of events) {
    lines.push('BEGIN:VEVENT');
    lines.push('UID:' + crypto.randomUUID() + '@terp.ics');
    lines.push('DTSTAMP:' + now);
    lines.push('DTSTART:' + nanosToIcsDate(ev.start_time));
    lines.push('DTEND:' + nanosToIcsDate(ev.end_time));
    lines.push('SUMMARY:' + icsEscape(ev.title));
    if (ev.description) {
      lines.push('DESCRIPTION:' + icsEscape(ev.description));
    }
    if (ev.location) {
      lines.push('LOCATION:' + icsEscape(ev.location));
    }
    if (ev.timezone) {
      // ICS stores TZID on VEVENT if the timezone is explicit
      lines.push('TZID:' + ev.timezone);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  // Apply line folding to each line
  return lines.map(foldLine).join('\r\n') + '\r\n';
}