import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { runPart } from "https://deno.land/x/aocd@v1.5.1/mod.ts";
import {
  buildPath,
  dijkstraAll,
  DijkstraEncounteredNodeEntry,
} from "https://deno.land/x/lazy_pathfinding@v1.1.1/directed/dijkstra.ts";
import { memoizy } from "https://deno.land/x/memoizy@1.0.0/mod.ts";

interface Valve {
  name: string;
  flowRate: number;
  tunnels: string[];
}

class World {
  constructor(private readonly valves: ReadonlyMap<string, Valve>) {
  }

  getValve(name: string): Valve {
    const valve = this.valves.get(name);
    if (!valve) {
      throw new Error(`No valve named ${name}`);
    }
    return valve;
  }

  readonly encounteredNodesFromNode = memoizy((
    position: string,
  ): ReadonlyMap<unknown, DijkstraEncounteredNodeEntry<string, number>> => {
    return dijkstraAll<string, number>({
      start: position,
      successors: (v) => {
        return this.getValve(v).tunnels.map((x) => [x, 1]);
      },
      key: (v) => v,
      // Subtract 1 because we don't want to count the time it takes to open the valve.
      maxCost: 29,
    });
  });
}

const parse = memoizy((input: string): World => {
  const valves: Valve[] = input.trimEnd().split("\n").map((line) => {
    const m =
      /^Valve (?<name>\w+) has flow rate=(?<flowRate>\d+); tunnels? leads? to valves? (?<tunnels>.+)$/
        .exec(
          line,
        );
    if (!m) {
      throw new Error("Bad line: " + line);
    }
    return {
      name: m.groups!.name,
      flowRate: Number(m.groups!.flowRate),
      tunnels: m.groups!.tunnels.split(", "),
    };
  });
  return new World(new Map(valves.map((v) => [v.name, v])));
});

interface State {
  position: string;
  openValves: string[];
  timeLeft: number;
  totalPressureReleased: number;
}

interface Move {
  reward: number;
  time: number;
  target: string;
}

function* findMovesFromState(
  world: World,
  state: State,
): Iterable<Move> {
  const encounteredNodes = world.encounteredNodesFromNode(state.position);
  for (const entry of encounteredNodes.values()) {
    if (
      entry.node === state.position || state.openValves.includes(entry.node)
    ) {
      continue;
    }
    const path = buildPath(entry.node, encounteredNodes);
    const reward = (state.timeLeft - path.length) *
      world.getValve(entry.node).flowRate;

    // subtract 1 because this counts the current node but add 1 to account
    // for the time it takes to open the valve.
    const time = path.length;

    if (state.timeLeft >= time && reward > 0) {
      yield {
        reward,
        time,
        target: entry.node,
      };
    }
  }
}

function* nextStates(
  world: World,
  start: State,
): Iterable<State> {
  for (const move of findMovesFromState(world, start)) {
    const state = {
      position: move.target,
      openValves: [...start.openValves, move.target],
      timeLeft: start.timeLeft - move.time,
      totalPressureReleased: start.totalPressureReleased + move.reward,
    };
    yield state;
    yield* nextStates(world, state);
  }
}

function max<T>(
  iterable: Iterable<T>,
  compareFn: (a: T, b: T) => number,
): T | undefined {
  let candidate: T | undefined = undefined;
  for (const item of iterable) {
    if (candidate === undefined || compareFn(item, candidate) > 0) {
      candidate = item;
    }
  }
  return candidate;
}

function part1(input: string): number {
  const world = parse(input);
  const bestState = max(
    nextStates(world, {
      position: "AA",
      openValves: [],
      timeLeft: 30,
      totalPressureReleased: 0,
    }),
    (a, b) => a.totalPressureReleased - b.totalPressureReleased,
  );
  return bestState!.totalPressureReleased;
}

function part2(input: string): number {
  const world = parse(input);
  const bestStateAlone = max(
    nextStates(world, {
      position: "AA",
      openValves: [],
      timeLeft: 26,
      totalPressureReleased: 0,
    }),
    (a, b) => a.totalPressureReleased - b.totalPressureReleased,
  )!;
  const elephantAfterBestStateAlone = max(
    nextStates(world, {
      position: "AA",
      openValves: bestStateAlone.openValves,
      timeLeft: 26,
      totalPressureReleased: bestStateAlone.totalPressureReleased,
    }),
    (a, b) => a.totalPressureReleased - b.totalPressureReleased,
  ) ?? bestStateAlone;
  const elephantPressureReleasedAfterBestStateAlone =
    elephantAfterBestStateAlone.totalPressureReleased -
    bestStateAlone.totalPressureReleased;

  let bestState = elephantAfterBestStateAlone;
  for (
    const state of nextStates(world, {
      position: "AA",
      openValves: [],
      timeLeft: 26,
      totalPressureReleased: 0,
    })
  ) {
    if (
      state.totalPressureReleased > elephantPressureReleasedAfterBestStateAlone
    ) {
      const elephantAfterState = max(
        nextStates(world, {
          position: "AA",
          openValves: state.openValves,
          timeLeft: 26,
          totalPressureReleased: state.totalPressureReleased,
        }),
        (a, b) => a.totalPressureReleased - b.totalPressureReleased,
      );
      if (
        elephantAfterState &&
        elephantAfterState.totalPressureReleased >
          bestState.totalPressureReleased
      ) {
        bestState = elephantAfterState;
      }
    }
  }
  return bestState.totalPressureReleased;
}

if (import.meta.main) {
  runPart(2022, 16, 1, part1);
  runPart(2022, 16, 2, part2);
}

const TEST_INPUT = `\
Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 1651);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 1707);
});
