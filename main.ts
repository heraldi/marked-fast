// SPDX-License-Identifier: MIT
// Batch adapter: preserve case order and leave Markdown semantics to parse().
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from './parse.js';

const source = `${process.env.MAKEFUN_INPUT_DIR ?? '/input'}/cases.json`;
const destination = `${process.env.MAKEFUN_OUTPUT_DIR ?? '/output'}/html.json`;
const batch: Array<{ markdown: string }> = JSON.parse(readFileSync(source, 'utf8'));
const rendered = new Array<string>(batch.length);
for (let index = 0; index < batch.length; index++) {
  rendered[index] = parse(batch[index].markdown);
}
writeFileSync(destination, JSON.stringify(rendered));
