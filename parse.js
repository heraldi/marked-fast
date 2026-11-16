// SPDX-License-Identifier: MIT
import { Marked } from './vendor/marked/marked.esm.js';

// A private instance keeps application changes to marked's global defaults out
// of this drop-in. Marked allocates fresh lexer/parser state for each call.
const engine = new Marked();

/** Render a string with marked 18.1.3's synchronous GFM defaults. */
export function parse(markdown) {
  return engine.parse(markdown);
}
