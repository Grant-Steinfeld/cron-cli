# cron-parser

## Usage

This project provides a Node.js CLI (written in TypeScript) to parse AWS Scheduler cron expressions (e.g., `cron(...)`) and print the next N trigger dates using cron-parser.

### Build

```sh
npm run build
```

### Run

```sh
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 10 --format table
```

This prints the next 10 trigger dates for the given AWS Scheduler cron expression in a table format, including a human-friendly Pretty date column (e.g., `Jan 1st 2026`).

### CLI Options

- `--count N` — Print the next N trigger dates (default: 1)
- `--format table|json|csv|tsv` — Output format (default: table)

### Examples

**Print the next 5 yearly triggers as a table (with Pretty date column):**
```sh
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 5 --format table
```

**Print the next 4 quarterly triggers as JSON (with Pretty date):**
```sh
node dist/cron-cli.js "cron(0 0 1 1,4,7,10 ? *)" --count 4 --format json
```

**Print the next 4 semi-annual triggers as CSV (with Pretty date):**
```sh
node dist/cron-cli.js "cron(0 0 1 1,7 ? *)" --count 4 --format csv
```

**Print the next 4 semi-annual triggers as TSV (with Pretty date):**
```sh
node dist/cron-cli.js "cron(0 0 1 1,7 ? *)" --count 4 --format tsv
```

**Print only the next trigger date (with Pretty date):**
```sh
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 1 --format table
```

**Print nothing for --count 0 (but still show the cron expression):**
```sh
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 0 --format table
```

**Handle leap year (Feb 29, with Pretty date):**
```sh
node dist/cron-cli.js "cron(0 0 29 2 ? *)" --count 3 --format table
```

**Print the next 20 yearly triggers (large count, with Pretty date):**
```sh
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 20 --format table
```

**Show error for invalid cron expression:**
```sh
node dist/cron-cli.js "cron(invalid cron)" --count 2
```

### Test

```sh
npm test
```

The tests use a frozen date (January 1, 2025) and America/New_York timezone for deterministic results. Output format and the Pretty date column do not affect test results.

### Development

- Edit the CLI source in `src/cron-cli.ts`.
- Edit core logic in `src/logic.ts` and output formats in `src/render.ts`.
- Rebuild with `npm run build` after making changes.
- Run tests with `npm test`.

---

### Supported AWS Scheduler Expression Types

- **cron**: Standard cron expressions for recurring schedules. Example: `cron(0 0 3 9 ? *)`
- **at**: Schedules a one-time execution at a specific time. Example: `at(2025-09-03T00:00:00)`
- **rate**: Schedules recurring executions at a regular rate. Example: `rate(5 minutes)`

See the [AWS Scheduler documentation](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html) for more details on these expression types.

> **Note:** This CLI currently supports only the `cron(...)` expression type for recurring schedules. Support for `at(...)` and `rate(...)` can be added if needed.
