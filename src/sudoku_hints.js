export default class SudokuHints {
  constructor(boardNums, candidates) {
    this.boardNums = boardNums;

    // Pre-calculate fixed/automatic candidates for each cell
    if (candidates) {
      this.candidates = this.currentCandidates(candidates)
    }
  }

  // Determine possible candidate numbers for a given cell (excludes numbers already filled in same row, column or subgrid)
  possibleNums(row, col) {
    let numList = [1,2,3,4,5,6,7,8,9];

    for (let i = 0; i < 9; i++) {
      let numIndex = numList.findIndex(num => num == this.boardNums[row][i]);
      if (numIndex != -1) {
        numList.splice(numIndex, 1);
      }

      numIndex = numList.findIndex(num => num == this.boardNums[i][col]);
      if (numIndex != -1) {
        numList.splice(numIndex, 1);
      }
    }

    const sqRow = parseInt(row / 3) * 3;
    const sqCol = parseInt(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const numIndex = numList.findIndex(num => num == this.boardNums[i + sqRow][j + sqCol]);
        if (numIndex != -1) {
          numList.splice(numIndex, 1);
        }
      }
    }
    return numList;
  }

  // Returns current candidates (respecting solved cells and manual candidates) for every cell as a 2D array
  currentCandidates(providedCandidates) {
    const current = [];

    for (let row = 0; row < 9; row++) {
      current.push([])
      for (let col = 0; col < 9; col++) {
        if (this.boardNums[row][col] != 0) {
          // Number already filled, so no candidates
          current[row].push([])
        } else if (providedCandidates[row][col].length != 0) {
          // Use manually populated/overridden candidates
          current[row].push(providedCandidates[row][col])
        } else {
          // Use automatic candidates
          current[row].push(this.possibleNums(row, col))
        }
      }
    }

    return current;
  }

  boardRow(row) {
    const cells = [];

    for (let col = 0; col < 9; col++) {
      cells.push(this.boardNums[row][col]);
    }

    return cells;
  } 

  boardCol(col) {
    const cells = [];

    for (let row = 0; row < 9; row++) {
      cells.push(this.boardNums[row][col]);
    }

    return cells;
  } 

  boardHouse(largeRow, largeCol) {
    const cells = [];
    const sqRow = largeRow * 3;
    const sqCol = largeCol * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        cells.push(this.boardNums[sqRow + i][sqCol + j]);
      }
    }

    return cells;
  }

  candidatesRow(row) {
    const cells = [];

    for (let col = 0; col < 9; col++) {
      cells.push(this.candidates[row][col]);
    }

    return cells;
  } 

  candidatesCol(col) {
    const cells = [];

    for (let row = 0; row < 9; row++) {
      cells.push(this.candidates[row][col]);
    }

    return cells;
  } 

  candidatesHouse(largeRow, largeCol) {
    const cells = [];
    const sqRow = largeRow * 3;
    const sqCol = largeCol * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        cells.push(this.candidates[sqRow + i][sqCol + j]);
      }
    }

    return cells;
  }

  findUniqueCandidates(collection) {
    const frequency = new Map();
    const indices = new Map();

    for (let i = 0; i < collection.length; i++) {
      for (let digit of collection[i]) {
        // Increment frequency count and store collection index
        frequency.set(digit, (frequency.get(digit) || 0) + 1);
        indices.set(digit, i);
      }
    }

    // Collate list of digits seen exactly once
    const result = [];
    for (let [digit, count] of frequency) {
      if (count === 1) {
        result.push({ digit, index: indices.get(digit) });
      }
    }

    return result;
  }

  checkErrorHints(solution) {
    const hints = [];

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.boardNums[row][col] !== 0 && this.boardNums[row][col] !== solution[row][col]) {
          hints.push({
            row: row,
            col: col,
            error: true,
            link: '',
            linkText: 'Playing tips',
            title: 'Wrong value',
            description: 'Incorrect value for this cell.'
          });
        }
      }
    }

    return hints;
  }

  checkFullHouseHints() {
    const hints = [];

    for (let row = 0; row < 9; row++) {
      if (this.boardRow(row).filter(cell => cell > 0).length == 8) {
        hints.push({
          row: row,
          type: 'fullHouse',
          link: 'full-house',
          linkText: 'Learn this technique',
          title: 'Full house',
          description: 'This row has one empty cell — fill in the last missing digit.'
        });
      }
    }

    for (let col = 0; col < 9; col++) {
      if (this.boardCol(col).filter(cell => cell > 0).length == 8) {
        hints.push({
          col: col,
          type: 'fullHouse',
          link: 'full-house',
          linkText: 'Learn this technique',
          title: 'Full house',
          description: 'This column has one empty cell — fill in the last missing digit.'
        });
      }
    }

    for (let largeRow = 0; largeRow < 3; largeRow++) {
      for (let largeCol = 0; largeCol < 3; largeCol++) {
        if (this.boardHouse(largeRow, largeCol).filter(cell => cell > 0).length == 8) {
          hints.push({
            largeRow: largeRow,
            largeCol: largeCol,
            type: "fullHouse",
            link: 'full-house',
            linkText: 'Learn this technique',
            title: 'Full house',
            description: 'This subgrid has one empty cell — fill in the last missing digit.'
          });
        }
      }
    }

    return hints;
  }

  checkNakedSingleHints() {
    const hints = [];

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        // Look for cells with exactly one candidate remaining
        if (this.candidates[row][col].length == 1) {
          hints.push({
            row: row,
            col: col,
            type: "nakedSingle",
            link: 'naked-singles',
            linkText: 'Learn this technique',
            title: 'Naked single',
            description: 'This cell has only one possible value remaining.'
          });
        }
      }
    }

    return hints;
  }

  checkHiddenSingleHints() {
    const hints = [];

    for (let row = 0; row < 9; row++) {
      this.findUniqueCandidates(this.candidatesRow(row)).forEach(uniqueVal => {
        hints.push({
          row: row,
          // col: uniqueVal.index,
          digit: uniqueVal.digit,
          type: 'hiddenSingle',
          link: 'hidden-singles',
          linkText: 'Learn this technique',
          title: 'Hidden single',
          description: 'Look for a candidate that occurs only once in this row.'
        });
      });
    }

    for (let col = 0; col < 9; col++) {
      this.findUniqueCandidates(this.candidatesCol(col)).forEach(uniqueVal => {
        hints.push({
          // row: uniqueVal.index,
          col: col,
          digit: uniqueVal.digit,
          type: 'hiddenSingle',
          link: 'hidden-singles',
          linkText: 'Learn this technique',
          title: 'Hidden single',
          description: 'Look for a candidate that occurs only once in this column.'
        });
      });
    }

    for (let largeRow = 0; largeRow < 3; largeRow++) {
      for (let largeCol = 0; largeCol < 3; largeCol++) {
        this.findUniqueCandidates(this.candidatesHouse(largeRow, largeCol)).forEach(uniqueVal => {
          hints.push({
            // row: (largeRow * 3) + Math.floor(uniqueVal.index / 3),
            // col: (largeCol * 3) + uniqueVal.index % 3,
            largeRow: largeRow,
            largeCol: largeCol,
            digit: uniqueVal.digit,
            type: 'hiddenSingle',
            link: 'hidden-singles',
            linkText: 'Learn this technique',
            title: 'Hidden single',
            description: 'Look for a candidate that occurs only once in this subgrid.'
          });
        });
      }
    }

    return hints;
  }

  // Pointing:
  // If, for a given digit, all candidates in a house lie on the same row/column,
  // that digit can be eliminated from the rest of that row/column outside the house.
  checkPointingHints() {
    const hints = [];

    for (let largeRow = 0; largeRow < 3; largeRow++) {
      for (let largeCol = 0; largeCol < 3; largeCol++) {
        const rStart = largeRow * 3;
        const cStart = largeCol * 3;

        // digit -> list of global (r,c) positions inside this house
        const positionsByDigit = new Map();

        for (let r = rStart; r < rStart + 3; r++) {
          for (let c = cStart; c < cStart + 3; c++) {
            for (const d of this.candidates[r][c]) {
              if (!positionsByDigit.has(d)) positionsByDigit.set(d, []);
              positionsByDigit.get(d).push([r, c]);
            }
          }
        }

        // Evaluate each digit for pointing (row or column)
        for (const [digit, pos] of positionsByDigit.entries()) {
          if (pos.length === 0) continue;

          // Check row pointing
          const firstRow = pos[0][0];
          const allSameRow = pos.every(([r]) => r === firstRow);

          if (allSameRow) {
            // Is there at least one elimination candidate in the same row outside this house?
            let eliminationExists = false;
            for (let c = 0; c < 9 && !eliminationExists; c++) {
              if (c >= cStart && c < cStart + 3) continue; // skip inside-house columns
              if (this.candidates[firstRow][c].includes(digit)) eliminationExists = true;
            }

            if (eliminationExists) {
              hints.push({
                row: firstRow,
                largeRow,
                largeCol,
                digit,
                type: 'pointing',
                link: 'pointing',
                linkText: 'Learn this technique',
                title: 'Pointing',
                description: 'Candidates for a digit are confined to one row in the subgrid — eliminate it elsewhere in the row.'
              });
            }
          }

          // Check column pointing
          const firstCol = pos[0][1];
          const allSameCol = pos.every(([, c]) => c === firstCol);

          if (allSameCol) {
            // Is there at least one elimination candidate in the same column outside this house?
            let eliminationExists = false;
            for (let r = 0; r < 9 && !eliminationExists; r++) {
              if (r >= rStart && r < rStart + 3) continue; // skip inside-house rows
              if (this.candidates[r][firstCol].includes(digit)) eliminationExists = true;
            }

            if (eliminationExists) {
              hints.push({
                col: firstCol,
                largeRow,
                largeCol,
                digit,
                type: 'pointing',
                link: 'pointing',
                linkText: 'Learn this technique',
                title: 'Pointing',
                description: 'Candidates for a digit are confined to one column in the subgrid — eliminate it elsewhere in the column.'
              });
            }
          }
        }
      }
    }

    return hints;
  }

  // Claiming (box-line reduction):
  // If, in a given row (or column), all candidates for a digit lie in the SAME house,
  // then that digit can be eliminated from the rest of that house outside the row (or column).
  checkClaimingHints() {
    const hints = [];

    // ---- Row based claiming ----
    for (let row = 0; row < 9; row++) {
      // For each digit 1..9, collect columns in this row where it appears as a candidate
      const colsByDigit = new Map();
      for (let col = 0; col < 9; col++) {
        for (const d of this.candidates[row][col]) {
          if (!colsByDigit.has(d)) colsByDigit.set(d, []);
          colsByDigit.get(d).push(col);
        }
      }

      for (const [digit, cols] of colsByDigit.entries()) {
        if (cols.length === 0) continue;

        // Are all those columns inside the same house?
        const firstLargeCol = Math.floor(cols[0] / 3);
        const allSameHouse = cols.every(c => Math.floor(c / 3) === firstLargeCol);
        if (!allSameHouse) continue;

        const largeRow = Math.floor(row / 3);
        const largeCol = firstLargeCol;
        const rStart = largeRow * 3;
        const cStart = largeCol * 3;

        // Is there at least one elimination inside that house but NOT in this row?
        let eliminationExists = false;
        for (let r = rStart; r < rStart + 3 && !eliminationExists; r++) {
          if (r === row) continue; // skip the claiming row
          for (let c = cStart; c < cStart + 3 && !eliminationExists; c++) {
            if (this.candidates[r][c].includes(digit)) eliminationExists = true;
          }
        }

        if (eliminationExists) {
          hints.push({
            row,
            largeRow,
            largeCol,
            digit,
            type: 'claiming',
            link: 'claiming',
            linkText: 'Learn this technique',
            title: 'Claiming',
            description: 'Candidates for a digit in this row lie within one subgrid — remove it elsewhere in that subgrid.'
          });
        }
      }
    }

    // ---- Column based claiming ----
    for (let col = 0; col < 9; col++) {
      // For each digit 1..9, collect rows in this column where it appears as a candidate
      const rowsByDigit = new Map();
      for (let row = 0; row < 9; row++) {
        for (const d of this.candidates[row][col]) {
          if (!rowsByDigit.has(d)) rowsByDigit.set(d, []);
          rowsByDigit.get(d).push(row);
        }
      }

      for (const [digit, rows] of rowsByDigit.entries()) {
        if (rows.length === 0) continue;

        // Are all those rows inside the same house?
        const firstLargeRow = Math.floor(rows[0] / 3);
        const allSameHouse = rows.every(r => Math.floor(r / 3) === firstLargeRow);
        if (!allSameHouse) continue;

        const largeRow = firstLargeRow;
        const largeCol = Math.floor(col / 3);
        const rStart = largeRow * 3;
        const cStart = largeCol * 3;

        // Is there at least one elimination inside that house but NOT in this column?
        let eliminationExists = false;
        for (let r = rStart; r < rStart + 3 && !eliminationExists; r++) {
          for (let c = cStart; c < cStart + 3 && !eliminationExists; c++) {
            if (c === col) continue; // skip the claiming column
            if (this.candidates[r][c].includes(digit)) eliminationExists = true;
          }
        }

        if (eliminationExists) {
          hints.push({
            col,
            largeRow,
            largeCol,
            digit,
            type: 'claiming',
            link: 'claiming',
            linkText: 'Learn this technique',
            title: 'Claiming',
            description: 'Candidates for a digit in this column lie only within one subgrid — remove it elsewhere in that subgrid.'
          });
        }
      }
    }

    return hints;
  }

  checkNakedPairHints() {
    return this.checkNakedGroupHints(2, "Two", "Pair");
  }

  checkNakedTripleHints() {
    return this.checkNakedGroupHints(3, "Three", "Triple");
  }

  checkNakedQuadHints() {
    return this.checkNakedGroupHints(4, "Four", "Quad");
  }

  checkHiddenPairHints() {
    return this.checkHiddenGroupHints(2, "Two", "Pair");
  }

  checkHiddenTripleHints() {
    return this.checkHiddenGroupHints(3, "Three", "Triple");
  }

  checkHiddenQuadHints() {
    return this.checkHiddenGroupHints(4, "Four", "Quad");
  }

  // Generic naked group finder (pairs/triples/quads)
  // k = 2,3,4  |  word = "two" / "three" / "four"  |  label = "Pair" / "Triple" / "Quad"
  checkNakedGroupHints(k, word, label) {
    const hints = [];

    const propKey = label.toLowerCase();  // "pair"
    const typeKey = `naked${label}`;      // "nakedPair"
    const title = `Naked ${propKey}`;     // "Naked pair"
    const lowerWord = word.toLowerCase(); // "two"
    const link = `naked-${propKey}s`;     // "naked-pairs"
    const linkText = 'Learn this technique';

    const union = (arrs) => {
      const s = new Set();
      for (const a of arrs) for (const v of a) s.add(v);
      return Array.from(s);
    };

    const combosK = (idxs) => {
      const out = [];
      const cur = [];
      const rec = (start) => {
        if (cur.length === k) { out.push(cur.slice()); return; }
        for (let i = start; i < idxs.length; i++) {
          cur.push(idxs[i]); rec(i + 1); cur.pop();
        }
      };
      rec(0);
      return out;
    };

    // ---- Row based naked groups ----
    for (let row = 0; row < 9; row++) {
      const cells = []; // {col, cand}
      for (let col = 0; col < 9; col++) {
        const cand = this.candidates[row][col];
        const ok = (k === 2) ? (cand.length === 2) : (cand.length >= 2 && cand.length <= k);
        if (ok) cells.push({ col, cand });
      }
      const idxs = cells.map((_, i) => i);
      for (const combo of combosK(idxs)) {
        const group = combo.map(i => cells[i]);
        const u = union(group.map(c => c.cand));
        if (u.length !== k) continue;
        const uSet = new Set(u);
        // each member must be subset of the union (always true, but explicit is fine)
        if (!group.every(c => c.cand.every(d => uSet.has(d)))) continue;

        // real elimination elsewhere in the row?
        let eliminationExists = false;
        for (let c = 0; c < 9 && !eliminationExists; c++) {
          if (group.some(g => g.col === c)) continue;
          if (this.candidates[row][c].some(d => uSet.has(d))) eliminationExists = true;
        }

        if (eliminationExists) {
          hints.push({
            row,
            type: typeKey,
            link,
            linkText,
            title,
            description: `${word} cells in this row share ${lowerWord} digits; remove those digits from other cells in the row.`
          });
        }
      }
    }

    // ---- Column based naked groups ----
    for (let col = 0; col < 9; col++) {
      const cells = []; // {row, cand}
      for (let row = 0; row < 9; row++) {
        const cand = this.candidates[row][col];
        const ok = (k === 2) ? (cand.length === 2) : (cand.length >= 2 && cand.length <= k);
        if (ok) cells.push({ row, cand });
      }
      const idxs = cells.map((_, i) => i);
      for (const combo of combosK(idxs)) {
        const group = combo.map(i => cells[i]);
        const u = union(group.map(c => c.cand));
        if (u.length !== k) continue;
        const uSet = new Set(u);
        // each member must be subset of the union (always true, but explicit is fine)
        if (!group.every(c => c.cand.every(d => uSet.has(d)))) continue;

        let eliminationExists = false;
        for (let r = 0; r < 9 && !eliminationExists; r++) {
          if (group.some(g => g.row === r)) continue;
          if (this.candidates[r][col].some(d => uSet.has(d))) eliminationExists = true;
        }

        if (eliminationExists) {
          hints.push({
            col,
            type: typeKey,
            link,
            linkText,
            title,
            description: `${word} cells in this column share ${lowerWord} digits; remove those digits from other cells in the column.`
          });
        }
      }
    }

    // ---- Subgrid/House based hidden groups ----
    for (let largeRow = 0; largeRow < 3; largeRow++) {
      for (let largeCol = 0; largeCol < 3; largeCol++) {
        const rStart = largeRow * 3, cStart = largeCol * 3;

        const cells = []; // {row, col, cand}
        for (let r = rStart; r < rStart + 3; r++) {
          for (let c = cStart; c < cStart + 3; c++) {
            const cand = this.candidates[r][c];
            const ok = (k === 2) ? (cand.length === 2) : (cand.length >= 2 && cand.length <= k);
            if (ok) cells.push({ row: r, col: c, cand });
          }
        }

        const idxs = cells.map((_, i) => i);
        for (const combo of combosK(idxs)) {
          const group = combo.map(i => cells[i]);
          const u = union(group.map(c => c.cand));
          if (u.length !== k) continue;
          const uSet = new Set(u);
          // each member must be subset of the union (always true, but explicit is fine)
          if (!group.every(c => c.cand.every(d => uSet.has(d)))) continue;

          // real elimination inside the house, outside the k cells?
          let eliminationExists = false;
          for (let r = rStart; r < rStart + 3 && !eliminationExists; r++) {
            for (let c = cStart; c < cStart + 3 && !eliminationExists; c++) {
              if (group.some(g => g.row === r && g.col === c)) continue;
              if (this.candidates[r][c].some(d => uSet.has(d))) eliminationExists = true;
            }
          }

          if (eliminationExists) {
            hints.push({
              largeRow,
              largeCol,
              type: typeKey,
              link,
              linkText,
              title,
              description: `${word} cells in this subgrid share ${lowerWord} digits; remove those digits from other cells in the subgrid.`
            });
          }
        }
      }
    }

    return hints;
  }

  // Generic hidden group finder (pairs/triples/quads)
  // k = 2,3,4  |  word = "two" / "three" / "four"  |  label = "Pair" / "Triple" / "Quad"
  checkHiddenGroupHints(k, word, label) {
    const hints = [];

    const propKey = label.toLowerCase();  // "pair"
    const typeKey = `hidden${label}`;     // "hiddenPair"
    const title = `Hidden ${propKey}`;    // "Hidden pair"
    const lowerWord = word.toLowerCase(); // "two"
    const link = `hidden-${propKey}s`;    // "hidden-pairs"
    const linkText = 'Learn this technique';

    const sortNum = (a,b)=>a-b;

    const combosK = (arr) => {
      const out = [];
      const n = arr.length;
      const rec = (start, pick, acc) => {
        if (pick === 0) {
          out.push(acc.slice()); 
          return;
        }
        for (let i = start; i <= n - pick; i++) {
          acc.push(arr[i]); rec(i + 1, pick - 1, acc); acc.pop();
        }
      };
      rec(0, k, []);
      return out;
    };

    // ---- Row based hidden groups ----
    for (let row = 0; row < 9; row++) {
      // digit -> columns that contain this digit in row
      const colsByDigit = new Map();
      for (let col = 0; col < 9; col++) {
        for (const d of this.candidates[row][col]) {
          if (!colsByDigit.has(d)) colsByDigit.set(d, []);
          colsByDigit.get(d).push(col);
        }
      }

      const digits = [...colsByDigit.keys()];
      for (const groupDigits of combosK(digits)) {
        // union of columns for these digits
        const colSet = new Set();
        for (const d of groupDigits) {
          for (const c of (colsByDigit.get(d) || [])) {
            colSet.add(c);
          }
        }
        if (colSet.size !== k) continue;

        const cols = [...colSet].sort(sortNum);
        const dset = new Set(groupDigits);
        const eliminationExists = cols.some(c => this.candidates[row][c].some(x => !dset.has(x)));

        if (eliminationExists) {
          hints.push({
            row,
            type: typeKey,
            link,
            linkText,
            title,
            description: `${word} digits appear only in ${lowerWord} cells of this row; remove other candidates from those cells.`
          });
        }
      }
    }

    // ---- Column based hidden groups ----
    for (let col = 0; col < 9; col++) {
      // digit -> rows that contain this digit in column
      const rowsByDigit = new Map();
      for (let row = 0; row < 9; row++) {
        for (const d of this.candidates[row][col]) {
          if (!rowsByDigit.has(d)) rowsByDigit.set(d, []);
          rowsByDigit.get(d).push(row);
        }
      }

      const digits = [...rowsByDigit.keys()];
      for (const groupDigits of combosK(digits)) {
        // union of rows for these digits
        const rowSet = new Set();
        for (const d of groupDigits) {
          for (const r of (rowsByDigit.get(d) || [])) {
            rowSet.add(r);
          }
        }
        if (rowSet.size !== k) continue;

        const rows = [...rowSet].sort(sortNum);
        const dset = new Set(groupDigits);
        const eliminationExists = rows.some(r => this.candidates[r][col].some(x => !dset.has(x)));

        if (eliminationExists) {
          hints.push({
            col,
            type: typeKey,
            link,
            linkText,
            title,
            description: `${word} digits appear only in ${lowerWord} cells of this column; remove other candidates from those cells.`
          });
        }
      }
    }

    // ---- Subgrid/House based hidden groups ----
    for (let largeRow = 0; largeRow < 3; largeRow++) {
      for (let largeCol = 0; largeCol < 3; largeCol++) {
        const rStart = largeRow * 3, cStart = largeCol * 3;
        // digit -> list of cells [r,c] inside this house
        const cellsByDigit = new Map();
        for (let r = rStart; r < rStart + 3; r++) {
          for (let c = cStart; c < cStart + 3; c++) {
            for (const d of this.candidates[r][c]) {
              if (!cellsByDigit.has(d)) cellsByDigit.set(d, []);
              cellsByDigit.get(d).push([r,c]);
            }
          }
        }

        const digits = [...cellsByDigit.keys()];
        for (const groupDigits of combosK(digits)) {
          // union of cells for these digits
          const seen = new Set();
          const cells = [];
          for (const d of groupDigits) {
            for (const [r,c] of (cellsByDigit.get(d) || [])) {
              const key = `${r},${c}`;
              if (!seen.has(key)) { seen.add(key); cells.push([r,c]); }
            }
          }
          if (cells.length !== k) continue;

          const dset = new Set(groupDigits);
          const eliminationExists = cells.some(([r,c]) => this.candidates[r][c].some(x => !dset.has(x)));

          if (eliminationExists) {
            hints.push({
              largeRow,
              largeCol,
              type: typeKey,
              link,
              linkText,
              title,
              description: `${word} digits appear only in ${lowerWord} cells of this subgrid; remove other candidates from those cells.`
            });
          }
        }
      }
    }

    return hints;
  }

  // X-Wing:
  // For a given digit, if two rows have that digit as candidates in exactly the same two columns,
  // then the digit can be eliminated from those columns in all OTHER rows (row-based X-Wing).
  // Symmetrically for columns: if two columns share exactly the same two rows for that digit,
  // then eliminate the digit from those rows in all OTHER columns (column-based X-Wing).
  checkXWingHints() {
    const hints = [];

    // ---- Row based X-Wing ----
    for (let digit = 1; digit <= 9; digit++) {
      // Map "c1,c2" -> [row indices]
      const rowsByColPair = new Map();

      for (let r = 0; r < 9; r++) {
        const colsWithDigit = [];
        for (let c = 0; c < 9; c++) {
          if (this.candidates[r][c].includes(digit)) colsWithDigit.push(c);
        }
        if (colsWithDigit.length === 2) {
          const key = colsWithDigit.slice().sort((a,b)=>a-b).join(',');
          if (!rowsByColPair.has(key)) rowsByColPair.set(key, []);
          rowsByColPair.get(key).push(r);
        }
      }

      // For each pair of rows sharing the same 2 columns, verify eliminations exist
      for (const [key, rows] of rowsByColPair.entries()) {
        if (rows.length !== 2) continue;
        const [c1, c2] = key.split(',').map(n => parseInt(n, 10));
        const [r1, r2] = rows;

        // Real elimination exists if some OTHER row has the digit in either of these columns
        let eliminationExists = false;
        for (let r = 0; r < 9 && !eliminationExists; r++) {
          if (r === r1 || r === r2) continue;
          if (this.candidates[r][c1].includes(digit) || this.candidates[r][c2].includes(digit)) eliminationExists = true;
        }

        if (eliminationExists) {
          hints.push({
            rows: [r1, r2].sort((a,b)=>a-b),
            cols: [c1, c2].sort((a,b)=>a-b),
            digit,
            type: 'xWing',
            link: 'x-wing',
            linkText: 'Learn this technique',
            title: 'X-Wing',
            description: `The digit ${digit} forms an X-Wing across two rows and two columns; eliminate it from other rows in those columns.`
          });
        }
      }
    }

    // ---- Column based X-Wing ----
    for (let digit = 1; digit <= 9; digit++) {
      // Map "r1,r2" -> [column indices]
      const colsByRowPair = new Map();

      for (let c = 0; c < 9; c++) {
        const rowsWithDigit = [];
        for (let r = 0; r < 9; r++) {
          if (this.candidates[r][c].includes(digit)) rowsWithDigit.push(r);
        }
        if (rowsWithDigit.length === 2) {
          const key = rowsWithDigit.slice().sort((a,b)=>a-b).join(',');
          if (!colsByRowPair.has(key)) colsByRowPair.set(key, []);
          colsByRowPair.get(key).push(c);
        }
      }

      // For each pair of columns sharing the same 2 rows, verify eliminations exist
      for (const [key, cols] of colsByRowPair.entries()) {
        if (cols.length !== 2) continue;
        const [r1, r2] = key.split(',').map(n => parseInt(n, 10));
        const [c1, c2] = cols;

        // Real elimination exists if some OTHER column has the digit in either of these rows
        let eliminationExists = false;
        for (let c = 0; c < 9 && !eliminationExists; c++) {
          if (c === c1 || c === c2) continue;
          if (this.candidates[r1][c].includes(digit) || this.candidates[r2][c].includes(digit)) eliminationExists = true;
        }

        if (eliminationExists) {
          hints.push({
            rows: [r1, r2].sort((a,b)=>a-b),
            cols: [c1, c2].sort((a,b)=>a-b),
            digit,
            type: 'xWing',
            link: 'x-wing',
            linkText: 'Learn this technique',
            title: 'X-Wing',
            description: `The digit ${digit} forms an X-Wing across two columns and two rows; eliminate it from other columns in those rows.`
          });
        }
      }
    }

    return hints;
  }
}
