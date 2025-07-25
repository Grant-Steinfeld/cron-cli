import { execFile } from 'child_process';
import path from 'path';

const CLI_PATH = path.resolve(__dirname, '../dist/cron-cli.js');

function runCli(args: string[]): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    execFile('node', [CLI_PATH, ...args], (error, stdout, stderr) => {
      resolve({
        stdout,
        stderr,
        code: error && typeof error.code === 'number' ? error.code : 0,
      });
    });
  });
}

describe('cron-cli integration', () => {
  it('prints table output by default', async () => {
    const { stdout, stderr, code } = await runCli(['cron(0 0 3 9 ? *)', '--count', '2']);
    expect(code).toBe(0);
    // Should contain either the cron expression line or the table output
    expect(stdout).toMatch(/AWS Scheduler cron expression:|ISO/);
    expect(stdout).toContain('Local');
    expect(stderr).toBe('');
  });

  it('prints json output', async () => {
    const { stdout, stderr, code } = await runCli(['cron(0 0 3 9 ? *)', '--count', '2', '--format', 'json']);
    expect(code).toBe(0);
    expect(stdout).toContain('AWS Scheduler cron expression');
    expect(stdout).toContain('ISO');
    expect(stdout).toContain('[');
    expect(stderr).toBe('');
  });

  it('prints csv output', async () => {
    const { stdout, stderr, code } = await runCli(['cron(0 0 3 9 ? *)', '--count', '2', '--format', 'csv']);
    expect(code).toBe(0);
    expect(stdout).toContain('AWS Scheduler cron expression');
    expect(stdout).toContain('ISO,Local');
    expect(stderr).toBe('');
  });

  it('prints tsv output', async () => {
    const { stdout, stderr, code } = await runCli(['cron(0 0 3 9 ? *)', '--count', '2', '--format', 'tsv']);
    expect(code).toBe(0);
    expect(stdout).toContain('AWS Scheduler cron expression');
    expect(stdout).toContain('ISO\tLocal');
    expect(stderr).toBe('');
  });

  it('handles invalid cron expression', async () => {
    const { stdout, stderr, code } = await runCli(['cron(invalid cron)', '--count', '2']);
    expect(code).not.toBe(0);
    expect(stderr).toContain('Error:');
    expect(stdout).toContain('Usage:');
  });

  it('prints nothing for --count 0', async () => {
    const { stdout, stderr, code } = await runCli(['cron(0 0 3 9 ? *)', '--count', '0']);
    expect(code).toBe(0);
    expect(stdout).toContain('AWS Scheduler cron expression');
    // Should not print any ISO date
    expect(stdout).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(stderr).toBe('');
  });
}); 