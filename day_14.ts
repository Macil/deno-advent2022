import { parseArgs } from "@std/cli/parse-args";
import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";
// deno-lint-ignore no-import-prefix
import { createCanvas } from "https://deno.land/x/canvas@v1.4.2/mod.ts";

type CellState = undefined | "wall" | "sand" | "source";

class Board {
  private values: CellState[][] = [];
  private source: Position | undefined;
  private lowestY = 0;

  constructor(private hasFloor: boolean) {
  }

  get(x: number, y: number): CellState {
    if (this.hasFloor && y === this.lowestY + 2) {
      return "wall";
    }
    return this.values[y]?.[x];
  }

  set(x: number, y: number, value: CellState): void {
    if (value === "source") {
      this.source = { x, y };
    }
    if (this.values[y] === undefined) {
      this.values[y] = [];
    }
    this.values[y][x] = value;
  }

  setLowestY() {
    this.lowestY = this.values.length - 1;
  }

  /** @returns true if anything changed, false if new sand fell off */
  step(): boolean {
    // find spot to place new sand
    if (!this.source) {
      throw new Error("No source");
    }
    const candidate = structuredClone(this.source);
    while (true) {
      if (!this.hasFloor && candidate.y === this.lowestY) {
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
    const candidateCell = this.get(candidate.x, candidate.y);
    if (candidateCell === undefined || candidateCell === "source") {
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

  print() {
    const minX = Math.min(
      ...this.values.map((row) => Math.min(...Object.keys(row).map(Number))),
    ) - 2;
    const maxX = Math.max(
      ...this.values.map((row) => Math.max(...Object.keys(row).map(Number))),
    ) + 2;
    const maxY = this.values.length;
    for (let y = 0; y <= maxY; y++) {
      const lineParts: string[] = [];
      for (let x = minX; x <= maxX; x++) {
        const cell = this.get(x, y);
        if (cell === undefined) {
          lineParts.push(".");
        } else if (cell === "wall") {
          lineParts.push("#");
        } else if (cell === "sand") {
          lineParts.push("o");
        } else if (cell === "source") {
          lineParts.push("+");
        }
      }
      const line = lineParts.join("");
      console.log(line);
    }
  }

  async saveToImage(filename: string) {
    const minX = Math.min(
      ...this.values.map((row) => Math.min(...Object.keys(row).map(Number))),
    ) - 2;
    const maxX = Math.max(
      ...this.values.map((row) => Math.max(...Object.keys(row).map(Number))),
    ) + 2;
    const maxY = this.values.length;

    const cellHeight = 8;
    const cellWidth = 8;

    const canvas = createCanvas(
      (maxX - minX + 1) * cellWidth,
      (maxY + 1) * cellHeight,
    );
    const ctx = canvas.getContext("2d");

    for (let y = 0; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const cell = this.get(x, y);
        if (cell !== undefined) {
          if (cell === "wall") {
            ctx.fillStyle = "gray";
          } else if (cell === "sand") {
            ctx.fillStyle = "yellow";
          } else if (cell === "source") {
            ctx.fillStyle = "blue";
          }
          ctx.fillRect(
            (x - minX) * cellWidth,
            y * cellHeight,
            cellWidth,
            cellHeight,
          );
        }
      }
    }
    await Deno.writeFile(filename, canvas.toBuffer());
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

function parseBoard(input: string, hasFloor: boolean): Board {
  const board = new Board(hasFloor);
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
  board.setLowestY();
  return board;
}

function part1(input: string): number {
  const board = parseBoard(input, false);
  while (board.step()) {
    // run until nothing changes
  }
  return board.countSand();
}

async function part2(input: string): Promise<number> {
  const board = parseBoard(input, true);
  while (board.step()) {
    // run until nothing changes
  }
  const parsedArgs = parseArgs(Deno.args);
  if (parsedArgs.print) {
    board.print();
  }
  const filename = parsedArgs.saveToImage;
  if (typeof filename === "string") {
    await board.saveToImage(filename);
  }
  return board.countSand();
}

if (import.meta.main) {
  runPart(2022, 14, 1, part1);
  runPart(2022, 14, 2, part2);
}

const TEST_INPUT = `\
498,4 -> 498,6 -> 496,6
503,4 -> 502,4 -> 502,9 -> 494,9
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 24);
});

Deno.test("part2", async () => {
  assertEquals(await part2(TEST_INPUT), 93);
});
