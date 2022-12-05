import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.2.1/mod.ts";

interface Range {
  start: number;
  end: number;
}

type AssignmentPair = [Range, Range];

function parseRange(range: string): Range {
  const [start, end] = range.split("-").map(Number);
  return { start, end };
}

function parse(input: string): AssignmentPair[] {
  return input.trimEnd().split("\n").map((line) => {
    const [range1, range2] = line.split(",").map(parseRange);
    return [range1, range2];
  });
}

function doesEitherRangeContainTheOther(range1: Range, range2: Range): boolean {
  return range1.start <= range2.start && range1.end >= range2.end ||
    range2.start <= range1.start && range2.end >= range1.end;
}

function doRangesOverlap(range1: Range, range2: Range): boolean {
  return range1.start <= range2.end && range2.start <= range1.end;
}

function part1(input: string): number {
  const pairs = parse(input);
  const pairsWithSuperset = pairs.filter(([range1, range2]) =>
    doesEitherRangeContainTheOther(range1, range2)
  );
  return pairsWithSuperset.length;
}

function part2(input: string): number {
  const pairs = parse(input);
  const pairsWithOverlap = pairs.filter(([range1, range2]) =>
    doRangesOverlap(range1, range2)
  );
  return pairsWithOverlap.length;
}

if (import.meta.main) {
  runPart(2022, 4, 1, part1);
  runPart(2022, 4, 2, part2);
}

const TEST_INPUT = `\
2-4,6-8
2-3,4-5
5-7,7-9
2-8,3-7
6-6,4-6
2-6,4-8
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 2);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 4);
});
