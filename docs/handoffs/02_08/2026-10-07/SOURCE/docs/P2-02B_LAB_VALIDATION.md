# P2-02B Lab hierarchy and combined validation

The Lab portion continues Wisp checkpoint `ff105a4a642d5ae0a8266f9556ce947617c48f53` on `03/p2-02b-wisp-lab-hierarchy`, based on main `0cdd384ee35adc784721e9e2ce56b19bd9ccfe80`.
The first tested Lab implementation was pushed as `b364f3d9d21a1fc3fb48f84d20c90ecfe52b9ca5` before broader validation.

## Lab changes

- Long Studies opens with occupied/total slots and explicit available/full text.
- When a slot is free, Choose Study focuses and scrolls to the existing choices without selecting or starting one.
- Running Studies precede choices. A presentation-only sorted copy puts the next completion first; saved and simulated job order is unchanged.
- Each running Study shows identity, target level, Queue state, time remaining, active speed and existing progress bar.
- Remaining time is derived from authoritative remaining work divided by speed, matching the existing simulation completion boundary. The existing duration formatter retains its precision. No duration, speed or simulation mechanics changed.
- Effect descriptions and speed purchases remain reachable in native disclosures. Open state and summary focus survive rerendering without new persistent state.
- Generic explanation follows the choices. Existing costs, prerequisites, effects, queues and start/purchase handlers are preserved.
- Permanent Upgrades and the two-tab architecture remain unchanged. Rift arrival still selects and focuses Long Studies.
- Wisp implementation is unchanged from its checkpoint.

## Coverage

The new `p2-02b-lab-hierarchy` scenario checks 0/3, 2/3 and 3/3 occupancy; explicit slot text; earliest completion at differing speeds; existing timer precision; reachable speed/effect information; disclosure focus/open state; the choose shortcut; full-slot disabled actions; direct Rift arrival; and no gameplay mutation from inspection/navigation.

Viewport QA additionally checks slot-summary visibility, 44px choice/disclosure targets and horizontal fit. It opens native disclosures before measuring embedded icons, preserving all prior icon-size assertions. The existing P2-02A regression continues to cover actual Research purchases, Study starts and direct Rift navigation.

## Rendered inspection

Final local results: 58/58 behavioral scenarios passed; strict P1-05 had zero findings; reduced motion passed; all 20 viewport cases passed; all 12 negative self-tests failed as expected. Inline JavaScript syntax, unique/referenced HTML IDs and diff whitespace checks passed. Combined diff review found no gameplay, save, native or release changes. GitHub pre-merge validation is tracked on the PR separately.

- 360x780: empty and partially occupied slots, choice navigation, expanded speed controls and Permanent Upgrades.
- 390x844: all three slots occupied.
- Representative long Study names/descriptions and balances of 1e50 Lumen / 1e40 Shards.
- Slot state appears immediately below the tabs. Two collapsed running summaries fit on the compact screen. The choice shortcut exposes the original start controls without traversing secondary speed details. No horizontal overflow was observed.

Physical Android/TalkBack and device font scaling remain manual verification items, not claimed as tested here.

This document supersedes the Wisp checkpoint's pending Lab implementation note. No P2-03 or release/native changes are included. Merge remains a separate authorized step after PR validation.
