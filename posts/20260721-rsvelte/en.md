---
title: rsvelte: Rebuilding the Svelte Toolchain in Rust for the AI Era
date: 2026-07-21
---

At [Flyle](https://flyle.io), running multiple AI agents in parallel has become a normal part of development. In this workflow, agents run type checking and linting after each implementation step, making static checks far more frequent than in primarily human-driven development. When checks run in parallel, they compete for CPU and memory, increasing the latency of each run. An agent cannot start its next fix until the check finishes, so **the time a static check takes sets a lower bound on the duration of each agent loop iteration**.

In Svelte projects, these static checks are especially slow. To solve this, I am building [rsvelte](https://github.com/baseballyama/rsvelte), a project to rebuild the Svelte toolchain in Rust. This article explains why this matters now and what rsvelte does.

## tl;dr

- AI agents run static checks on every loop iteration, so check time sets a lower bound on iteration time, and CPU/memory usage limits how many agents can run in parallel
- Rust and other native toolchains are delivering order-of-magnitude speedups in parts of the static-analysis stack, but the Svelte-specific parts of `.svelte` processing (parsing, transformation, linting, formatting) still rely on JavaScript implementations
- rsvelte is a set of Rust implementations that aims to be a drop-in replacement for the Svelte toolchain. It does not introduce any language-level extensions. It is early stage, and maturity varies by package
- On Flyle's production frontend, with 8,795 files in the official check scope, replacing the official svelte-check path with rsvelte-check cut type checking from 51.4s to 30.6s (1.7x, about 56% less CPU, while keeping the JavaScript implementation of TypeScript 5.9.3). Switching the check engine to tsgo brought it to 9.0s (5.7x combined)
- With an identical set of 37 Svelte-specific rules, rsvelte-lint is about 20x faster, and all 382 diagnostics match
- With eight simultaneous checks, the type-checking gap narrows because the TypeScript phase common to both setups dominates. Shorter individual runs should still reduce overlap in normal use, though this remains to be verified with real agent traces

## 1. Why check speed matters now

### 1.1 AI takes on implementation, and quality assurance shifts toward harnesses

As AI agents take on more implementation work, the way we ensure quality changes. Static checks mattered in human-centered development too. But as agents take on more of the implementation work, **automated harnesses that verify their output** take on a larger share of quality assurance.

I think of these harnesses in several layers: design harnesses that establish and constrain the assumptions agents work from through documentation and types, development harnesses that verify output after each implementation step, and test harnesses that verify behavior. Each is worth its own article, but this one focuses on the core of the development harness: the **static analysis stack** (formatter, type checking, linter, unused-code detection).

### 1.2 The execution model of static checks changed

Static checks themselves are nothing new. What changed is how they run.

Static checks mattered before AI too. But it was rare for one developer to launch full checks many times in a short period, or to run the same checks in parallel across multiple working trees. In agent-driven development, both are normal.

Agents work differently from humans. Some agents, like Codex CLI, do not use a Language Server at all. Even when an agent can use one, like Claude Code, parallel instances do not necessarily share a Language Server. If each instance starts its own, the analysis work and memory usage multiply with the number of instances. Also, LSP diagnostics and settings do not always match CI, so in many setups you still need a CLI check identical to CI as the final quality gate. An agent runs checks many times in a single task, and running multiple agents in parallel multiplies the number of concurrent checks. In short, static checks used to run at low frequency and low parallelism. Now they run at high frequency and high parallelism.

To be precise, this is not a problem unique to AI. CI and pre-commit hooks have run full CLI checks for a long time, and slow full checks are a well-known problem. What changed is the frequency and the parallelism. Static-analysis-heavy workflows had already been growing more common for years; parallel AI development pushed the trend to an extreme. That is why this article talks about AI, but the argument below applies to any workload that runs many full CLI checks.

### 1.3 Slowness costs you in two ways

Slow checks cost you in two connected ways: latency and resource usage.

The first is **latency**. In a loop that waits for check results before deciding the next fix, check time is the critical path. If a check takes 5 minutes, one iteration takes at least 5 minutes. In my experience, it is not unusual for a full check suite to take several minutes. Even on Flyle's production frontend, measured later in this article, type checking alone takes about 51 seconds (3.3). At that rate, running the check five times in one task adds more than four minutes of type-checking latency.

The second is **resources**. The current Svelte check stack uses a lot of CPU and memory across its whole process tree, including the TypeScript engine and the transformation step. In the measurements below (3.3), the current JS setup used a peak of 4.2GB of memory and about 105 CPU-seconds for one type check of Flyle's production frontend. Running several checks in parallel can exhaust the CPU and memory of a developer machine. So check resource usage becomes one of the main limits on how many agents you can run at once.

### 1.4 Why "just use CI" and "just buy a bigger machine" are not enough

Moving checks to CI only delays the feedback. Agents use check results to decide their next fix, so fast feedback inside the loop matters. If implementation continues without checks, new work piles up on top of wrong assumptions, and fixing errors found in bulk later costs more. To guide the next implementation step, the check needs to run inside the loop.

A bigger machine does help. But if each check process uses the same amount of resources, the required CPU and memory grow as parallelism increases. Making the tools more efficient increases the number of agents the same hardware can support.

## 2. Rust-based toolchains and where Svelte stands

### 2.1 Static-analysis tools are moving to native implementations

Static-analysis tools are increasingly being rewritten as native-code implementations in Rust, Go, and similar languages.

- oxlint, from the [oxc](https://oxc.rs/) project, runs linting 50-100x faster than ESLint (as claimed by the project)
- [tsgo](https://github.com/microsoft/typescript-go), a Go port of the TypeScript compiler, claims about 10x faster type checking than tsc ([A 10x Faster TypeScript](https://devblogs.microsoft.com/typescript/typescript-native-port/))
- [Biome](https://biomejs.dev/) applies the same native-toolchain approach to formatting and linting

This speedup is not just "write it in Rust and it gets fast." It comes from the entire design: parallel-first architecture, avoiding unnecessary repeated parsing, memory-efficient data structures, and the performance characteristics of the implementation language.

The important point is that when speed changes this much, behavior changes too. Checks that take 10 minutes overlap across parallel agents and contend for CPU and memory. Shorter checks reduce the window in which concurrent runs can overlap, making resource contention less likely. Better latency can also relieve the resource problem by reducing overlap.

### 2.2 But the Svelte-specific parts are still JavaScript-based

Svelte-specific processing has not fully caught this wave.

- **Linting**: oxlint has an alpha-stage feature that extracts and checks the script part of `.svelte` files, but it does not yet provide a foundation for checking Svelte-specific semantics across templates and styles. Svelte-specific rules still depend on the JavaScript-based eslint-plugin-svelte + ESLint
- **Formatting**: oxfmt's Svelte support delegates the Svelte structure to the JavaScript-based prettier-plugin-svelte and handles embedded JS/CSS with oxc. The `.svelte` structure is therefore still parsed and formatted through the Prettier-based path
- **Type checking**: svelte-check converts `.svelte` files to TypeScript with svelte2tsx and passes them to a check engine. The engine can now be sped up with `--tsgo`, but the transformation and orchestration remain JavaScript-based

In other words, even the official tools can now speed up the TypeScript part with tsgo, but the Svelte-specific work (Svelte parsing, svelte2tsx transformation, template linting, formatting) still relies on JavaScript implementations. This is not unique to Svelte. Frameworks with their own template languages, such as Vue, face the same problem.

## 3. rsvelte

[rsvelte](https://github.com/baseballyama/rsvelte) is a project to close this gap.

### 3.1 Goal: a drop-in replacement for the Svelte toolchain

rsvelte's long-term goal is to be a **drop-in replacement** for the existing Svelte toolchain: config files and commands stay the same, and only the implementation changes to Rust. Its design principle is to **preserve Svelte's language semantics and compiler behavior rather than adding its own extensions** (it does have tool-level extras such as CLI flags and caching).

The reason is to make switching and rollback cost as close to zero as possible in the end. Alternative tools with unique features create dependencies on those features as soon as you adopt them, making it progressively harder to return to the original toolchain. If compatibility is preserved, you can adopt, measure, and roll back safely if something goes wrong. This resembles one part of oxlint's strategy: earning trust by faithfully porting existing ESLint rules. This compatibility is also a prerequisite for eventually proposing maintenance under the Svelte organization, discussed later.

Compatibility is backed by verification, not by declaration. The compiler passes 100% of the 3,500+ in-scope fixtures of the official Svelte v5.56.4 test suite (the Svelte 4 to 5 migrator and a few individual fixtures are out of scope). On top of that, code from about 30 real-world repositories (about 12,000 compilation units) is continuously compiled with both the official compiler and rsvelte, and the outputs are compared. The known structural differences currently stand at 8 for client output and 0 for server output (both as of commit `76ac14b3`; the README and dashboard in the repository may show different numbers depending on when they were updated). CI treats the known-difference list as a ratchet, failing if the number of differences increases, and each difference has its cause documented.

That said, how close each package is to drop-in status varies a lot. Passing 100% of fixtures does not mean full public-API compatibility. Constraints remain around options that accept functions, such as `cssHash`, and the status of each package is in the table in 3.2. Strictly speaking, the current state is not "a finished drop-in replacement" but "a set of compatible implementations moving toward drop-in status through continuous verification."

### 3.2 Components

rsvelte ships each tool of the static analysis stack as a separate package. Because maturity varies a lot, the table lists both what each package is and where it stands.

| Area | Package | What it is | Current status |
|---|---|---|---|
| Compiler | `@rsvelte/compiler` | Rust port of the Svelte 5 compiler | 100% of in-scope fixtures pass. Known structural output differences on real code: client 8 / server 0 |
| Build | `@rsvelte/vite-plugin-svelte` | Fork of the official vite-plugin-svelte (same API) | Experimental |
| Type check (transform) | `@rsvelte/svelte2tsx` | Rust port of svelte2tsx | 0 known output differences. The API is async (for WASM initialization), unlike upstream |
| Type check (CLI) | `@rsvelte/svelte-check` | Port of svelte-check; the check engine can be tsc or tsgo | Early stage. Some CLI flags differ. Not yet recommended as a CI gate without running the official version alongside |
| Formatting | `@rsvelte/fmt` | Port of prettier-plugin-svelte; works with oxfmt | 40 known output differences on real code. Configured via .oxfmtrc (does not read Prettier config) |
| Lint | `@rsvelte/lint` | Ports 80 rules from eslint-plugin-svelte | Currently a complement to ESLint, not a replacement |
| Editor | `@rsvelte/language-server` / `rsvelte-vscode` | Language Server and VS Code extension (separate packages) | Formatting and linting only. No type checking, completion, or go-to-definition |

Building all these tools together is a consequence, not a goal. The formatter, type checker, and linter all depend on a Svelte parser. But using the JavaScript Svelte compiler from native tools requires crossing a JS runtime or a process boundary, and it cannot plug directly into oxc's AST and semantic pipeline. Sharing one Rust parser (built on oxc) across all tools is the precondition for the oxc integration discussed later.

Type checking needs one more note. The official svelte-check already has a `--tsgo` option, so both tools can use the same TS engine. rsvelte's difference is the Rust implementation of the svelte2tsx transformation and the orchestration. The benchmarks below therefore include comparisons where the TypeScript implementation is held constant, to isolate the Svelte-side difference as much as possible.

### 3.3 Benchmarks

I ran the following benchmarks on my own machine for this article. Before reading the numbers, keep two kinds of measurement separate: **engine throughput** (the transformation and formatting work itself, on files already loaded in memory) and **end-to-end** (from CLI start to process exit, which is what a user experiences). Engine-level speedups do not translate directly into the same end-to-end speedups.

Main conditions: Apple M4 Pro (12 cores) / 48GB, Node.js 24.13.1, rsvelte commit `76ac14b3` (built from source), Svelte v5.56.4, svelte-check 4.7.3, typescript 5.9.3, tsgo 7.0.0-dev.20260707.2, eslint 10.7.0, eslint-plugin-svelte 3.21.0. All comparisons were run on the same machine and the same corpus, and the reported values are **medians** across multiple runs. The measurement scripts and raw data are in the rsvelte repository under `scripts/bench/` (the latest engine-level results and charts are on the [benchmark page](https://baseballyama.github.io/rsvelte/benchmark)).

<details>
<summary>Measurement details</summary>
<ul>
<li>CPU time comes from <code>/usr/bin/time -l</code> (user + sys, including awaited child processes). RSS is an estimate: process-tree totals sampled with <code>ps</code> every 100ms, which can double-count shared pages. The split between the checker itself and the TS engine is based on PID parent-child relationships, so it is an estimate based on process structure</li>
<li>Check tools write overlay artifacts into the workspace, and these affect later runs. So flowbite measurements use a fresh workspace per run via APFS clonefile: no tool caches, non-incremental (OS page caches are not controlled)</li>
<li>The flowbite workload reports about 900 errors in both tools (js 885 / rs 926; 669 match by file and message). The setup (<code>pnpm install --ignore-scripts</code>, adding typescript / @typescript/native-preview, <code>svelte-kit sync</code>) does not reproduce the full library-development environment, which causes module-resolution errors. These numbers are not a healthy CI result but <strong>a reference for performance trends</strong></li>
<li>Flyle measurements reset state before every run via <code>svelte-kit sync</code> and overlay removal, taking the median of 5 runs after 1 warmup</li>
<li>Lint setup: the ESLint side applies eslint-plugin-svelte (flat/recommended) plus the TS parser to all 1,296 files under <code>src</code>, with all non-svelte rules and unused-directive reporting disabled. The rsvelte-lint side runs a config that imports the 37 svelte/* rules at identical severities from ESLint's resolved config (based on <code>extends: ["none"]</code>, with the default-enabled no-unused-props also disabled)</li>
</ul>
</details>

#### 3.3.1 End-to-end type checking (Flyle production)

First, consider the end-to-end experience of a user or an agent. I measured on Flyle's production frontend (a SvelteKit app; the official svelte-check includes 8,795 files in its check scope). The total improvement comes from two changes.

```
svelte-check + TypeScript Language Service   51.4s   <- current CI configuration
      | switch to rsvelte-check, keep TypeScript 5.9.3 (JavaScript)
rsvelte-check + tsc                          30.6s   (1.7x; about 56% lower CPU time: 104.9s -> 45.9s)
      | switch the check engine to tsgo
rsvelte-check + tsgo                          9.0s   (5.7x combined; CPU time: 32.1s)
```

| Configuration | wall time (range) | CPU time | peak RSS total | checker itself |
|---|---:|---:|---:|---:|
| svelte-check + TypeScript Language Service (current CI configuration) | 51.4s (46.9-64.4) | 104.9s | 4.2GB | inseparable (in-process LS) |
| rsvelte-check + tsc | 30.6s (29.8-36.2) | 45.9s | 3.8GB | 0.12GB |
| rsvelte-check + tsgo | 9.0s (8.6-9.9) | 32.1s | 5.5GB | 0.12GB |

**Replacing the official svelte-check path with rsvelte-check produces a 1.7x speedup** (this replacement includes both the Rust implementation of the Svelte side and the change of execution path from the Language Service to the tsc CLI). **Adding tsgo brings the combined speedup to 5.7x**. The official svelte-check run and both rsvelte-check runs all reported 0 errors; the official run reported 44 warnings, while both rsvelte-check runs reported 41. The 3-warning difference comes from a single file at the workspace boundary that only the official version includes in its scope (the rs side does not print a checked-file count in machine-readable output, so the file sets could not be fully reconciled). For memory usage, rsvelte-check itself peaks at **about 0.12GB** with either engine, and in the rsvelte setups the TS engine takes most of the memory (most of the 5.5GB total in the tsgo setup comes from the tsgo process; comparing the two setups that both use the JavaScript TypeScript implementation, total peak RSS drops from 4.2GB to 3.8GB). The official svelte-check's `--tsgo` did not work correctly on this repository: it shrank the check scope to 355 files and reported 1,581 spurious errors, so I excluded it from the comparison (I reproduced the issue with svelte-check 4.7.3).

#### 3.3.2 Comparison with tsgo on both sides (flowbite-svelte)

Two comparisons were not practical on the Flyle repository: a comparison with tsgo on both sides (because the official `--tsgo` malfunctions there) and parallel execution (which needs N independent workspace copies, impractical for a 17GB production monorepo). I ran both on [flowbite-svelte](https://github.com/themesberg/flowbite-svelte) (commit `85f20a0`, 1,296 `.svelte` files from a real-world project), where the official `--tsgo` works. One important limitation: this setup does not reproduce the full Flowbite Svelte development environment, so both tools report roughly 900 diagnostics, mostly related to module resolution. The numbers are useful for performance trends, not for correctness parity (details in "Measurement details" above). With tsgo on both sides, **10 interleaved pairs** (with the execution order alternating between pairs and a fresh workspace for every run) gave a median of 3.96s (3.84-4.16) for the official svelte-check and 2.12s (2.03-2.36) for rsvelte-check. The median ratio within each pair was **1.9x** (1.72-1.96). This is much smaller than the engine-level multipliers because, end to end, the TypeScript-checking phase common to both setups takes most of the wall time.

#### 3.3.3 Parallel execution

Next, I measured the scenario most directly related to the article's main argument: **N check processes launched at the same time on one machine** (flowbite-svelte, tsgo on both sides; the svelte-check + Language Service setup was excluded because its run-to-run variance under parallelism was too large for stable numbers). Table values are "elapsed time until all N runs complete / total CPU time / peak aggregate RSS across all concurrently running process trees."

| Concurrency | svelte-check + tsgo | rsvelte-check + tsgo |
|---|---|---|
| 1 | 4.0s / 8.1s / 1.3GB | 2.1s / 6.0s / 1.2GB |
| 2 | 4.7s / 17.3s / 2.4GB | 3.5s / 13.1s / 2.2GB |
| 4 | 8.1s / 39.7s / 4.2GB | 6.7s / 28.6s / 4.3GB |
| 8 | 14.1s / 86.0s / 6.9GB | 13.5s / 67.8s / 6.7GB |

The 1.9x gap at N=1 shrinks as concurrency rises, and it nearly disappears with 8 simultaneous checks (14.1s vs 13.5s). This result suggests that **under a high-load simultaneous-start workload, the TypeScript-checking phase common to both setups becomes the bottleneck** (CPU time per check, total CPU time divided by eight, is still about 21% lower at 10.8 vs 8.5 CPU-seconds, and total RSS is similar; capping rayon threads at 12/N made no significant difference). In real use, however, check start times are spread out, so I believe shorter individual runs reduce the amount of time for which checks overlap. This simultaneous-launch benchmark does not measure that directly; verifying it with real agent execution logs is future work.

#### 3.3.4 Svelte-specific linting

I used the same paired-run methodology for linting (see "Measurement details" for the setup). This is not a comparison of the full ESLint configuration. I enabled the same 37 Svelte-specific rules at identical severities on both sides and disabled every other rule. Both tools produced **exactly the same 382 diagnostics**.

| | wall time | CPU time | peak RSS |
|---|---:|---:|---:|
| ESLint + eslint-plugin-svelte | 5.02s | 8.4s | 0.86GB |
| rsvelte-lint | 0.25s | 1.7s | 0.05GB |

The median ratio across 10 interleaved pairs was **19.4x** (range 18.0-23.5). Unlike type checking, this comparison has no large shared TypeScript phase dominating the end-to-end runtime, so the speedup remains close to 20x even end to end. Memory also drops sharply, from 0.86GB to 0.05GB.

#### 3.3.5 Engine-level performance

Finally, the engine-level results help explain the end-to-end speedups (3,857 `.svelte` files drawn from the official Svelte test suite, pre-loaded into memory; median of 10 runs after 3 warmups):

| Task | JS | rsvelte (1 thread) | rsvelte (multi) | Multiplier (multi) |
|---|---:|---:|---:|---:|
| Parse | 149.3ms | 9.0ms | 1.9ms | 79.1x |
| Compile (client) | 625.9ms | 202.8ms | 32.9ms | 19.0x |
| Compile (SSR) | 510.4ms | 114.1ms | 16.9ms | 30.2x |
| svelte2tsx | 231.6ms | 91.2ms | 11.4ms | 20.4x |
| Format | 2891.6ms | 117.0ms | 23.7ms | 122.2x |
| svelte-check (tool-side work only) | 875.2ms | 41.6ms | 15.6ms | 56.2x |

Three caveats about this table. First, the svelte-check row disables TypeScript checking and TSX overlay generation in both tools, comparing only file traversal and Svelte-side parsing, analysis, and diagnostics. Second, this table measures API calls; CLI startup, file discovery, and config resolution are not included. In other words, the result means "the format engine's throughput is about 120x on 12 cores," not "the format command feels 120x faster." Third, the corpus includes fixtures that intentionally fail to compile (the script catches and ignores JS-side exceptions), and it does not verify that the success and failure sets match exactly between the two tools.

This answers the two costs raised in 1.3. **Latency**: a production type check becomes 1.7x faster after switching to rsvelte-check with the TypeScript implementation unchanged, and 5.7x faster with tsgo added (51.4s to 9.0s); Svelte-specific linting becomes about 20x faster. **Resources**: type-checking CPU time drops about 56% from the rsvelte-check switch alone (104.9s to 45.9s) and to 32.1s combined with tsgo. rsvelte-check itself peaks at about 0.12GB, while rsvelte-lint peaks at about 0.05GB. In the rsvelte setups the TypeScript engine takes most of the memory, and choosing tsgo increases the engine's share.

## 4. Trying it today

rsvelte is pre-1.0 and early stage; APIs may change without notice. Known constraints and per-package maturity are in the table in 3.2. With that in mind, each package can be adopted independently. See the [rsvelte README](https://github.com/baseballyama/rsvelte#readme) for setup instructions.

Because the goal is a drop-in replacement, you can run it alongside the existing tools and compare the output. I recommend starting with rsvelte-check because it does not rewrite source files. Run it alongside the official checker and compare the diagnostics. For the formatter, start in `--check` mode or on an isolated branch, because known output differences remain.

## 5. Where this is heading

**Native integration with oxc.** The oxc project has an implementation plan for accepting external language plugins ([oxc-project/oxc#21936](https://github.com/oxc-project/oxc/discussions/21936)), and Svelte is among the targets. The implementation is still at an early stage, and there is no timeline for integration. Once it lands, oxlint and oxfmt could process `.svelte` files natively (instead of falling back to prettier), and users could adopt the oxc toolchain without knowing rsvelte exists.

**A possible future under the Svelte organization.** Nothing is decided here. Long term, I hope to propose moving the project under the Svelte organization. A toolchain needs community trust and continuity, and a personal repository has limits. I see the compatibility-first design principle as the groundwork for one day reaching a level where that proposal can be made.

## Summary

- As AI agents take on more implementation work, static checks increasingly run as part of every implementation loop. Check time sets a lower bound on iteration time, and check resource usage limits parallelism
- Rust and other native toolchains are delivering major speedups across the static-analysis stack, but the Svelte-specific parts of `.svelte` processing still rely on JavaScript implementations
- rsvelte is a set of Rust implementations that aims to be a drop-in replacement for the Svelte toolchain. It aims to preserve Svelte's language semantics and compiler behavior exactly, and it prioritizes low switching and rollback costs. Maturity varies by package
- On Flyle's production frontend, switching to rsvelte-check while keeping the JavaScript implementation of TypeScript made type checking 1.7x faster (51.4s to 30.6s, about 56% less CPU), and 5.7x combined with tsgo (9.0s). Svelte-specific linting with an identical rule set is about 20x faster. rsvelte-check itself peaks at about 0.12GB; in rsvelte-based configurations, the TypeScript engine consumes most of the total memory. You can try it alongside the official tools while comparing diagnostic differences

rsvelte is still a work in progress. If you try it and find problems, issues and feedback on [GitHub](https://github.com/baseballyama/rsvelte) are very welcome.

---

At [Flyle, Inc.](https://herp.careers/v1/flyle), where I serve as VP of Technology, we are currently hiring software engineers.
If this article resonated with you, if you are interested in building development infrastructure for the AI era, or if you are curious about our business, let us talk in a casual interview.
