import { chunk } from "@std/collections/chunk";
import { sortBy } from "@std/collections/sort-by";
import { assertEquals } from "@std/assert";
import { runPart } from "@macil/aocd";

interface Operation {
  label: string;
  fn(old: number): number;
}

type Operator = (a: number, b: number) => number;

const operators: { [symbol: string]: Operator } = {
  "+": (a: number, b: number) => a + b,
  "-": (a: number, b: number) => a - b,
  "*": (a: number, b: number) => a * b,
};

function parseOperationFromString(operation: string): Operation {
  const m = /^new\s*=\s*(.*)$/.exec(operation);
  if (!m) {
    throw new Error(`Invalid operation: ${operation}`);
  }
  const [, expression] = m;
  const [leftStr, operatorStr, rightStr] = expression.split(/\s+/);
  const left: number | null = leftStr === "old" ? null : Number(leftStr);
  const right: number | null = rightStr === "old" ? null : Number(rightStr);
  if (!Object.hasOwn(operators, operatorStr)) {
    throw new Error(`Ivalid operator: ${operatorStr}`);
  }
  const operator = operators[operatorStr];
  return {
    label: operation,
    fn: (old: number) => {
      const leftValue = left === null ? old : left;
      const rightValue = right === null ? old : right;
      return operator(leftValue, rightValue);
    },
  };
}

interface Test {
  label: string;
  fn(value: number): boolean;
  divisor: number;
}

function parseTest(test: string): Test {
  const m = /^divisible by (\d+)$/.exec(test);
  if (!m) {
    throw new Error(`Invalid test: ${test}`);
  }
  const [, divisorStr] = m;
  const divisor = Number(divisorStr);
  return {
    label: test,
    fn: (value: number) => value % divisor === 0,
    divisor,
  };
}

interface Monkey {
  items: number[];
  operation: Operation;
  test: Test;
  destIfTrue: number;
  destIfFalse: number;
}

function parse(input: string): Monkey[] {
  const lines = input.trimEnd().split("\n");
  const chunks = chunk(lines, 7);
  return chunks.map((lines, index) => {
    assertEquals(lines[0], `Monkey ${index}:`);
    return {
      items: lines[1].split(": ")[1].split(", ").map(Number),
      operation: parseOperationFromString(lines[2].split(": ")[1]),
      test: parseTest(lines[3].split(": ")[1]),
      destIfTrue: Number(
        /^\s*If true: throw to monkey (\d+)$/.exec(lines[4])![1],
      ),
      destIfFalse: Number(
        /^\s*If false: throw to monkey (\d+)$/.exec(lines[5])![1],
      ),
    };
  });
}

function run(
  monkeys: Monkey[],
  divisor: number,
  modulus: number | null,
  rounds: number,
): number {
  const monkeyInspectionCounters = new Map(
    monkeys.map((monkey) => [monkey, 0]),
  );
  for (let round = 0; round < rounds; round++) {
    for (const monkey of monkeys) {
      for (const worryLevel of monkey.items) {
        let newWorryLevel = Math.floor(
          monkey.operation.fn(worryLevel) / divisor,
        );
        if (!Number.isFinite(newWorryLevel)) {
          throw new Error("Worry level overflowed");
        }
        if (modulus != null) {
          newWorryLevel %= modulus;
        }
        const dest = monkey.test.fn(newWorryLevel)
          ? monkey.destIfTrue
          : monkey.destIfFalse;
        monkeys[dest].items.push(newWorryLevel);
        monkeyInspectionCounters.set(
          monkey,
          monkeyInspectionCounters.get(monkey)! + 1,
        );
      }
      monkey.items.length = 0;
    }
  }
  const sorted = sortBy(
    Array.from(monkeyInspectionCounters.entries()),
    ([, count]) => -count,
  );
  return sorted[0][1] * sorted[1][1];
}

function part1(input: string): number {
  const monkeys = parse(input);
  return run(monkeys, 3, null, 20);
}

function part2(input: string): number {
  const monkeys = parse(input);
  const modulus = monkeys.map((monkey) => monkey.test.divisor).reduce(
    (a, b) => a * b,
    1,
  );
  return run(monkeys, 1, modulus, 10000);
}

if (import.meta.main) {
  runPart(2022, 11, 1, part1);
  runPart(2022, 11, 2, part2);
}

const TEST_INPUT = `\
Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19
  Test: divisible by 23
    If true: throw to monkey 2
    If false: throw to monkey 3

Monkey 1:
  Starting items: 54, 65, 75, 74
  Operation: new = old + 6
  Test: divisible by 19
    If true: throw to monkey 2
    If false: throw to monkey 0

Monkey 2:
  Starting items: 79, 60, 97
  Operation: new = old * old
  Test: divisible by 13
    If true: throw to monkey 1
    If false: throw to monkey 3

Monkey 3:
  Starting items: 74
  Operation: new = old + 3
  Test: divisible by 17
    If true: throw to monkey 0
    If false: throw to monkey 1
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 10605);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 2713310158);
});
