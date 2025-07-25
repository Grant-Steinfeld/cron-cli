import { getCronDates } from '../src/logic';
import { renderTable, renderJson, renderCsv, renderTsv } from '../src/render';

// Helper to freeze time
const FIXED_DATE = new Date('2025-01-01T00:00:00Z');

function awsToCronParserExpr(awsExpr: string): string {
  let expr = awsExpr.trim();
  if (expr.startsWith('cron(') && expr.endsWith(')')) {
    expr = expr.slice(5, -1).trim();
  }
  const parts = expr.split(/\s+/);
  if (parts.length === 6) {
    parts.pop();
  }
  return '0 ' + parts.join(' ');
}

describe('AWS cron expression parsing and output formats', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const awsExpr = 'cron(0 0 3 9 ? *)';

  it('returns correct rows for getCronDates', async () => {
    const rows: Array<{ ISO: string; Local: string; Pretty: string }> = await getCronDates(awsExpr, 3);
    expect(rows.length).toBe(3);
    expect(rows[0].ISO.startsWith('2025-09-03')).toBe(true);
    expect(rows[0].Pretty).toMatch(/Sep 3rd 2025/);
    expect(rows[1].ISO.startsWith('2026-09-03')).toBe(true);
    expect(rows[1].Pretty).toMatch(/Sep 3rd 2026/);
    expect(rows[2].ISO.startsWith('2027-09-03')).toBe(true);
    expect(rows[2].Pretty).toMatch(/Sep 3rd 2027/);
  });

  it('renders table output', async () => {
    const rows: Array<{ ISO: string; Local: string; Pretty: string }> = await getCronDates(awsExpr, 2);
    const spy = jest.spyOn(console, 'table').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    renderTable(awsExpr, rows);
    expect(spy).toHaveBeenCalledWith(rows);
    spy.mockRestore();
    logSpy.mockRestore();
  });

  it('renders json output', async () => {
    const rows: Array<{ ISO: string; Local: string; Pretty: string }> = await getCronDates(awsExpr, 2);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    renderJson(awsExpr, rows);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('AWS Scheduler cron expression:'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ISO'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Pretty'));
    logSpy.mockRestore();
  });

  it('renders csv output', async () => {
    const rows: Array<{ ISO: string; Local: string; Pretty: string }> = await getCronDates(awsExpr, 2);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    renderCsv(awsExpr, rows);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('AWS Scheduler cron expression:'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ISO,Local,Pretty'));
    logSpy.mockRestore();
  });

  it('renders tsv output', async () => {
    const rows: Array<{ ISO: string; Local: string; Pretty: string }> = await getCronDates(awsExpr, 2);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    renderTsv(awsExpr, rows);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('AWS Scheduler cron expression:'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ISO\tLocal\tPretty'));
    logSpy.mockRestore();
  });

  it('returns only 1 result with --count 1', async () => {
    const rows: Array<{ ISO: string; Local: string; Pretty: string }> = await getCronDates(awsExpr, 1);
    expect(rows.length).toBe(1);
    expect(rows[0].ISO.startsWith('2025-09-03')).toBe(true);
    expect(rows[0].Pretty).toMatch(/Sep 3rd 2025/);
  });

  it('returns 0 results with --count 0', async () => {
    const rows: Array<{ ISO: string; Local: string; Pretty: string }> = await getCronDates(awsExpr, 0);
    expect(rows.length).toBe(0);
  });

  it('throws on invalid cron expression', async () => {
    await expect(getCronDates('cron(invalid cron)', 2)).rejects.toThrow();
  });

  it('handles leap year Feb 29', async () => {
    const leapExpr = 'cron(0 0 29 2 ? *)';
    const rows: Array<{ ISO: string; Local: string; Pretty: string }> = await getCronDates(leapExpr, 3);
    expect(rows[0].ISO.startsWith('2028-02-29')).toBe(true);
    expect(rows[0].Pretty).toMatch(/Feb 29th 2028/);
    expect(rows[1].ISO.startsWith('2032-02-29')).toBe(true);
    expect(rows[1].Pretty).toMatch(/Feb 29th 2032/);
    expect(rows[2].ISO.startsWith('2036-02-29')).toBe(true);
    expect(rows[2].Pretty).toMatch(/Feb 29th 2036/);
  });

  it('returns 20 results for large count', async () => {
    const rows: Array<{ ISO: string; Local: string; Pretty: string }> = await getCronDates(awsExpr, 20);
    expect(rows.length).toBe(20);
    expect(rows[0].ISO.startsWith('2025-09-03')).toBe(true);
    expect(rows[0].Pretty).toMatch(/Sep 3rd 2025/);
    expect(rows[19].ISO).toBeDefined();
    expect(rows[19].Pretty).toMatch(/Sep 3rd \d{4}/);
  });
}); 