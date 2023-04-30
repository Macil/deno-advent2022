import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { runPart } from "https://deno.land/x/aocd@v1.3.1/mod.ts";

type ParsedLine = Command | Output;

interface Command {
  type: "command";
  words: string[];
}

interface Output {
  type: "output";
  line: string;
}

function parse(input: string): ParsedLine[] {
  return input.trimEnd().split("\n").map((line) => {
    if (line.startsWith("$ ")) {
      return {
        type: "command",
        words: line.split(/\s+/).slice(1),
      };
    } else {
      return {
        type: "output",
        line,
      };
    }
  });
}

type Node = File | Directory;

interface File {
  type: "file";
  name: string;
  size: number;
}

interface Directory {
  type: "directory";
  name: string;
  nodes: Node[];
  parent: Directory | null;
}

function translateParsedLinesToFilesystem(
  parsedLines: ParsedLine[],
): Directory {
  const root: Directory = {
    type: "directory",
    name: "/",
    nodes: [],
    parent: null,
  };
  let currentDirectory = root;
  for (const parsedLine of parsedLines) {
    if (parsedLine.type === "command") {
      const [command, ...args] = parsedLine.words;
      if (command === "cd") {
        const [path] = args;
        if (path === "/") {
          currentDirectory = root;
        } else if (path === "..") {
          if (!currentDirectory.parent) {
            throw new Error("cannot cd .. from root");
          }
          currentDirectory = currentDirectory.parent;
        } else {
          for (const name of path.split("/")) {
            const node = currentDirectory.nodes.find((node) =>
              node.name === name
            );
            if (!node) {
              throw new Error(`could not find node ${name}`);
            }
            if (node.type !== "directory") {
              throw new Error(`node ${name} is not a directory`);
            }
            currentDirectory = node;
          }
        }
      } else if (command === "ls") {
        // do nothing
      } else {
        throw new Error(`unknown command ${command}`);
      }
    } else if (parsedLine.type === "output") {
      const { line } = parsedLine;
      const match = /^(dir|\d+)\s+(\S+)$/.exec(line);
      if (!match) {
        throw new Error(`line did not match expected format: ${line}`);
      }
      const [, dirLiteralOrSize, name] = match;
      if (dirLiteralOrSize === "dir") {
        currentDirectory.nodes.push({
          type: "directory",
          name,
          nodes: [],
          parent: currentDirectory,
        });
      } else {
        currentDirectory.nodes.push({
          type: "file",
          name,
          size: Number(dirLiteralOrSize),
        });
      }
    }
  }
  return root;
}

function calculateSizesOfAllDirectories(
  root: Directory,
): Map<Directory, number> {
  const sizes = new Map<Directory, number>();
  function calculateSizesOfAllDirectoriesHelper(
    directory: Directory,
  ): number {
    const size = directory.nodes.reduce((total, node) => {
      if (node.type === "file") {
        return total + node.size;
      } else {
        return total + calculateSizesOfAllDirectoriesHelper(node);
      }
    }, 0);
    sizes.set(directory, size);
    return size;
  }
  calculateSizesOfAllDirectoriesHelper(root);
  return sizes;
}

function part1(input: string): number {
  const parsedLines = parse(input);
  const root = translateParsedLinesToFilesystem(parsedLines);
  const sizes = calculateSizesOfAllDirectories(root);
  return Array.from(sizes.entries())
    .filter(([, size]) => size <= 100000)
    .reduce((sum, [, size]) => sum + size, 0);
}

function part2(input: string): number {
  const parsedLines = parse(input);
  const root = translateParsedLinesToFilesystem(parsedLines);
  const sizes = calculateSizesOfAllDirectories(root);

  const totalSize = sizes.get(root)!;
  const targetSize = 40_000_000;
  const needToDelete = totalSize - targetSize;

  return Math.min(
    ...Array.from(sizes.values()).filter((size) => size >= needToDelete),
  );
}

if (import.meta.main) {
  runPart(2022, 7, 1, part1);
  runPart(2022, 7, 2, part2);
}

const TEST_INPUT = `\
$ cd /
$ ls
dir a
14848514 b.txt
8504156 c.dat
dir d
$ cd a
$ ls
dir e
29116 f
2557 g
62596 h.lst
$ cd e
$ ls
584 i
$ cd ..
$ cd ..
$ cd d
$ ls
4060174 j
8033020 d.log
5626152 d.ext
7214296 k
`;

Deno.test("part1", () => {
  assertEquals(part1(TEST_INPUT), 95437);
});

Deno.test("part2", () => {
  assertEquals(part2(TEST_INPUT), 24933642);
});
