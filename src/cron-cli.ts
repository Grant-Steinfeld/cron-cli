#!/usr/bin/env node

import { renderTable, renderJson, renderCsv, renderTsv } from './render.js';
import { getCronDates } from './logic.js';

function printUsage() {
  console.log(`\nUsage: node dist/cron-cli.js "cron(0 0 3 9 ? *)" [--count N] [--format table|json|csv|tsv] [--help]\n`);
  console.log('Options:');
  console.log('  --count N         Print the next N trigger dates (default: 1)');
  console.log('  --format FORMAT   Output format: table, json, csv, tsv (default: table)');
  console.log('  --help            Show this help message and exit');
  console.log('\nExamples:');
  console.log('  # Print the next 5 yearly triggers as a table');
  console.log('  node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 5 --format table');
  console.log('\n  # Print the next 4 quarterly triggers as JSON');
  console.log('  node dist/cron-cli.js "cron(0 0 1 1,4,7,10 ? *)" --count 4 --format json');
  console.log('\n  # Print the next 4 semi-annual triggers as CSV');
  console.log('  node dist/cron-cli.js "cron(0 0 1 1,7 ? *)" --count 4 --format csv');
  console.log('\n  # Print only the next trigger date');
  console.log('  node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 1 --format table');
  console.log('\n  # Print nothing for --count 0 (but still show the cron expression)');
  console.log('  node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 0 --format table');
  console.log('\n  # Handle leap year (Feb 29)');
  console.log('  node dist/cron-cli.js "cron(0 0 29 2 ? *)" --count 3 --format table');
  console.log('\n  # Print the next 20 yearly triggers (large count)');
  console.log('  node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 20 --format table');
  console.log('\n  # Show error for invalid cron expression');
  console.log('  node dist/cron-cli.js "cron(invalid cron)" --count 2');
  console.log('\nSupported AWS Scheduler Expression Types:');
  console.log('  cron: Standard cron expressions for recurring schedules. Example: cron(0 0 3 9 ? *)');
  console.log('  at:   Schedules a one-time execution at a specific time. Example: at(2025-09-03T00:00:00)');
  console.log('  rate: Schedules recurring executions at a regular rate. Example: rate(5 minutes)');
  console.log('\nSee: https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html');
}

function parseArgs(args: string[]): { expr: string; count: number; format: string; help: boolean } {
  let count = 1;
  let format = 'table';
  let help = false;
  let exprParts: string[] = [];
  for (let i = 0; i < args.length; ++i) {
    if (args[i] === '--count' && i + 1 < args.length) {
      count = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--format' && i + 1 < args.length) {
      format = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      help = true;
    } else {
      exprParts.push(args[i]);
    }
  }
  return { expr: exprParts.join(' '), count, format, help };
}

async function main() {
  const args = process.argv.slice(2);
  const { expr: awsExpr, count, format, help } = parseArgs(args);
  if (help || args.length === 0) {
    printUsage();
    process.exit(0);
  }
  try {
    const rows = await getCronDates(awsExpr, count);
    if (format === 'json') {
      renderJson(awsExpr, rows);
    } else if (format === 'csv') {
      renderCsv(awsExpr, rows);
    } else if (format === 'tsv') {
      renderTsv(awsExpr, rows);
    } else {
      renderTable(awsExpr, rows);
    }
  } catch (e: any) {
    console.error('Error:', e.message);
    printUsage();
    process.exit(1);
  }
}

main(); 