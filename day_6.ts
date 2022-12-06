import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.2.2/mod.ts";

function parse(input: string) {
  return input.trimEnd();
}

function part1(input: string): number {
  const buffer = parse(input);
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
    if (i > 2) {
      if (i > 3) {
        removeLetter(buffer[i - 4]);
      }
      if (lettersInPacketCounts.size === 4) {
        return i + 1;
      }
    }
  }
  throw new Error("Failed to find start of packet");
}

// function part2(input: string): number {
//   const items = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2022, 6, 1, part1);
  // runPart(2022, 6, 2, part2);
}

const TEST_INPUT = `\
mjqjpqmgbljsphdztnvjfqwrcgsmlb
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 7);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
