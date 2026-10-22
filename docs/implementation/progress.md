# Kora AI context and wardrobe execution
Baseline: Laura main 719f2b3, isolated branch feat/ai-context-wardrobe. Original checkout and fork unchanged.
Baseline npm test: 103 passed (local HTTP tests require sandbox listener permission).
Tasks: AI context/tools + confirmation; wardrobe assets + wallet/UI; regression and review; separate review commits.
Ruling: use existing calendar.shorter duration, not arbitrary AI minutes; preserve existing adjustment contracts.
Task 1 complete: context privacy/date validation, provider tool-call suggestions, complete-stream gate, stale-plan confirmation and existing undo. Full suite 114 passed including three wardrobe model tests developed alongside. Beta shared-module packaging test caught and fixed omitted validator dependency.
