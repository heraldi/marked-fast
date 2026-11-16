// SPDX-License-Identifier: MIT
// Development-only fresh-process timing; requires Linux /usr/bin/time.
// This is NOT the official container/cgroup heat or its null-control correction.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const kit = resolve(process.argv[2] ?? '../mds-kit/markdown-render-speed-02-kit');
const root = resolve(new URL('..', import.meta.url).pathname);
// Optional entrypoint lets an experiment compete against a known-good revision.
const comparison = resolve(process.argv[3] ?? `${kit}/baselines/main.ts`);
const scratch = mkdtempSync(`${tmpdir()}/marked-fresh-`);
const samples = { baseline: [], candidate: [] };
let expectedHash;
try {
  for (const name of Object.keys(samples)) mkdirSync(`${scratch}/${name}`);
  // One warmup plus nine alternating rounds. Each execution starts a new Node.
  for (let round = -1; round < 9; round++) {
    for (const name of round % 2 ? ['baseline', 'candidate'] : ['candidate', 'baseline']) {
      const output = `${scratch}/${name}`;
      const entry = name === 'baseline' ? comparison : `${root}/main.ts`;
      const child = spawnSync('/usr/bin/time', [
        '-f', '%U %S %e', '-o', `${scratch}/timing.txt`, process.execPath, entry,
      ], {
        encoding: 'utf8',
        env: {
          ...process.env,
          MAKEFUN_INPUT_DIR: `${kit}/practice/input`,
          MAKEFUN_OUTPUT_DIR: output,
        },
      });
      assert.equal(child.status, 0, `${name}: ${child.stderr}`);
      const bytes = readFileSync(`${output}/html.json`);
      const hash = createHash('sha256').update(bytes).digest('hex');
      expectedHash ??= hash;
      assert.equal(hash, expectedHash, `${name} round ${round} output differs`);
      const [user, system, wall] = readFileSync(`${scratch}/timing.txt`, 'utf8').trim().split(/\s+/).map(Number);
      if (round >= 0) samples[name].push({ cpu_ms: (user + system) * 1000, wall_ms: wall * 1000 });
    }
  }
  function trimmedMean(name, field) {
    const values = samples[name].map(row => row[field]).sort((a, b) => a - b).slice(2, -2);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  const baseline = trimmedMean('baseline', 'cpu_ms');
  const candidate = trimmedMean('candidate', 'cpu_ms');
  console.log(JSON.stringify({
    mode: 'fresh-process; no cgroup isolation or null-control correction',
    node: process.version, rounds: 9, trim_each_end: 2,
    baseline_cpu_ms: baseline, candidate_cpu_ms: candidate,
    cpu_speedup: baseline / candidate,
    baseline_wall_ms: trimmedMean('baseline', 'wall_ms'),
    candidate_wall_ms: trimmedMean('candidate', 'wall_ms'),
    output_sha256: expectedHash, samples,
  }, null, 2));
} finally {
  // Only this script's own newly-created temporary directory is removed.
  rmSync(scratch, { recursive: true, force: true });
}
