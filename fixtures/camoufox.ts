import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { firefox, type Browser } from 'playwright';
import { timeouts } from '@/config/timeouts';

export const useCamoufox = process.env.PLAYWRIGHT_CAMOUFOX === '1';
export const camoufoxSlowMoMs = Number(process.env.CAMOUFOX_TS_SLOWMO_MS ?? 100);
export const camoufoxCloseDelayMs = Number(process.env.CAMOUFOX_TS_CLOSE_DELAY_MS ?? 5_000);
export const keepCamoufoxOpenUntilEnter = ['1', 'true', 'yes', 'on'].includes(
  (process.env.CAMOUFOX_TS_WAIT_FOR_ENTER ?? '0').toLowerCase()
);

const ansiEscapeChar = String.fromCharCode(27);
const websocketEndpointPattern = new RegExp(`ws://[^\\s${ansiEscapeChar}]+`);

export async function launchCamoufoxServer(): Promise<{
  browser: Browser;
  process: ChildProcessWithoutNullStreams;
}> {
  const serverProcess = spawn('python', ['scripts/camoufox-playwright-server.py'], {
    cwd: process.cwd(),
    env: { ...process.env },
  });

  const endpoint = await new Promise<string>((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for Camoufox websocket endpoint.\n${output}`));
    }, timeouts.serverStart);

    serverProcess.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      const match = output.match(websocketEndpointPattern);
      if (match) {
        clearTimeout(timeout);
        resolve(match[0]);
      }
    });

    serverProcess.stderr.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });

    serverProcess.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    serverProcess.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Camoufox server exited with code ${code}.\n${output}`));
    });
  });

  return {
    browser: await firefox.connect(endpoint, { slowMo: camoufoxSlowMoMs }),
    process: serverProcess,
  };
}

export function killProcessTree(processToKill: ChildProcessWithoutNullStreams): void {
  if (processToKill.killed || processToKill.exitCode !== null) return;

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(processToKill.pid), '/t', '/f'], {
      stdio: 'ignore',
    });
    return;
  }

  processToKill.kill('SIGTERM');
}
