export function awsToCronParserExpr(awsExpr: string): string {
  // Remove cron( and )
  let expr = awsExpr.trim();
  if (expr.startsWith('cron(') && expr.endsWith(')')) {
    expr = expr.slice(5, -1).trim();
  }
  // Remove year field if present (AWS cron has 6 fields, cron-parser expects 5 after seconds)
  const parts = expr.split(/\s+/);
  if (parts.length === 6) {
    parts.pop(); // Remove year
  }
  // Prepend 0 for seconds
  return '0 ' + parts.join(' ');
}

export function wrap(str: string, width: number): string {
  if (str.length <= width) return str;
  const regex = new RegExp(`(.{1,${width}})`, 'g');
  return str.match(regex)?.join('\n') ?? str;
}

function getOrdinal(n: number): string {
  if (n > 3 && n < 21) return n + 'th';
  switch (n % 10) {
    case 1: return n + 'st';
    case 2: return n + 'nd';
    case 3: return n + 'rd';
    default: return n + 'th';
  }
}

function prettyDate(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = getOrdinal(date.getDate());
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
}

export async function getCronDates(awsExpr: string, count: number) {
  const cronExpr = awsToCronParserExpr(awsExpr);
  const { CronExpressionParser } = await import('cron-parser');
  const interval = CronExpressionParser.parse(cronExpr, { tz: 'America/New_York' });
  const rows = [];
  for (let i = 0; i < count; ++i) {
    const next = interval.next();
    const jsDate: Date = next.toDate ? next.toDate() : (next as unknown as Date);
    rows.push({
      ISO: wrap(jsDate.toISOString(), 30),
      Local: wrap(jsDate.toLocaleString('en-US', { timeZone: 'America/New_York' }), 30),
      Pretty: prettyDate(jsDate)
    });
  }
  return rows;
} 