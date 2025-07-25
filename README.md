# cron-parser

## Usage

This project provides a Node.js CLI (written in TypeScript) to parse AWS cron expressions and print the next N trigger dates using cron-parser.

### Build

```sh
npm run build
```

### Run

```sh
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 10
```

This prints the next 10 trigger dates for the given AWS cron expression.

### CLI Options

- `--count N` — Print the next N trigger dates (default: 1)
- `--skip-nyse-holidays` — Skip NYSE holidays (2025-2027) when printing trigger dates

### Examples

**Print the next 5 yearly triggers:**
```sh
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 5
```

**Print the next 10 NYSE trading days at 9:30am, skipping holidays:**
```sh
node dist/cron-cli.js "cron(30 9 ? * 2-6 *)" --count 10 --skip-nyse-holidays
```

### Test

```sh
npm test
```

The tests use a frozen date (January 1, 2025) and America/New_York timezone for deterministic results.

### Development

- Edit the CLI source in `src/cron-cli.ts`.
- Rebuild with `npm run build` after making changes.
- Run tests with `npm test`.
