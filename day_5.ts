import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";

// the first item in the list is the item at the bottom of the stack
type Stack = string[];

interface Challenge {
  startingStacks: Stack[];
  procedures: Procedure[];
}

interface Procedure {
  amount: number;
  source: number;
  destination: number;
}

function parse(input: string): Challenge {
  const challenge: Challenge = {
    startingStacks: [],
    procedures: [],
  };
  type Section = "startingStacks" | "procedures";
  let section: Section = "startingStacks";
  for (const line of input.trimEnd().split("\n")) {
    switch (section) {
      case "startingStacks": {
        if (line.startsWith(" 1")) {
          section = "procedures";
          // stacks were inserted backwards, so flip them now
          for (const stack of challenge.startingStacks) {
            stack.reverse();
          }
        } else {
          // split line into list of strings every 4 characters
          const chunks = line.match(/.{1,4}/g) ?? [];
          // `chunks` looks like ["    ", "[D]"] now
          chunks.forEach((chunk, index) => {
            if (chunk[0] === "[") {
              const letter = chunk[1];
              // put the letter into the correct list inside of the challenge object.
              // we're assembling the stack backwards, so we'll reverse it later.

              if (!challenge.startingStacks[index]) {
                challenge.startingStacks[index] = [];
              }
              challenge.startingStacks[index].push(letter);
            }
          });
        }
        break;
      }
      case "procedures": {
        if (line.length > 0) {
          const match = /^move (\d+) from (\d+) to (\d+)$/.exec(line);
          if (!match) {
            throw new Error("line did not match expected format");
          }
          const procedure: Procedure = {
            amount: Number(match[1]),
            source: Number(match[2]),
            destination: Number(match[3]),
          };
          challenge.procedures.push(procedure);
        }
        break;
      }
    }
  }
  return challenge;
}

function part1(input: string): string {
  const challenge = parse(input);
  const stacks: Stack[] = structuredClone(challenge.startingStacks);
  for (const procedure of challenge.procedures) {
    // execute procedure, moving 1 item at a time
    for (let i = 0; i < procedure.amount; i++) {
      const item = stacks[procedure.source - 1].pop();
      if (!item) {
        throw new Error("stack was empty");
      }
      stacks[procedure.destination - 1].push(item);
    }
  }
  // return a string made up of the letters at the end of each stack
  return stacks.map((stack) => stack[stack.length - 1]).join("");
}

function part2(input: string): string {
  const challenge = parse(input);
  const stacks: Stack[] = structuredClone(challenge.startingStacks);
  for (const procedure of challenge.procedures) {
    // execute procedure, moving `procedure.amount` items at a time
    const items = stacks[procedure.source - 1].splice(
      stacks[procedure.source - 1].length - procedure.amount,
      procedure.amount,
    );
    stacks[procedure.destination - 1].push(...items);
  }
  // return a string made up of the letters at the end of each stack
  return stacks.map((stack) => stack[stack.length - 1]).join("");
}

if (import.meta.main) {
  runPart(2022, 5, 1, part1);
  runPart(2022, 5, 2, part2);
}

const TEST_INPUT = `\
    [D]
[N] [C]
[Z] [M] [P]
 1   2   3

move 1 from 2 to 1
move 3 from 1 to 3
move 2 from 2 to 1
move 1 from 1 to 2
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), "CMZ");
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), "MCD");
});
