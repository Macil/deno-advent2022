import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.0/mod.ts";

interface Elf {
  food: number[];
}

function parse(input: string): Elf[] {
  const elves: Elf[] = [];
  let currentElf: Elf = {
    food: [],
  };
  for (const line of input.trimEnd().split("\n")) {
    if (line.length === 0) {
      elves.push(currentElf);
      currentElf = {
        food: [],
      };
    } else {
      currentElf.food.push(Number(line));
    }
  }
  if (currentElf.food.length) {
    elves.push(currentElf);
  }
  return elves;
}

function part1(input: string): number {
  const elves = parse(input);
  const calorieCounts = elves.map((elf) =>
    elf.food.reduce((sum, calories) => sum + calories, 0)
  );
  return Math.max(...calorieCounts);
}

function part2(input: string): number {
  const elves = parse(input);
  const calorieCounts = elves.map((elf) =>
    elf.food.reduce((sum, calories) => sum + calories, 0)
  );
  calorieCounts.sort((a, b) => b - a);
  const topThreeAmounts = calorieCounts.slice(0, 3);
  return topThreeAmounts.reduce((a, b) => a + b, 0);
}

if (import.meta.main) {
  runPart(2022, 1, 1, part1);
  runPart(2022, 1, 2, part2);
}

const TEST_INPUT = `\
1000
2000
3000

4000

5000
6000

7000
8000
9000

10000
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 24000);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 45000);
});
