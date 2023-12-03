import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";
import { Machine, parseInstructions } from "./cpu.ts";

function part1(input: string): number {
  const instructions = parseInstructions(input);
  const machine = new Machine(instructions);
  let sum = 0;
  for (let desiredCycle = 20;; desiredCycle += 40) {
    machine.run(desiredCycle - machine.cycle);
    if (machine.complete) {
      break;
    }
    sum += machine.cycle * machine.x;
  }
  return sum;
}

function runAndOutput(machine: Machine, outputLine: (line: string) => void) {
  const buffer: string[] = [];
  while (!machine.complete) {
    const x = machine.x;
    if (Math.abs(buffer.length - x) <= 1) {
      buffer.push("#");
    } else {
      buffer.push(".");
    }
    if (buffer.length === 40) {
      outputLine(buffer.join(""));
      buffer.length = 0;
    }
    machine.run(1);
  }
}

function renderToString(machine: Machine): string {
  const lines: string[] = [];
  runAndOutput(machine, (line) => lines.push(line));
  lines.push("");
  return lines.join("\n");
}

function part2(input: string) {
  const instructions = parseInstructions(input);
  const machine = new Machine(instructions);
  runAndOutput(machine, (line) => console.log(line));
  return null;
}

if (import.meta.main) {
  runPart(2022, 10, 1, part1);
  runPart(2022, 10, 2, part2);
}

const SIMPLE_TEST_INPUT = `\
noop
addx 3
addx -5
`;

Deno.test("simple", () => {
  const machine = new Machine(parseInstructions(SIMPLE_TEST_INPUT));
  assertEquals(machine.cycle, 1);
  assertEquals(machine.x, 1);
  machine.run(1);
  assertEquals(machine.cycle, 2);
  assertEquals(machine.x, 1);
  machine.run(1);
  assertEquals(machine.cycle, 3);
  assertEquals(machine.x, 1);
  machine.run(1);
  assertEquals(machine.cycle, 4);
  assertEquals(machine.x, 4);
  machine.run(1);
  assertEquals(machine.cycle, 5);
  assertEquals(machine.x, 4);
  assertEquals(machine.complete, false);
  machine.run(1);
  assertEquals(machine.cycle, 6);
  assertEquals(machine.x, -1);
  assertEquals(machine.complete, true);
});

const TEST_INPUT = `\
addx 15
addx -11
addx 6
addx -3
addx 5
addx -1
addx -8
addx 13
addx 4
noop
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx 5
addx -1
addx -35
addx 1
addx 24
addx -19
addx 1
addx 16
addx -11
noop
noop
addx 21
addx -15
noop
noop
addx -3
addx 9
addx 1
addx -3
addx 8
addx 1
addx 5
noop
noop
noop
noop
noop
addx -36
noop
addx 1
addx 7
noop
noop
noop
addx 2
addx 6
noop
noop
noop
noop
noop
addx 1
noop
noop
addx 7
addx 1
noop
addx -13
addx 13
addx 7
noop
addx 1
addx -33
noop
noop
noop
addx 2
noop
noop
noop
addx 8
noop
addx -1
addx 2
addx 1
noop
addx 17
addx -9
addx 1
addx 1
addx -3
addx 11
noop
noop
addx 1
noop
addx 1
noop
noop
addx -13
addx -19
addx 1
addx 3
addx 26
addx -30
addx 12
addx -1
addx 3
addx 1
noop
noop
noop
addx -9
addx 18
addx 1
addx 2
noop
noop
addx 9
noop
noop
noop
addx -1
addx 2
addx -37
addx 1
addx 3
noop
addx 15
addx -21
addx 22
addx -6
addx 1
noop
addx 2
addx 1
noop
addx -10
noop
noop
addx 20
addx 1
addx 2
addx 2
addx -6
addx -11
noop
noop
noop
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 13140);
});

Deno.test("part2", () => {
  const EXPECTED_OUTPUT = `\
##..##..##..##..##..##..##..##..##..##..
###...###...###...###...###...###...###.
####....####....####....####....####....
#####.....#####.....#####.....#####.....
######......######......######......####
#######.......#######.......#######.....
`;
  const machine = new Machine(parseInstructions(TEST_INPUT));
  assertEquals(renderToString(machine), EXPECTED_OUTPUT);
});
