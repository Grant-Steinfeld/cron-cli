#!/usr/bin/env node

import parser from 'cron-parser';

function printUsage() {
  console.log('Usage: node cron-cli.js "cron(0 0 3 9 ? *)" [--count N]');
  console.log('Prints the next N trigger dates for the given AWS cron expression. Default N=1.');
}

function awsToCronParserExpr(awsExpr) {
  // Remove cron( and )
  let expr = awsExpr.trim();
  if (expr.startsWith('cron(') && expr.endsWith(')')) {
    expr = expr.slice(5, -1).trim();
  }
  // Prepend 0 for seconds
  return '0 ' + expr;
}

function parseArgs(args) {
  let count = 1;
  let exprParts = [];
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

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
    printUsage();
    process.exit(1);
  }
  const { expr: awsExpr, count } = parseArgs(args);
  try {
    const cronExpr = awsToCronParserExpr(awsExpr);
    const interval = parser.parseExpression(cronExpr);
    for (let i = 0; i < count; ++i) {
      const next = interval.next();
      console.log(next.toString());
    }
  } catch (e) {
    console.error('Error:', e.message);
    printUsage();
    process.exit(1);
  }
}

main(); 