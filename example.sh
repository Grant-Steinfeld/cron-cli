#!/bin/sh
# Example usage for cron-parser CLI
# Run with: sh example.sh

# Print the next 5 yearly triggers as a table (with Pretty date column)
echo "\n# Table output (5 yearly triggers)"
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 5 --format table

# Print the next 4 quarterly triggers as JSON (with Pretty date)
echo "\n# JSON output (4 quarterly triggers)"
node dist/cron-cli.js "cron(0 0 1 1,4,7,10 ? *)" --count 4 --format json

# Print the next 4 semi-annual triggers as CSV (with Pretty date)
echo "\n# CSV output (4 semi-annual triggers)"
node dist/cron-cli.js "cron(0 0 1 1,7 ? *)" --count 4 --format csv

# Print the next 4 semi-annual triggers as TSV (with Pretty date)
echo "\n# TSV output (4 semi-annual triggers)"
node dist/cron-cli.js "cron(0 0 1 1,7 ? *)" --count 4 --format tsv

# Print only the next trigger date (with Pretty date)
echo "\n# Table output (next trigger only)"
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 1 --format table

# Print nothing for --count 0 (but still show the cron expression)
echo "\n# Table output (count 0)"
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 0 --format table

# Handle leap year (Feb 29, with Pretty date)
echo "\n# Table output (leap year Feb 29)"
node dist/cron-cli.js "cron(0 0 29 2 ? *)" --count 3 --format table

# Print the next 20 yearly triggers (large count, with Pretty date)
echo "\n# Table output (20 yearly triggers)"
node dist/cron-cli.js "cron(0 0 3 9 ? *)" --count 20 --format table

# Show error for invalid cron expression
echo "\n# Invalid cron expression (should show error)"
node dist/cron-cli.js "cron(invalid cron)" --count 2

# Show help output
echo "\n# Show help"
node dist/cron-cli.js --help 