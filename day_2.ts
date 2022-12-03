import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.1.1/mod.ts";

interface MatchRecord {
  opponentShapeCode: string;
  ownShapeCode: string;
}

function parse(input: string): MatchRecord[] {
  return input.trimEnd().split("\n").map((line) => {
    const [opponentShapeCode, ownShapeCode] = line.split(" ");
    return { opponentShapeCode, ownShapeCode };
  });
}

type Shape = "rock" | "paper" | "scissors";

function shapeScore(shape: Shape): number {
  switch (shape) {
    case "rock":
      return 1;
    case "paper":
      return 2;
    case "scissors":
      return 3;
  }
}

function outcomeScore(opponentShape: Shape, ownShape: Shape): number {
  if (opponentShape === ownShape) {
    return 3;
  }
  switch (opponentShape) {
    case "rock": {
      if (ownShape === "scissors") {
        return 0;
      } else {
        return 6;
      }
    }
    case "paper": {
      if (ownShape === "rock") {
        return 0;
      } else {
        return 6;
      }
    }
    case "scissors": {
      if (ownShape === "paper") {
        return 0;
      } else {
        return 6;
      }
    }
  }
}

function matchScore(opponentShape: Shape, ownShape: Shape): number {
  return shapeScore(ownShape) + outcomeScore(opponentShape, ownShape);
}

function shapeCodeToShape(shapeCode: string): Shape {
  switch (shapeCode) {
    case "A":
    case "X":
      return "rock";
    case "B":
    case "Y":
      return "paper";
    case "C":
    case "Z":
      return "scissors";
    default:
      throw new Error(`Unknown shape code (${shapeCode})`);
  }
}

function part1(input: string): number {
  const matches = parse(input);
  const scores = matches.map((match) => {
    const opponentShape = shapeCodeToShape(match.opponentShapeCode);
    const ownShape = shapeCodeToShape(match.ownShapeCode);
    return matchScore(opponentShape, ownShape);
  });
  return scores.reduce((sum, score) => sum + score, 0);
}

// function part2(input: string): number {
//   const matches = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2022, 2, 1, part1);
  // runPart(2022, 2, 2, part2);
}

const TEST_INPUT = `\
A Y
B X
C Z
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 15);
});

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
