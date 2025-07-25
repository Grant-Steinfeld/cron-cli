export function renderTable(awsExpr: string, rows: { ISO: string; Local: string }[]) {
  console.log(`AWS Scheduler cron expression: ${awsExpr}`);
  console.table(rows);
  if (process.stdout.columns && process.stdout.columns < 80) {
    console.log('\nNote: For best table display, use a wider terminal window.');
  }
}

export function renderJson(awsExpr: string, rows: { ISO: string; Local: string }[]) {
  console.log(`AWS Scheduler cron expression: ${awsExpr}`);
  console.log(JSON.stringify(rows, null, 2));
}

export function renderCsv(awsExpr: string, rows: { ISO: string; Local: string }[]) {
  console.log(`AWS Scheduler cron expression: ${awsExpr}`);
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  console.log(headers.join(','));
  for (const row of rows) {
    console.log(headers.map(h => '"' + String((row as Record<string, string>)[h]).replace(/"/g, '""') + '"').join(','));
  }
}

export function renderTsv(awsExpr: string, rows: { ISO: string; Local: string }[]) {
  console.log(`AWS Scheduler cron expression: ${awsExpr}`);
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  console.log(headers.join('\t'));
  for (const row of rows) {
    console.log(headers.map(h => String((row as Record<string, string>)[h]).replace(/\t/g, ' ')).join('\t'));
  }
} 