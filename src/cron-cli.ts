#!/usr/bin/env node

import CronExpressionParser from 'cron-parser';

function printUsage() {
  console.log('Usage: node dist/cron-cli.js "cron(0 0 3 9 ? *)" [--count N] [--skip-nyse-holidays]');
  console.log('Prints the next N trigger dates for the given AWS cron expression. Default N=1.');
  console.log('Use --skip-nyse-holidays to skip NYSE holidays (2025-2027).');
}

function awsToCronParserExpr(awsExpr: string): string {
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

// NYSE full market holidays for 2025-2027 (YYYY-MM-DD)
const NYSE_HOLIDAYS = new Set([
  // 2025
  '2025-01-01', '2025-01-20', '2025-02-17', '2025-04-18', '2025-05-26', '2025-07-04', '2025-09-01', '2025-11-27', '2025-12-25',
  // 2026
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25',
  // 2027
  '2027-01-01', '2027-01-18', '2027-02-15', '2027-03-26', '2027-05-31', '2027-07-05', '2027-09-06', '2027-11-25', '2027-12-24',
]);

function isNYSEHoliday(date: Date): boolean {
  // Format as YYYY-MM-DD in America/New_York
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const yyyy = tzDate.getFullYear();
  const mm = String(tzDate.getMonth() + 1).padStart(2, '0');
  const dd = String(tzDate.getDate()).padStart(2, '0');
  return NYSE_HOLIDAYS.has(`${yyyy}-${mm}-${dd}`);
}

function parseArgs(args: string[]): { expr: string; count: number; skipNYSE: boolean } {
  let count = 1;
  let skipNYSE = false;
  let exprParts: string[] = [];
  for (let i = 0; i < args.length; ++i) {
    if (args[i] === '--count' && i + 1 < args.length) {
      count = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--skip-nyse-holidays') {
      skipNYSE = true;
    } else {
      exprParts.push(args[i]);
    }
  }
  return { expr: exprParts.join(' '), count, skipNYSE };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    printUsage();
    process.exit(1);
  }
  const { expr: awsExpr, count, skipNYSE } = parseArgs(args);
  try {
    const cronExpr = awsToCronParserExpr(awsExpr);
    const interval = CronExpressionParser.parse(cronExpr, { tz: 'America/New_York' });
    let printed = 0;
    while (printed < count) {
      const next = interval.next();
      const jsDate: Date = next.toDate ? next.toDate() : (next as unknown as Date);
      if (skipNYSE && isNYSEHoliday(jsDate)) {
        continue;
      }
      console.log(jsDate.toISOString());
      printed++;
    }
  } catch (e: any) {
    console.error('Error:', e.message);
    printUsage();
    process.exit(1);
  }
}

main(); 