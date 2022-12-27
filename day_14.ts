import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.0/mod.ts";

type CellState = undefined | "wall" | "sand" | "source";

class Board {
  values: CellState[][] = [];
  source: Position | undefined;
  lowestY = 0;

  get(x: number, y: number): CellState {
    return this.values[y]?.[x];
  }

  set(x: number, y: number, value: CellState): void {
    if (y > this.lowestY) {
      this.lowestY = y;
    }
    if (value === "source") {
      this.source = { x, y };
    }
    if (this.values[y] === undefined) {
      this.values[y] = [];
    }
    this.values[y][x] = value;
  }

  /** @returns true if anything changed, false if new sand fell off */
  step(): boolean {
    // find spot to place new sand
    const candidate = structuredClone(this.source);
    while (true) {
      if (candidate.y === this.lowestY) {
        // sand must be falling off the edge
        return false;
      }
      if (this.get(candidate.x, candidate.y + 1) === undefined) {
        candidate.y++;
        continue;
      }
      if (this.get(candidate.x - 1, candidate.y + 1) === undefined) {
        candidate.x--;
        candidate.y++;
        continue;
      }
      if (this.get(candidate.x + 1, candidate.y + 1) === undefined) {
        candidate.x++;
        candidate.y++;
        continue;
      }
      break;
    }
    if (this.get(candidate.x, candidate.y) === undefined) {
      this.set(candidate.x, candidate.y, "sand");
      return true;
    }
    return false;
  }

  countSand(): number {
    return this.values.reduce((sum, row) => {
      return sum +
        row.reduce((sum, cellState) => sum + (cellState === "sand" ? 1 : 0), 0);
    }, 0);
  }
}

interface Position {
  /** distance to the right */
  x: number;
  /** distance down */
  y: number;
}

function parsePosition(input: string): Position {
  const [x, y] = input.split(",").map(Number);
  return { x, y };
}

function parse(input: string): Board {
  const board = new Board();
  board.set(500, 0, "source");
  for (const line of input.trimEnd().split("\n")) {
    const positions = line.split(" -> ").map(parsePosition);
    let current = positions[0];
    for (const next of positions.slice(1)) {
      if (current.x === next.x) {
        for (
          let y = Math.min(current.y, next.y);
          y <= Math.max(current.y, next.y);
          y++
        ) {
          board.set(current.x, y, "wall");
        }
      } else {
        for (
          let x = Math.min(current.x, next.x);
          x <= Math.max(current.x, next.x);
          x++
        ) {
          board.set(x, current.y, "wall");
        }
      }
      current = next;
    }
  }
  return board;
}

function part1(input: string): number {
  const board = parse(input);
  while (board.step()) {
    // run until nothing changes
  }
  return board.countSand();
}

// function part2(input: string): number {
//   const board = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2022, 14, 1, part1);
  // runPart(2022, 14, 2, part2);
}

const TEST_INPUT = `\
498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 24);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
