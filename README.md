# cli esm Typescript exerciser test harness

## Usage

This project provides a Node.js CLI (written in TypeScript) to parse AWS Scheduler cron expressions (e.g., `cron(...)`) and print the next N trigger dates using cron-parser.

### Build

```sh
npm run build
```

### Run

```sh
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 10
```

This prints the next 10 trigger dates for the given AWS Scheduler cron expression.

### CLI Options

- `--count N` — Print the next N trigger dates (default: 1)

### Examples

**Print the next 5 yearly triggers:**
```sh
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 5
```

**Print the next 4 quarterly triggers (1st day of Jan, Apr, Jul, Oct):**
```sh
node dist/cron-cli.js "cron(0 0 1 1,4,7,10 ? *)" --count 4
```

**Print the next 4 semi-annual triggers (1st day of Jan and Jul):**
```sh
node dist/cron-cli.js "cron(0 0 1 1,7 ? *)" --count 4
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

---

### Supported AWS Scheduler Expression Types

- **cron**: Standard cron expressions for recurring schedules. Example: `cron(0 0 3 9 ? *)`
- **at**: Schedules a one-time execution at a specific time. Example: `at(2025-09-03T00:00:00)`
- **rate**: Schedules recurring executions at a regular rate. Example: `rate(5 minutes)`

See the [AWS Scheduler documentation](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html) for more details on these expression types.

> **Note:** This CLI currently supports only the `cron(...)` expression type for recurring schedules. Support for `at(...)` and `rate(...)` can be added if needed.
