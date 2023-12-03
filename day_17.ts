import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

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
  #width: number;
  #data: Shape = [];

  constructor(width = 7) {
    this.#width = width;
  }

  getHeight(): number {
    return this.#data.length;
  }

  doesShapeFit(
    shape: Shape,
    x: number,
    y: number,
  ): boolean {
    if (y < 0 || x < 0 || x + shape[0].length > this.#width) {
      return false;
    }
    return shape.every((shapeRow, sy) => {
      const boardRow = this.#data[y + sy];
      if (!boardRow) {
        return true;
      }
      return shapeRow.every((shapeCell, sx) => {
        return !shapeCell || !boardRow[x + sx];
      });
    });
  }

  addShape(shape: Shape, x: number, y: number): void {
    for (let sy = 0; sy < shape.length; sy++) {
      let boardRow = this.#data[y + sy];
      if (!boardRow) {
        boardRow = this.#data[y + sy] = new Array(this.#width).fill(false);
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

  for (let rock = 0; rock < rocks; rock++) {
    const shape = getShape();
    let shapeX = SHAPE_SPAWN_SPACE_LEFT;
    let shapeY = board.getHeight() + SHAPE_SPAWN_SPACE_DOWN;
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

function part1(input: string): number {
  const commands = parse(input);
  return getHeightAfterRockCount(commands, 2022);
}

// function part2(input: string): number {
//   const commands = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2022, 17, 1, part1);
  // runPart(2022, 17, 2, part2);
}

const TEST_INPUT = `\
>>><<><>><<<>><>>><<<>>><<<><<<>><>><<>>
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 3068);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
