# deno-advent2022

This project contains solutions to [Advent of Code](https://adventofcode.com/)
2022, using [Deno](https://deno.land/) and Typescript.

## Usage

You must have [aocd](https://github.com/Macil/aocd) installed and have set your
session cookie with it:

```
aocd set-cookie COOKIE_VALUE_HERE
```

Then you can run any solution script:

```
deno run -A day_1.ts
```

You can run one day's tests with `deno test day_1.ts` or by clicking the play
button next to it inside of Visual Studio Code. You can run all days' tests with
`deno task test`.

You can debug a script within Visual Studio Code by picking **Run** -> **Start
Debugging** in the toolbar while the script is open, or you can debug a script
by running `deno run -A --inspect-brk day_1.ts` and then opening
`chrome://inspect` in Chrome.

When you're confident about a solution, you can add the `--submit` (or `-s`)
flag to submit the solution and see if it was correct:

```
deno run -A day_1.ts --submit
```

You can start a new day's challenge with this command:

```
aocd start 2
```
