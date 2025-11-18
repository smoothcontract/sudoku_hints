# SudokuHints

A lightweight, framework-agnostic **Sudoku hint engine** implemented as a modern ES module.  
It analyses a 9×9 Sudoku board and produces structured hints for common solving techniques:

- Full House  
- Naked Single  
- Hidden Single  
- Pointing  
- Claiming  
- Naked Pairs / Triples / Quads  
- Hidden Pairs / Triples / Quads  
- X-Wing  

Used in production on **HeadScratcher**, a free daily Sudoku site:  
https://headscratcher.world

No dependencies. No build tooling. Works directly in the browser with `import` or via Rails 8 importmap.

---

## Features

- Pure JavaScript ES module — drop-in and portable  
- Considers partially solved grid and populated candidates
- Detects beginner → intermediate solving techniques  
- Returns machine-readable hint structures (row/col coordinates, technique names, descriptive text, links)  
- Suitable for use in web apps, PWAs, and teaching tools

---

## Installation

### Import directly (CDN)

```js
  import SudokuHints from "https://cdn.jsdelivr.net/gh/smoothcontract/sudoku_hints@v1.0.0/src/sudoku_hints.js";
```

### Install via Git submodule (recommended for apps)

Add the repo as a submodule:

```bash
  git submodule add https://github.com/smoothcontract/sudoku_hints.git path/to/submodule
```

### Using with Rails 8 (no npm, no bundler) — importmap 

Add the repo as a submodule:

```bash
  git submodule add https://github.com/smoothcontract/sudoku_hints.git vendor/javascript/sudoku_hints
```

Pin it in `config/importmap.rb`:

```ruby
  pin "sudoku_hints", to: "vendor/sudoku_hints/src/sudoku_hints.js"
```

Use it in your application JS:

```js
  import { SudokuHints } from "sudoku_hints";

  const engine = new SudokuHints(board, candidates);
  const hints = engine.checkHiddenSingleHints();
```

## Usage Example

```js
  import SudokuHints from "./sudoku_hints.js";

  const board = [
    [0,0,0, 2,6,0, 7,0,1],
    [6,8,0, 0,7,0, 0,9,0],
    [1,9,0, 0,0,4, 5,0,0],

    [8,2,0, 1,0,0, 0,4,0],
    [0,0,4, 6,0,2, 9,0,0],
    [0,5,0, 0,0,3, 0,2,8],

    [0,0,9, 3,0,0, 0,7,4],
    [0,4,0, 0,5,0, 0,3,6],
    [7,0,3, 0,1,8, 0,0,0],
  ];

  // Optional: manual candidate overrides
  const manualCandidates = [...Array(9)].map(() => [...Array(9)].map(() => []));

  const hints = new SudokuHints(board, manualCandidates);

  // Example: get all naked singles
  const singles = hints.checkNakedSingleHints();

  console.log(singles);
```

## Development

To contribute:

```bash
  git clone https://github.com/smoothcontract/sudoku_hints
  cd sudoku_hints
  # edit src/sudoku_hints.js
```

When used as a git submodule:

```bash
  cd vendor/javascript/sudoku_hints
  # make edits
  git commit
  git push
```

Then update the submodule pointer in the host app:

```bash
  git add vendor/sudoku_hints
  git commit -m "Update submodule"
```

## License

Released under the MIT License. See LICENSE￼for details.


## Credits

SudokuHints is developed by [Andrew Retmanski](https://github.com/smoothcontract)

Originally extracted from the hint logic powering [HeadScratcher](https://headscratcher.world)
