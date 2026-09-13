// MCP stdin/stdout bridge: only the fixed owned fixture is copied into the guest.
import { Wasmer } from '@wasmer/sdk/node';
import { readFile, writeFile, mkdtemp, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [scenario, reportPath] = process.argv.slice(2);
if (!['clean', 'benign', 'poison', 'behavior'].includes(scenario) || !reportPath) {
  throw new Error('Expected fixed scenario and internal report path');
}
const root = fileURLToPath(new URL('../', import.meta.url));
const version = Number(process.versions.node.split('.')[0]);
if (version < 24) throw new Error('Use Node 24+ for the pinned Wasmer Python package');
const temp = await mkdtemp(join(tmpdir(), 'helix-canary-'));
const hostCanary = join(temp, 'host-only.txt');
await writeFile(hostCanary, 'synthetic-host-canary');
const wasmer = new Wasmer({outputBytes: 262144, parallelism: 2});
let sandbox;
try {
  const probe = `import json,socket
results={}
try:
    open(${JSON.stringify(hostCanary)}).read()
    results['host_file_blocked']=False
except OSError:
    results['host_file_blocked']=True
results['guest_file_available']=open('/workspace/guest-only.txt').read()=='synthetic-guest-canary'
try:
    s=socket.socket();s.settimeout(1);s.connect(('127.0.0.1',9));s.close()
    results['network_unavailable']=False
except OSError:
    results['network_unavailable']=True
print(json.dumps(results))
`;
  sandbox = await wasmer.sandboxes.create({
    packages: ['python/python@=3.13.5'],
    env: {}, network: {mode: 'disabled'},
    files: {
      'server.py': await readFile(join(root, 'helix/sandbox_server.py'), 'utf8'),
      'contracts.json': await readFile(join(root, 'helix/sandbox_contracts.json'), 'utf8'),
      'tickets.json': await readFile(join(root, 'helix/tickets.json'), 'utf8'),
      'guest-only.txt': 'synthetic-guest-canary', 'probe.py': probe,
    },
  });
  const checks = await sandbox.command('python', ['/workspace/probe.py'])
    .run({timeoutMs: 10000, outputBytes: 16384});
  await writeFile(reportPath, JSON.stringify({
    engine: 'wasmer', sdk: '0.11.0', package: 'python/python@=3.13.5',
    node: process.versions.node, network_policy: 'disabled', host_mounts: [],
    checks: JSON.parse(checks.text()),
    note: 'A failed network connect alone is not proof of all egress isolation; policy is disabled.',
  }));
  const guest = await sandbox.command('python', ['-u', '/workspace/server.py', scenario])
    .spawn({stdin: 'pipe', stdout: 'pipe', stderr: 'capture', timeoutMs: 90000, outputBytes: 262144});
  const input = (async () => {
    for await (const chunk of process.stdin) await guest.stdin.write(chunk);
    await guest.stdin.close();
  })();
  for await (const chunk of guest.stdout) process.stdout.write(chunk);
  await guest.wait({check: true});
  await input;
} finally {
  if (sandbox) await sandbox.close();
  await wasmer.close();
  await unlink(hostCanary);
  await rmdir(temp);
}
