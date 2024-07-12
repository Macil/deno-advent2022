import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

/**
 * Array of rows, where each row is an array of booleans from left to right.
 * The first row is the bottom row.
 */
type Shape = Array<Array<boolean>>;

function parseShape(shape: string): Shape {
  return shape.trimEnd().split("\n").reverse().map((line) =>
    Array.from(line).map((c) => c === "#")
  );
}

const SHAPES = [
  `\
####`,
  `\
.#.
###
.#.
`,
  `\
..#
..#
###
`,
  `\
#
#
#
#
`,
  `\
##
##
`,
].map(parseShape);

type Commands = Array<"<" | ">">;

function parse(input: string): Commands {
  return Array.from(input.trimEnd()).map((c) => {
    if (c === "<" || c === ">") {
      return c;
    }
    throw new Error("Bad char: " + c);
  });
}

class Board {
  readonly #width: number;
  #height = 0;
  #addedHeight = 0;
  data: Shape = [];

  constructor(width = 7) {
    this.#width = width;
  }

  doesShapeFit(
    shape: Shape,
    x: number,
    y: number,
  ): boolean {
    y -= this.#addedHeight;
    if (y < 0 || x < 0 || x + shape[0].length > this.#width) {
      return false;
    }
    return shape.every((shapeRow, sy) => {
      const boardRow = this.data[y + sy];
      if (!boardRow) {
        return true;
      }
      return shapeRow.every((shapeCell, sx) => {
        return !shapeCell || !boardRow[x + sx];
      });
    });
  }

  getHeight() {
    return this.#height + this.#addedHeight;
  }

  addHeight(height: number) {
    this.#addedHeight += height;
  }

  addShape(shape: Shape, x: number, y: number): void {
    y -= this.#addedHeight;
    for (let sy = 0; sy < shape.length; sy++) {
      let boardRow = this.data[y + sy];
      if (!boardRow) {
        boardRow = this.data[y + sy] = new Array(this.#width).fill(false);
        this.#height++;
      }
      for (let sx = 0; sx < shape[sy].length; sx++) {
        if (shape[sy][sx]) {
          boardRow[x + sx] = true;
        }
      }
    }
  }
}

function getHeightAfterRockCount(commands: Commands, rocks: number): number {
  const SHAPE_SPAWN_SPACE_LEFT = 2;
  const SHAPE_SPAWN_SPACE_DOWN = 3;

  const board = new Board();

  let shapeIndex = 0;
  function getShape(): Shape {
    const shape = SHAPES[shapeIndex];
    if (shapeIndex === SHAPES.length - 1) {
      shapeIndex = 0;
    } else {
      shapeIndex++;
    }
    return shape;
  }

  let commandIndex = 0;
  function getCommand(): "<" | ">" {
    const command = commands[commandIndex];
    if (commandIndex === commands.length - 1) {
      commandIndex = 0;
    } else {
      commandIndex++;
    }
    return command;
  }

  const seenSurfaces = new Map<number, SeenSurface[]>();

  for (let rock = 0; rock < rocks; rock++) {
    // Check if we've seen this surface before, else cache this one
    const seenSurface: SeenSurface = {
      surface: new Surface(board.data, shapeIndex, commandIndex),
      turnNumber: rock,
      height: board.getHeight(),
    };
    let seenSurfacesForHash = seenSurfaces.get(seenSurface.surface.hashCode());
    if (!seenSurfacesForHash) {
      seenSurfacesForHash = [];
      seenSurfaces.set(seenSurface.surface.hashCode(), seenSurfacesForHash);
    }
    const matchingPreviousSeenSurface = seenSurfacesForHash.find((s) =>
      s.surface.equals(seenSurface.surface)
    );
    if (matchingPreviousSeenSurface) {
      const turnDifference = seenSurface.turnNumber -
        matchingPreviousSeenSurface.turnNumber;
      const heightDifference = seenSurface.height -
        matchingPreviousSeenSurface.height;
      const stepsToSkip = Math.floor(
        (rocks - rock - 1) / turnDifference,
      );
      rock += stepsToSkip * turnDifference;
      board.addHeight(stepsToSkip * heightDifference);
    } else {
      seenSurfacesForHash.push(seenSurface);
    }

    // Pick a shape
    const shape = getShape();
    let shapeX = SHAPE_SPAWN_SPACE_LEFT;
    let shapeY = board.getHeight() + SHAPE_SPAWN_SPACE_DOWN;

    // Place a rock
    while (true) {
      const command = getCommand();
      const attemptX = shapeX + (command === "<" ? -1 : 1);
      if (board.doesShapeFit(shape, attemptX, shapeY)) {
        shapeX = attemptX;
      }
      const attemptY = shapeY - 1;
      if (board.doesShapeFit(shape, shapeX, attemptY)) {
        shapeY = attemptY;
      } else {
        board.addShape(shape, shapeX, shapeY);
        break;
      }
    }
  }

  return board.getHeight();
}

function part1(input: string, steps = 2022): number {
  const commands = parse(input);
  return getHeightAfterRockCount(commands, steps);
}

class Surface {
  readonly #surfaceData: Shape;
  readonly #shapeIndex: number;
  readonly #commandIndex: number;

  constructor(
    data: Shape,
    shapeIndex: number,
    commandIndex: number,
  ) {
    // A more principled approach would be to keep only the data for the minimum amount of rows
    // until there's a path of solid blocks from the left to the right side of the board.
    // We're assuming here that 50 rows is enough.
    this.#surfaceData = data.slice(-50);
    this.#shapeIndex = shapeIndex;
    this.#commandIndex = commandIndex;
  }

  hashCode(): number {
    return this.#commandIndex * 100 + this.#shapeIndex;
  }

  equals(other: Surface): boolean {
    if (this.#commandIndex !== other.#commandIndex) {
      return false;
    }
    if (this.#shapeIndex !== other.#shapeIndex) {
      return false;
    }
    if (this.#surfaceData.length !== other.#surfaceData.length) {
      return false;
    }
    return this.#surfaceData.every((row, y) => {
      const otherRow = other.#surfaceData[y];
      if (row.length !== otherRow.length) {
        return false;
      }
      return row.every((cell, x) => cell === otherRow[x]);
    });
  }
}

interface SeenSurface {
  surface: Surface;
  turnNumber: number;
  height: number;
}

function part2(input: string): number {
  const commands = parse(input);
  return getHeightAfterRockCount(commands, 1000000000000);
}

if (import.meta.main) {
  runPart(2022, 17, 1, part1);
  runPart(2022, 17, 2, part2);
}

const TEST_INPUT = `\
>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 3068);
});

Deno.test("1500", () => {
  assertEquals(part1(TEST_INPUT, 1500), 2277);
});

Deno.test("1800", () => {
  assertEquals(part1(TEST_INPUT, 1800), 2728);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 1514285714288);
});
