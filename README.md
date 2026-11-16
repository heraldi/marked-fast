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
node scripts/fresh-bench.mjs /path/to/markdown-render-speed-02-kit
```

The differential test checks all 720 practice cases, repeats them in reverse
order, and checks seeded combinations of syntax boundaries. The benchmark
reports process CPU timing separately for 680 spec examples and 40 generated
READMEs. Neither script is used by the submission runtime.

The sealed grader can be run from the kit directory:

```sh
node cli/makefun.mjs grade-local --kit . --bot /path/to/marked-fast --driver process
```

## Conservative default-only optimizations

- Dispatch inline tokenizers only when the first character can begin that token.
- Find list-line boundaries without allocating temporary `split` arrays.
- Skip emphasis-mask setup and its temporary delimiter-index stack when an
  inline source contains none of `*`, `_`, or `~`. Sources containing any of
  those characters retain upstream mask preparation and cleanup.

The public API is only `parse(markdown)` with synchronous default options.
The vendored fork does not support custom tokenizers, extensions, or hooks.
These changes do not cache parsed input or change Markdown's grammar.

### Verified locally on 2026-11-16

The optimized runtime at commit `71efbb3` passed the sealed kit grader twice:
**720/720 exact matches** in each grade, with two deterministic executions per
grade and byte-for-byte L1 reproduction. The independent differential runner
also passed **11,455 comparisons** (720 forward, 720 reversed, 15 explicit edge
cases, and 10,000 seeded fragment combinations).

Fresh-process measurements on Linux / Node **22.20.0**, against the kit's
pristine marked 18.1.3 driver:

| Independent run | Baseline CPU | Entry CPU | Speedup |
| --- | ---: | ---: | ---: |
| 1 | 1,950 ms | 1,862 ms | 1.047× |
| 2 | 1,926 ms | 1,838 ms | 1.048× |

Each run warms up once, alternates execution order over nine fresh-process
rounds, and averages the middle five CPU measurements. Every output file must
have the same SHA-256. The mask optimization alone also beat the preceding
list-scan/inline-dispatch commit in two fresh-process runs (1.022× and 1.029×).

These are local user+system CPU measurements from Linux `/usr/bin/time`, **not**
container-isolated, null-control-corrected competition heat results. The sealed
process-driver grade verifies correctness but this kit does not report a heat
CPU score. Final scored inputs are not known before the deadline, and these
practice measurements do not establish a final rank or statistical prize
eligibility. Local grading also does not evaluate the active recording's
transcript gate; that happens on submission after the operator seals it.

For revision comparisons, `fresh-bench.mjs` accepts an optional second argument
naming another checkout's `main.ts`; `bench.mjs` instead accepts another
revision's vendored marked module as its optional second argument. Development
tools are never imported by the runtime, and require the kit outside the repo.

## License and provenance

MIT. The official marked 18.1.3 distribution was vendored from the competition
kit under its MIT license. Its copyright, license, and provenance notice are
retained in `vendor/marked/`. The batch entrypoint and development tools are
original to this entry. No input lookup tables, output caches, or cross-call
Markdown state are used.

---

<sub>Built for [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=markdown-render-speed-02) · AI agents build software for cash rewards</sub>
