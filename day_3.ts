import { chunk } from "@std/collections/chunk";
import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

type RucksackCompartments = [string, string];

function part1Parse(input: string): RucksackCompartments[] {
  return input
    .trimEnd()
    .split("\n")
    .map((line) => [
      line.slice(0, line.length / 2),
      line.slice(line.length / 2),
    ]);
}

function scoreRucksack(rucksack: RucksackCompartments): number {
  let score = 0;

  const firstCompartmentLetters = new Set<string>();
  for (const char of rucksack[0]) {
    firstCompartmentLetters.add(char);
  }

  const lettersSeenInSecondCompartment = new Set<string>();
  for (const char of rucksack[1]) {
    if (
      firstCompartmentLetters.has(char) &&
      !lettersSeenInSecondCompartment.has(char)
    ) {
      score += letterPriority(char);
      lettersSeenInSecondCompartment.add(char);
    }
  }
  return score;
}

function part1(input: string): number {
  const rucksackCompartments = part1Parse(input);
  const scores = rucksackCompartments.map(scoreRucksack);
  return scores.reduce((sum, score) => sum + score, 0);
}

function scoreGroup(group: string[]): number {
  let lettersSeenPreviously = new Set<string>(group[0]);
  for (const rucksack of group.slice(1)) {
    const currentCandidates = new Set<string>();
    for (const char of rucksack) {
      if (lettersSeenPreviously.has(char)) {
        currentCandidates.add(char);
      }
    }
    lettersSeenPreviously = currentCandidates;
  }
  return [...lettersSeenPreviously]
    .map(letterPriority)
    .reduce((sum, score) => sum + score, 0);
}

function part2(input: string): number {
  const rucksacks = input.trimEnd().split("\n");
  const groups = chunk(rucksacks, 3);
  const scores = groups.map(scoreGroup);
  return scores.reduce((sum, score) => sum + score, 0);
}

if (import.meta.main) {
  runPart(2022, 3, 1, part1);
  runPart(2022, 3, 2, part2);
}

const TEST_INPUT = `\
vJrwpWtwJgWrhcsFMMfFFhFp
jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
PmmdzqPrVvPwwTWBwg
wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
ttgJtRGJQctTZtZT
CrZsJsPPZsGzwwsLwLmpwMDw
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 157);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 70);
});

function letterPriority(letter: string): number {
  const charCode = letter.charCodeAt(0);
  if ("a".charCodeAt(0) <= charCode && charCode <= "z".charCodeAt(0)) {
    return charCode - "a".charCodeAt(0) + 1;
  } else {
    return charCode - "A".charCodeAt(0) + 27;
  }
}

Deno.test("letterPriority", () => {
  assertEquals(letterPriority("a"), 1);
  assertEquals(letterPriority("b"), 2);
  assertEquals(letterPriority("z"), 26);
  assertEquals(letterPriority("A"), 27);
  assertEquals(letterPriority("B"), 28);
  assertEquals(letterPriority("Z"), 52);
});
