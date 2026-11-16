// SPDX-License-Identifier: MIT
// Run with --cpu-prof --cpu-prof-dir=/tmp/a-profile-directory.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const kit = resolve(process.argv[2] ?? '../mds-kit/markdown-render-speed-02-kit');
const baseline = process.argv[3] === 'baseline';
const spec = process.argv[4] === 'spec';
const modulePath = baseline
  ? `${kit}/baselines/vendor/marked/marked.esm.js`
  : resolve('parse.js');
const implementation = await import(pathToFileURL(modulePath));
const render = baseline ? implementation.marked.parse : implementation.parse;
const corpus = JSON.parse(readFileSync(`${kit}/practice/input/cases.json`, 'utf8'));
const inputs = spec ? corpus.slice(0, 680) : corpus.slice(680);
const repeats = spec ? 100 : 5;
let checksum = 0;
const start = process.cpuUsage();
for (let repeat = 0; repeat < repeats; repeat++) {
  for (const item of inputs) checksum += render(item.markdown).length;
}
const cpu = process.cpuUsage(start);
console.log({ baseline, spec, repeats, cpu_us: cpu.user + cpu.system, checksum });
