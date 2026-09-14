import { Wasmer } from '@wasmer/sdk/node';
const wasmer = new Wasmer();
let sandbox;
try {
  sandbox = await wasmer.sandboxes.create({
    env: {}, network: {mode: 'disabled'},
    packages: ['python/python@=3.13.5'],
    files: {'smoke.py': 'print("HELIX_WASMER_OK")'},
  });
  const output = await sandbox.command('python', ['/workspace/smoke.py']).run({timeoutMs: 10000, outputBytes: 16384});
  if (!output.text().includes('HELIX_WASMER_OK')) throw new Error('Missing sandbox result');
  console.log(output.text());
} finally {
  if (sandbox) await sandbox.close();
  await wasmer.close();
}
