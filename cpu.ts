export type Instruction = { type: "noop" } | { type: "addx"; value: number };

export function parseInstructions(input: string): Instruction[] {
  return input.trimEnd().split("\n").map((line) => {
    const [type, value] = line.split(" ");
    if (type === "noop") {
      return { type: "noop" };
    }
    return { type: "addx", value: Number(value) };
  });
}

export class Machine {
  public x = 1;
  public pc = 0;
  /**
   * Represents the cycle number that the machine is starting.
   * The machine has successfully executed `cycle - 1` cycles already.
   */
  public cycle = 1;
  #currentInstructionBeganOnCycle = 1;
  #complete = false;
  #instructions: Instruction[];

  constructor(instructions: Instruction[]) {
    this.#instructions = instructions;
  }

  run(cycles: number) {
    if (this.#complete) {
      return;
    }
    for (let i = 0; i < cycles; i++) {
      const instruction = this.#instructions[this.pc];
      if (!instruction) {
        this.#complete = true;
        break;
      }
      switch (instruction.type) {
        case "noop": {
          this.pc++;
          this.#currentInstructionBeganOnCycle = this.cycle + 1;
          break;
        }
        case "addx": {
          if (this.#currentInstructionBeganOnCycle + 1 === this.cycle) {
            this.x += instruction.value;
            this.pc++;
            this.#currentInstructionBeganOnCycle = this.cycle + 1;
          }
          break;
        }
        default: {
          throw new Error(
            // deno-lint-ignore no-explicit-any
            `Unknown instruction type: ${(instruction as any).type}`,
          );
        }
      }
      this.cycle++;
      if (this.pc >= this.#instructions.length) {
        this.#complete = true;
        break;
      }
    }
  }

  get complete(): boolean {
    return this.#complete;
  }
}
