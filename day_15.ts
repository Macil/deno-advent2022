import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.2/mod.ts";

interface Position {
  x: number;
  y: number;
}

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

interface Reading {
  sensor: Position;
  closestBeacon: Position;
}

function parse(input: string): Reading[] {
  return input.trimEnd().split("\n").map((line) => {
    const m =
      /^Sensor at x=(?<x>-?\d+), y=(?<y>-?\d+): closest beacon is at x=(?<bx>-?\d+), y=(?<by>-?\d+)$/
        .exec(
          line,
        );
    if (!m) {
      throw new Error("Bad line: " + line);
    }
    return {
      sensor: { x: Number(m.groups!.x), y: Number(m.groups!.y) },
      closestBeacon: { x: Number(m.groups!.bx), y: Number(m.groups!.by) },
    };
  });
}

interface Interval {
  start: number;
  end: number;
}

function mergeIntervals(sortedIntervals: Interval[]): Interval[] {
  const result: Interval[] = [];
  let current: Interval | undefined;
  for (const interval of sortedIntervals) {
    if (!current) {
      current = { ...interval };
    } else {
      if (interval.start <= current.end) {
        current.end = Math.max(current.end, interval.end);
      } else {
        result.push(current);
        current = { ...interval };
      }
    }
  }
  if (current) {
    result.push(current);
  }
  return result;
}

function countPositionsThatCannnotBeBeaconInRow(
  readings: Reading[],
  row: number,
): number {
  const coveredIntervalsInRow: Array<Interval> = mergeIntervals(
    readings
      .filter((reading) => {
        const sensorRange = manhattanDistance(
          reading.sensor,
          reading.closestBeacon,
        );
        const distanceFromSensorToRow = Math.abs(reading.sensor.y - row);
        return sensorRange >= distanceFromSensorToRow;
      })
      .map((reading) => {
        const sensorRange = manhattanDistance(
          reading.sensor,
          reading.closestBeacon,
        );
        const distanceFromSensorToRow = Math.abs(reading.sensor.y - row);
        const startInRow = reading.sensor.x - sensorRange +
          distanceFromSensorToRow;
        const endInRow = reading.sensor.x + sensorRange -
          distanceFromSensorToRow;
        return { start: startInRow, end: endInRow };
      })
      .sort((a, b) => a.start - b.start),
  );
  const coveredPositions = coveredIntervalsInRow.map((interval) =>
    interval.end - interval.start + 1
  ).reduce((a, b) => a + b, 0);

  const positionsInRowThatAreBeacon = new Set<number>();
  for (const reading of readings) {
    if (reading.closestBeacon.y === row) {
      positionsInRowThatAreBeacon.add(reading.closestBeacon.x);
    }
  }
  return coveredPositions - positionsInRowThatAreBeacon.size;
}

function part1(input: string, row = 2000000): number {
  const readings = parse(input);
  return countPositionsThatCannnotBeBeaconInRow(readings, row);
}

function tuningFrequency(p: Position): number {
  return p.x * 4000000 + p.y;
}

function findUnknownBeacon(
  readings: Reading[],
  coordinateLowerLimit: number,
  coordinateUpperLimit: number,
): Position | undefined {
  const readingsSortedBySensorX = readings.slice().sort((a, b) =>
    a.sensor.x - b.sensor.x
  );

  for (let y = coordinateLowerLimit; y <= coordinateUpperLimit; y++) {
    let x = coordinateLowerLimit;
    for (const reading of readingsSortedBySensorX) {
      const sensorRange = manhattanDistance(
        reading.sensor,
        reading.closestBeacon,
      );
      const distanceFromSensorToRow = Math.abs(reading.sensor.y - y);
      if (sensorRange >= distanceFromSensorToRow) {
        const startInRow = reading.sensor.x - sensorRange +
          distanceFromSensorToRow;
        const endInRow = reading.sensor.x + sensorRange -
          distanceFromSensorToRow;
        if (x >= startInRow) {
          x = Math.max(x, endInRow + 1);
        }
      }
    }
    if (x <= coordinateUpperLimit) {
      return { x, y };
    }
  }
  return undefined;
}

function part2(input: string, coordinateUpperLimit = 4000000): number {
  const readings = parse(input);
  const unknownBeacon = findUnknownBeacon(readings, 0, coordinateUpperLimit);
  if (!unknownBeacon) {
    throw new Error("Failed to find beacon");
  }
  return tuningFrequency(unknownBeacon);
}

if (import.meta.main) {
  runPart(2022, 15, 1, part1);
  runPart(2022, 15, 2, part2);
}

const TEST_INPUT = `\
Sensor at x=2, y=18: closest beacon is at x=-2, y=15
Sensor at x=9, y=16: closest beacon is at x=10, y=16
Sensor at x=13, y=2: closest beacon is at x=15, y=3
Sensor at x=12, y=14: closest beacon is at x=10, y=16
Sensor at x=10, y=20: closest beacon is at x=10, y=16
Sensor at x=14, y=17: closest beacon is at x=10, y=16
Sensor at x=8, y=7: closest beacon is at x=2, y=10
Sensor at x=2, y=0: closest beacon is at x=2, y=10
Sensor at x=0, y=11: closest beacon is at x=2, y=10
Sensor at x=20, y=14: closest beacon is at x=25, y=17
Sensor at x=17, y=20: closest beacon is at x=21, y=22
Sensor at x=16, y=7: closest beacon is at x=15, y=3
Sensor at x=14, y=3: closest beacon is at x=15, y=3
Sensor at x=20, y=1: closest beacon is at x=15, y=3
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT, 10), 26);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT, 20), 56000011);
});
