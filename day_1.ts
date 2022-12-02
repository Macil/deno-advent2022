import { assertEquals } from "https://deno.land/std@0.144.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.1.0/mod.ts";

function parse(input: string) {
  return input.trimEnd().split("\n").map(Number);
}

function part1(input: string): number {
  const items = parse(input);
  throw new Error("TODO");
}

function part2(input: string): number {
  const items = parse(input);
  throw new Error("TODO");
}

if (import.meta.main) {
  runPart(2022, 1, 1, part1);
  // runPart(2022, 1, 2, part2);
}

const TEST_INPUT = `\
6
7
8
9
10
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 11);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 12);
});
