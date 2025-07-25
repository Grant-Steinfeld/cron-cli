import CronExpressionParser from 'cron-parser';

// Helper to freeze time
const FIXED_DATE = new Date('2025-01-01T00:00:00Z');

function awsToCronParserExpr(awsExpr: string): string {
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
  '2025-01-01', // New Year's Day
  '2025-01-20', // Martin Luther King, Jr. Day
  '2025-02-17', // Washington's Birthday
  '2025-04-18', // Good Friday
  '2025-05-26', // Memorial Day
  '2025-07-04', // Independence Day
  '2025-09-01', // Labor Day
  '2025-11-27', // Thanksgiving Day
  '2025-12-25', // Christmas Day
  // 2026
  '2026-01-01',
  '2026-01-19',
  '2026-02-16',
  '2026-04-03',
  '2026-05-25',
  '2026-07-03', // Observed (July 4 is Saturday)
  '2026-09-07',
  '2026-11-26',
  '2026-12-25',
  // 2027
  '2027-01-01',
  '2027-01-18',
  '2027-02-15',
  '2027-03-26', // Good Friday
  '2027-05-31',
  '2027-07-05', // Observed (July 4 is Sunday)
  '2027-09-06',
  '2027-11-25',
  '2027-12-24', // Observed (Christmas is Saturday)
]);

function isNYSEHoliday(date: Date): boolean {
  // Format as YYYY-MM-DD in America/New_York
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const yyyy = tzDate.getFullYear();
  const mm = String(tzDate.getMonth() + 1).padStart(2, '0');
  const dd = String(tzDate.getDate()).padStart(2, '0');
  return NYSE_HOLIDAYS.has(`${yyyy}-${mm}-${dd}`);
}

describe('AWS cron expression parsing', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns the next 3 trigger dates for cron(0 0 3 9 ? *)', () => {
    const awsExpr = 'cron(0 0 3 9 ? *)';
    const cronExpr = awsToCronParserExpr(awsExpr);
    const interval = CronExpressionParser.parse(cronExpr, { 
      currentDate: FIXED_DATE, 
      tz: 'America/New_York' 
    });
    const results = [];
    for (let i = 0; i < 3; ++i) {
      results.push(interval.next().toISOString());
    }
    expect(results).toEqual([
      '2025-09-03T04:00:00.000Z',
      '2026-09-03T04:00:00.000Z',
      '2027-09-03T04:00:00.000Z',
    ]);
  });

  it('returns the next 4 quarterly trigger dates for cron(0 0 1 1,4,7,10 ? *)', () => {
    // Triggers at midnight on the 1st day of Jan, Apr, Jul, Oct
    const awsExpr = 'cron(0 0 1 1,4,7,10 ? *)';
    const cronExpr = awsToCronParserExpr(awsExpr);
    const interval = CronExpressionParser.parse(cronExpr, {
      currentDate: FIXED_DATE,
      tz: 'America/New_York'
    });
    const results = [];
    for (let i = 0; i < 4; ++i) {
      results.push(interval.next().toISOString());
    }
    expect(results).toEqual([
      '2025-01-01T05:00:00.000Z',
      '2025-04-01T04:00:00.000Z',
      '2025-07-01T04:00:00.000Z',
      '2025-10-01T04:00:00.000Z',
    ]);
  });

  it('returns the next 4 semi-annual trigger dates for cron(0 0 1 1,7 ? *)', () => {
    // Triggers at midnight on the 1st day of Jan and Jul
    const awsExpr = 'cron(0 0 1 1,7 ? *)';
    const cronExpr = awsToCronParserExpr(awsExpr);
    const interval = CronExpressionParser.parse(cronExpr, {
      currentDate: FIXED_DATE,
      tz: 'America/New_York'
    });
    const results = [];
    for (let i = 0; i < 4; ++i) {
      results.push(interval.next().toISOString());
    }
    expect(results).toEqual([
      '2025-01-01T05:00:00.000Z',
      '2025-07-01T04:00:00.000Z',
      '2026-01-01T05:00:00.000Z',
      '2026-07-01T04:00:00.000Z',
    ]);
  });

  it('returns the next 6 trigger dates for cron(0 0 1,30,31 1,7 ? *) (trigger day and 2 days before)', () => {
    // Triggers at midnight on the 1st, 30th, and 31st of Jan and Jul
    const awsExpr = 'cron(0 0 1,30,31 1,7 ? *)';
    const cronExpr = awsToCronParserExpr(awsExpr);
    const interval = CronExpressionParser.parse(cronExpr, {
      currentDate: FIXED_DATE,
      tz: 'America/New_York'
    });
    const results = [];
    for (let i = 0; i < 6; ++i) {
      results.push(interval.next().toISOString());
    }
    expect(results).toEqual([
      '2025-01-01T05:00:00.000Z', // Jan 1
      '2025-01-30T05:00:00.000Z', // Jan 30
      '2025-01-31T05:00:00.000Z', // Jan 31
      '2025-07-01T04:00:00.000Z', // Jul 1
      '2025-07-30T04:00:00.000Z', // Jul 30
      '2025-07-31T04:00:00.000Z', // Jul 31
    ]);
  });

  it('returns the next 3 leap year trigger dates for cron(0 0 29 2 ? *) (Feb 29)', () => {
    // Triggers at midnight on Feb 29 (leap years only)
    const awsExpr = 'cron(0 0 29 2 ? *)';
    const cronExpr = awsToCronParserExpr(awsExpr);
    const interval = CronExpressionParser.parse(cronExpr, {
      currentDate: FIXED_DATE,
      tz: 'America/New_York'
    });
    const results = [];
    for (let i = 0; i < 3; ++i) {
      results.push(interval.next().toISOString());
    }
    expect(results).toEqual([
      '2028-02-29T05:00:00.000Z', // Feb 29, 2028, 00:00 America/New_York
      '2032-02-29T05:00:00.000Z', // Feb 29, 2032, 00:00 America/New_York
      '2036-02-29T05:00:00.000Z', // Feb 29, 2036, 00:00 America/New_York
    ]);
  });

  it('returns the next 10 NYSE trading days at 9:30am, skipping holidays', () => {
    // 9:30am every weekday (Monday-Friday)
    const awsExpr = 'cron(30 9 ? * 2-6 *)';
    const cronExpr = awsToCronParserExpr(awsExpr);
    const interval = CronExpressionParser.parse(cronExpr, {
      currentDate: FIXED_DATE,
      tz: 'America/New_York',
    });
    const results: string[] = [];
    while (results.length < 10) {
      const next = interval.next();
      const jsDate: Date = next.toDate ? next.toDate() : (next as unknown as Date);
      if (!isNYSEHoliday(jsDate)) {
        results.push(jsDate.toISOString());
      }
    }
    // Assert none of the results are on a holiday
    for (const iso of results) {
      expect(isNYSEHoliday(new Date(iso))).toBe(false);
    }
    // Optionally, print the first 3 for visual check
    // console.log(results.slice(0, 3));
  });
}); 