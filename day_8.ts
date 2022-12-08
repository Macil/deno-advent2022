import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.2.2/mod.ts";

function parse(input: string): number[][] {
  return input.trimEnd().split("\n")
    .map((line) => Array.from(line).map(Number));
}

// a tree is hidden if there are taller trees in the way in each cardinal direction
function isTreeVisible(grid: number[][], x: number, y: number): boolean {
  const treeHeight = grid[y][x];

  const width = grid[0].length;
  const height = grid.length;

  {
    let visible = true;
    for (let x2 = 0; x2 < x; x2++) {
      if (grid[y][x2] >= treeHeight) {
        visible = false;
        break;
      }
    }
    if (visible) {
      return true;
    }
  }
  {
    let visible = true;
    for (let x2 = x + 1; x2 < width; x2++) {
      if (grid[y][x2] >= treeHeight) {
        visible = false;
        break;
      }
    }
    if (visible) {
      return true;
    }
  }
  {
    let visible = true;
    for (let y2 = 0; y2 < y; y2++) {
      if (grid[y2][x] >= treeHeight) {
        visible = false;
        break;
      }
    }
    if (visible) {
      return true;
    }
  }
  {
    let visible = true;
    for (let y2 = y + 1; y2 < height; y2++) {
      if (grid[y2][x] >= treeHeight) {
        visible = false;
        break;
      }
    }
    if (visible) {
      return true;
    }
  }
  return false;
}

function part1(input: string): number {
  const grid = parse(input);
  let visibleTrees = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (isTreeVisible(grid, x, y)) {
        visibleTrees++;
      }
    }
  }
  return visibleTrees;
}

// function part2(input: string): number {
//   const grid = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2022, 8, 1, part1);
  // runPart(2022, 8, 2, part2);
}

const TEST_INPUT = `\
30373
25512
65332
33549
35390
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 21);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
