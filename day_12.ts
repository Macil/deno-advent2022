import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.0/mod.ts";
import { aStar } from "https://deno.land/x/lazy_pathfinding@v1.0.0/directed/a_star.ts";

type Pos = {
  x: number;
  y: number;
};

interface Map {
  start: Pos;
  end: Pos;
  heightMap: number[][];
}

function parse(input: string): Map {
  let start: Pos | undefined;
  let end: Pos | undefined;
  const heightMap = input.trimEnd().split("\n")
    .map((line, y) =>
      line.split("").map((char, x) => {
        if (char === "S") {
          start = { x, y };
          return 0;
        } else if (char === "E") {
          end = { x, y };
          return 25;
        } else {
          const charCode = char.charCodeAt(0);
          return charCode - "a".charCodeAt(0);
        }
      })
    );
  if (!start || !end) {
    throw new Error("Missing start or end");
  }
  return { start, end, heightMap };
}

function heightAt(map: Map, pos: Pos): number {
  return map.heightMap[pos.y][pos.x];
}

function* neighbors(map: Map, pos: Pos): Iterable<Pos> {
  const { x, y } = pos;
  const canReachHeight = heightAt(map, pos) + 1;
  if (x > 0) {
    const left = { x: x - 1, y };
    if (heightAt(map, left) <= canReachHeight) {
      yield left;
    }
  }
  if (x < map.heightMap[0].length - 1) {
    const right = { x: x + 1, y };
    if (heightAt(map, right) <= canReachHeight) {
      yield right;
    }
  }
  if (y > 0) {
    const up = { x, y: y - 1 };
    if (heightAt(map, up) <= canReachHeight) {
      yield up;
    }
  }
  if (y < map.heightMap.length - 1) {
    const down = { x, y: y + 1 };
    if (heightAt(map, down) <= canReachHeight) {
      yield down;
    }
  }
}

function part1(input: string): number {
  const map = parse(input);
  const result = aStar({
    start: map.start,
    *successors(pos: Pos) {
      for (const neighbor of neighbors(map, pos)) {
        yield [neighbor, 1];
      }
    },
    heuristic: (pos: Pos) =>
      Math.max(
        // Manhattan distance on x and y
        Math.abs(pos.x - map.end.x) + Math.abs(pos.y - map.end.y),
        // Amount of upward steps needed
        heightAt(map, map.end) - heightAt(map, pos),
        0,
      ),
    success: (pos: Pos) => pos.x === map.end.x && pos.y === map.end.y,
    key: (pos: Pos) => `${pos.x},${pos.y}`,
  });
  const [_path, cost] = result!;
  return cost;
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2022, 12, 1, part1);
  // runPart(2022, 12, 2, part2);
}

const TEST_INPUT = `\
Sabqponm
abcryxxl
accszExk
acctuvwj
abdefghi
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 31);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
