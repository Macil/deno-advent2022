import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.2/mod.ts";
import {
  buildPath,
  dijkstraAll,
  DijkstraEncounteredNodeEntry,
} from "https://deno.land/x/lazy_pathfinding@v1.1.1/directed/dijkstra.ts";
interface Valve {
  name: string;
  flowRate: number;
  tunnels: string[];
}

function parse(input: string): Map<string, Valve> {
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
  return new Map(valves.map((v) => [v.name, v]));
}

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

const cachedEncounteredNodesFromNode = new Map<
  string,
  Map<unknown, DijkstraEncounteredNodeEntry<string, number>>
>();

function* findMovesFromState(
  world: ReadonlyMap<string, Valve>,
  state: State,
): Iterable<Move> {
  let encounteredNodes = cachedEncounteredNodesFromNode.get(state.position);
  if (!encounteredNodes) {
    encounteredNodes = dijkstraAll<string, number>({
      start: state.position,
      successors(v) {
        return world.get(v)!.tunnels.map((x) => [x, 1]);
      },
      key: (v) => v,
      // Subtract 1 because we don't want to count the time it takes to open the valve.
      // Needs to be fixed as the highest possible value instead of `state.timeLeft - 1`
      // because this is cached for future runs where we might have more time left.
      // (If we did a breadth-first search, we could use `state.timeLeft - 1`.)
      maxCost: 29,
    });
    cachedEncounteredNodesFromNode.set(state.position, encounteredNodes);
  }
  for (const entry of encounteredNodes.values()) {
    if (
      entry.node === state.position || state.openValves.includes(entry.node)
    ) {
      continue;
    }
    const path = buildPath(entry.node, encounteredNodes);
    const reward = (state.timeLeft - path.length) *
      world.get(entry.node)!.flowRate;

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
  world: ReadonlyMap<string, Valve>,
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

function part1(input: string): number {
  const world = parse(input);

  let bestState: State = {
    position: "AA",
    openValves: [],
    timeLeft: 30,
    totalPressureReleased: 0,
  };

  for (const state of nextStates(world, bestState)) {
    if (state.totalPressureReleased > bestState.totalPressureReleased) {
      bestState = state;
    }
  }
  return bestState.totalPressureReleased;
}

// function part2(input: string): number {
//   const world = parse(input);
//   throw new Error("TODO");
// }

if (import.meta.main) {
  runPart(2022, 16, 1, part1);
  // runPart(2022, 16, 2, part2);
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

// Deno.test("part2", () => {
//   assertEquals(part2(TEST_INPUT), 12);
// });
