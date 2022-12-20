import { chunk } from "https://deno.land/std@0.167.0/collections/chunk.ts";
import { assertEquals } from "https://deno.land/std@0.167.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.0/mod.ts";

type Packet = Array<number | Packet>;

interface PacketPair {
  left: Packet;
  right: Packet;
}

function parsePacket(line: string): Packet {
  return JSON.parse(line);
}

function parse(input: string): PacketPair[] {
  const chunks = chunk(input.trimEnd().split("\n"), 3);
  return chunks.map(([left, right]) => ({
    left: parsePacket(left),
    right: parsePacket(right),
  }));
}

/**
 * @returns negative if a < b, positive if a > b, 0 if a === b
 */
function comparePacketValues(a: Packet | number, b: Packet | number): number {
  if (typeof a === "number") {
    if (typeof b === "number") {
      return a - b;
    } else {
      return comparePacketValues([a], b);
    }
  } else {
    if (typeof b === "number") {
      return comparePacketValues(a, [b]);
    } else {
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        const result = comparePacketValues(a[i], b[i]);
        if (result !== 0) {
          return result;
        }
      }
      return a.length - b.length;
    }
  }
}

function part1(input: string): number {
  const packetPairs = parse(input);
  let sortedIndexesSum = 0;
  packetPairs.forEach((packetPair, i) => {
    const comparisonResult = comparePacketValues(
      packetPair.left,
      packetPair.right,
    );
    if (comparisonResult < 0) {
      sortedIndexesSum += i + 1;
    }
  });
  return sortedIndexesSum;
}

function part2(input: string): number {
  const packetPairs = parse(input);
  const allPackets = packetPairs.flatMap((packetPair) => [
    packetPair.left,
    packetPair.right,
  ]);

  // add divider packets
  const firstDivider = [[2]];
  const secondDivider = [[6]];
  allPackets.push(firstDivider, secondDivider);

  allPackets.sort(comparePacketValues);

  const firstDividerIndex = allPackets.indexOf(firstDivider) + 1;
  const secondDividerIndex = allPackets.indexOf(secondDivider) + 1;

  return firstDividerIndex * secondDividerIndex;
}

if (import.meta.main) {
  runPart(2022, 13, 1, part1);
  runPart(2022, 13, 2, part2);
}

const TEST_INPUT = `\
[1,1,3,1,1]
[1,1,5,1,1]

[[1],[2,3,4]]
[[1],4]

[9]
[[8,7,6]]

[[4,4],4,4]
[[4,4],4,4,4]

[7,7,7,7]
[7,7,7]

[]
[3]

[[[]]]
[[]]

[1,[2,[3,[4,[5,6,7]]]],8,9]
[1,[2,[3,[4,[5,6,0]]]],8,9]
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 13);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 140);
});
