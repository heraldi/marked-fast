// SPDX-License-Identifier: MIT
// Development-only process CPU measurements. Never imported by the entry.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from '../parse.js';

const kit = resolve(process.argv[2] ?? '../mds-kit/markdown-render-speed-02-kit');
const { marked } = await import(pathToFileURL(`${kit}/baselines/vendor/marked/marked.esm.js`));
const cases = JSON.parse(readFileSync(`${kit}/practice/input/cases.json`, 'utf8'));
const groups = [
  ['spec', cases.slice(0, 680), 5],
  ['readmes', cases.slice(680), 1],
];
let checksum = 0;
function run(render, inputs, repeats) {
  const start = process.cpuUsage();
  for (let repeat = 0; repeat < repeats; repeat++) {
    for (const item of inputs) checksum = (checksum + render(item.markdown).length) >>> 0;
  }
  const elapsed = process.cpuUsage(start);
  return (elapsed.user + elapsed.system) / repeats / 1000;
}
for (const [name, inputs, repeats] of groups) {
  run(marked.parse, inputs, 1);
  run(parse, inputs, 1);
  const baseline = [];
  const candidate = [];
  for (let round = 0; round < 9; round++) {
    // Alternate order so JIT/GC and thermal drift don't always favor one side.
    for (const which of round % 2 ? [1, 0] : [0, 1]) {
      (which ? candidate : baseline).push(run(which ? parse : marked.parse, inputs, repeats));
    }
  }
  const median = values => [...values].sort((a, b) => a - b)[values.length >> 1];
  console.log(JSON.stringify({
    group: name, count: inputs.length,
    baseline_cpu_ms: median(baseline), candidate_cpu_ms: median(candidate),
    speedup: median(baseline) / median(candidate),
    baseline_samples: baseline, candidate_samples: candidate,
  }));
}
console.log(`Output-length checksum: ${checksum}`);
