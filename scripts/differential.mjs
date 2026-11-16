// SPDX-License-Identifier: MIT
// The kit stays outside the submission; no practice input or output is vendored.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from '../parse.js';

const kit = resolve(process.argv[2] ?? '../mds-kit/markdown-render-speed-02-kit');
const { marked } = await import(pathToFileURL(`${kit}/baselines/vendor/marked/marked.esm.js`));
const cases = JSON.parse(readFileSync(`${kit}/practice/input/cases.json`, 'utf8'));
let checked = 0;
function compare(markdown, label) {
  const expected = marked.parse(markdown);
  const actual = parse(markdown);
  if (actual !== expected) {
    let offset = 0;
    while (offset < actual.length && actual[offset] === expected[offset]) offset++;
    assert.equal(actual, expected, `${label}: first different code unit ${offset}`);
  }
  checked++;
}

// Reversed second pass exercises a different preceding-case state on every call.
for (const item of cases) compare(item.markdown, item.id);
console.log(`Practice: ${cases.length}/${cases.length} identical`);
for (const item of [...cases].reverse()) compare(item.markdown, `${item.id} reversed`);

const edgeCases = [
  '', '\r\n\t\r', '\u0000<&>\ud800', 'a\rb\r\nc',
  'a  \nb\\\nc', '```js\r\n<&\t\r\n```',
  '<pre>**raw**\n</pre>\n\n*normal*', '<a href="x">www.a.b</a>',
  '![**alt** `code`](x "<&")', '[x][r]\n\n[r]: <a\\>b> "t"',
  '* [x] done\n  * child\n\n* [ ] open',
  'a | b\n:---|---:\n\\| | `x|y`', '***a _b_*** ~~c~~ ~d~',
  'mailto:a@b.c xmpp:a@b.c/a www.a.b http://a.b/(x).',
  '&amp; &#0; &#xD800; &#1114112; &#38; &notanentity;',
];
for (const [index, markdown] of edgeCases.entries()) compare(markdown, `edge-${index}`);

// Seeded grammar fragments, not fixtures or caches: compare arbitrary combinations
// of delimiter, indentation, Unicode, link, HTML and line-ending boundaries.
const fragments = [
  'abc', ' ', '\n', '\r\n', '\t', '*', '**', '_', '__', '~', '~~',
  '`', '```', '\\', '<', '>', '[', ']', '(', ')', '!', ':', '|', '-',
  '#', '1. ', '+ ', '&amp;', '&#65;', 'é', '😀',
  '<a>', '</a>', '<code>', '</code>', 'http://a.b', 'x@y.z',
  '\"t\"', '[r]: /url\n', '<!-- x -->', '  \n',
];
let seed = 0x471839a;
function draw(bound) {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) % bound;
}
for (let iteration = 0; iteration < 10000; iteration++) {
  let markdown = '';
  const length = 1 + draw(50);
  for (let index = 0; index < length; index++) markdown += fragments[draw(fragments.length)];
  compare(markdown, `generated-${iteration}`);
}
console.log(`Differential: ${checked} comparisons passed, including reversed calls and generated edges`);
