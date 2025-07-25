#!/usr/bin/env node

function printUsage() {
  console.log('Usage: node dist/cron-cli.js "cron(0 0 3 9 ? *)" [--count N]');
  console.log('Prints the next N trigger dates for the given AWS cron expression. Default N=1.');
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

function parseArgs(args: string[]): { expr: string; count: number } {
  let count = 1;
  let exprParts: string[] = [];
  for (let i = 0; i < args.length; ++i) {
    if (args[i] === '--count' && i + 1 < args.length) {
      count = parseInt(args[i + 1], 10);
      i++;
    } else {
      exprParts.push(args[i]);
    }
  }
  return { expr: exprParts.join(' '), count };
}

function wrap(str: string, width: number): string {
  if (str.length <= width) return str;
  const regex = new RegExp(`(.{1,${width}})`, 'g');
  return str.match(regex)?.join('\n') ?? str;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    printUsage();
    process.exit(1);
  }
  const { expr: awsExpr, count } = parseArgs(args);
  try {
    const cronExpr = awsToCronParserExpr(awsExpr);
    const { CronExpressionParser } = await import('cron-parser');
    const interval = CronExpressionParser.parse(cronExpr, { tz: 'America/New_York' });
    const rows = [];
    for (let i = 0; i < count; ++i) {
      const next = interval.next();
      const jsDate: Date = next.toDate ? next.toDate() : (next as unknown as Date);
      rows.push({
        ISO: wrap(jsDate.toISOString(), 30),
        Local: wrap(jsDate.toLocaleString('en-US', { timeZone: 'America/New_York' }), 30)
      });
    }
    console.table(rows);
    if (process.stdout.columns && process.stdout.columns < 80) {
      console.log('\nNote: For best table display, use a wider terminal window.');
    }
  } catch (e: any) {
    console.error('Error:', e.message);
    printUsage();
    process.exit(1);
  }
}

main(); 