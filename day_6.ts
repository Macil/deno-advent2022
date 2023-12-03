import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

function parse(input: string) {
  return input.trimEnd();
}

function findPositionOfMarkerEnd(buffer: string, markerLength: number): number {
  const lettersInPacketCounts = new Map<string, number>();
  function countLetter(letter: string) {
    const currentCount = lettersInPacketCounts.get(letter) ?? 0;
    lettersInPacketCounts.set(letter, currentCount + 1);
  }
  function removeLetter(letter: string) {
    const currentCount = lettersInPacketCounts.get(letter) ?? 0;
    if (currentCount === 1) {
      lettersInPacketCounts.delete(letter);
    } else {
      lettersInPacketCounts.set(letter, currentCount - 1);
    }
  }
  for (let i = 0; i < buffer.length; i++) {
    countLetter(buffer[i]);
    if (i > markerLength - 2) {
      if (i > markerLength - 1) {
        removeLetter(buffer[i - markerLength]);
      }
      if (lettersInPacketCounts.size === markerLength) {
        return i + 1;
      }
    }
  }
  throw new Error("Failed to find marker");
}

function part1(input: string): number {
  const buffer = parse(input);
  return findPositionOfMarkerEnd(buffer, 4);
}

function part2(input: string): number {
  const buffer = parse(input);
  return findPositionOfMarkerEnd(buffer, 14);
}

if (import.meta.main) {
  runPart(2022, 6, 1, part1);
  runPart(2022, 6, 2, part2);
}

const TEST_INPUT = `\
mjqjpqmgbljsphdztnvjfqwrcgsmlb
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 7);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 19);
});
