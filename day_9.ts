import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.0/mod.ts";

interface Coordinate {
  x: number;
  y: number;
}

type Rope = Coordinate[];

type Direction = "U" | "D" | "L" | "R";

interface Instruction {
  direction: Direction;
  distance: number;
}

function parse(input: string): Instruction[] {
  return input.trimEnd().split("\n").map((line) => {
    const [direction, distance] = line.split(" ");
    return {
      direction: direction as Direction,
      distance: Number(distance),
    };
  });
}

function isNeighbor(a: Coordinate, b: Coordinate): boolean {
  return Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1;
}

function countTailPositionsAfterInstructions(
  rope: Rope,
  instructions: Instruction[],
): number {
  // Set contains values like "3,4"
  const tailSeenPositions = new Set<string>(["0,0"]);

  for (const { direction, distance } of instructions) {
    for (let step = 0; step < distance; step++) {
      switch (direction) {
        case "U":
          rope[0].y += 1;
          break;
        case "D":
          rope[0].y -= 1;
          break;
        case "L":
          rope[0].x -= 1;
          break;
        case "R":
          rope[0].x += 1;
          break;
      }
      for (let i = 1; i < rope.length; i++) {
        const prevKnot = rope[i - 1];
        const currentKnot = rope[i];
        if (isNeighbor(prevKnot, currentKnot)) {
          break;
        }
        if (prevKnot.y === currentKnot.y) {
          if (prevKnot.x === currentKnot.x + 2) {
            currentKnot.x += 1;
          } else if (prevKnot.x === currentKnot.x - 2) {
            currentKnot.x -= 1;
          }
        } else if (prevKnot.x === currentKnot.x) {
          if (prevKnot.y === currentKnot.y + 2) {
            currentKnot.y += 1;
          } else if (prevKnot.y === currentKnot.y - 2) {
            currentKnot.y -= 1;
          }
        } else {
          const dx = Math.max(-1, Math.min(1, prevKnot.x - currentKnot.x));
          const dy = Math.max(-1, Math.min(1, prevKnot.y - currentKnot.y));
          currentKnot.x += dx;
          currentKnot.y += dy;
        }
        // is this the tail?
        if (i === rope.length - 1) {
          tailSeenPositions.add(`${currentKnot.x},${currentKnot.y}`);
        }
      }
    }
  }

  return tailSeenPositions.size;
}

function part1(input: string): number {
  const instructions = parse(input);

  // Use map to create coordinate objects instead of using fill, so each coordinate is a unique object
  const rope: Rope = Array(2).fill(null).map(() => ({ x: 0, y: 0 }));

  return countTailPositionsAfterInstructions(rope, instructions);
}

function part2(input: string): number {
  const instructions = parse(input);

  // Use map to create coordinate objects instead of using fill, so each coordinate is a unique object
  const rope: Rope = Array(10).fill(null).map(() => ({ x: 0, y: 0 }));

  return countTailPositionsAfterInstructions(rope, instructions);
}

if (import.meta.main) {
  runPart(2022, 9, 1, part1);
  runPart(2022, 9, 2, part2);
}

const TEST_INPUT = `\
R 4
U 4
L 3
D 1
R 4
D 1
L 5
R 2
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 13);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 1);

  const LARGER_INPUT = `\
R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20
`;
  assertEquals(part2(LARGER_INPUT), 36);
});
