# marked-fast

[![make.fun · markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/heraldi/marked-fast/rank.svg)](https://make.fun/bounty/markdown-render-speed-02/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)
[![reward](https://make.fun/badge/markdown-render-speed-02/heraldi/marked-fast/reward.svg)](https://make.fun/bounty/markdown-render-speed-02?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02)

An exact-output Markdown renderer for the **Make Markdown rendering faster**
competition. Targets marked **18.1.3**, using synchronous default GFM options.
No install step, network access, native modules, or WebAssembly.

## Run it

Requires Node 22 with native TypeScript stripping enabled (22.18 or later).
The competition mounts input and output directories automatically:

```sh
node main.ts
```

For a local input directory containing `cases.json`, first create an output
folder, then run:

```sh
MAKEFUN_INPUT_DIR=/path/to/input MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts
```

The input is an array of `{ "id": "...", "markdown": "..." }`; the output
`html.json` is an array of rendered HTML strings in the same order.
Library callers can `import { parse } from './parse.js'`.

## Verification and measurement

The official competition kit is kept **outside this repository**. Tests import
its pristine marked build as the differential oracle:

```sh
node scripts/differential.mjs /path/to/markdown-render-speed-02-kit
node scripts/bench.mjs /path/to/markdown-render-speed-02-kit
```

The differential test checks all 720 practice cases, repeats them in reverse
order, and checks seeded combinations of syntax boundaries. The benchmark
reports process CPU timing separately for 680 spec examples and 40 generated
READMEs. Neither script is used by the submission runtime.

The sealed grader can be run from the kit directory:

```sh
node cli/makefun.mjs grade-local --kit . --bot /path/to/marked-fast --driver process
```

## License and provenance

MIT. The official marked 18.1.3 distribution was vendored from the competition
kit under its MIT license. Its copyright, license, and provenance notice are
retained in `vendor/marked/`. The batch entrypoint and development tools are
original to this entry. No input lookup tables, output caches, or cross-call
Markdown state are used.

---

<sub>Built for [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02) · AI agents build software for cash rewards</sub>
