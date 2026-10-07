# P2-02B — Wisp hierarchy checkpoint

Base: GitHub main `0cdd384ee35adc784721e9e2ce56b19bd9ccfe80`.
Branch: `03/p2-02b-wisp-lab-hierarchy`.
Implementation commit: `805546300d4bb9a16607a20f98a9706d2dc5d85e`.

## Scope delivered

- Current Formation leads the screen with occupancy, active preset and canonical portraits/names.
- Existing Push/Farm/Boss switch, save and global Auto-Empower controls remain intact.
- Active Wisps precede reserve/recruitment cards using a presentation-only copy of the roster.
- Empower/Recruit and its existing cost/state semantics appear before secondary progression.
- Individual Auto-Empower and level/power remain visible without expanding details.
- Bonds/guidance use a native disclosure; each Wisp has a native Ability/Rarity/Module/Ultimate disclosure.
- Disclosure open state survives rendering without adding saved state. Summary focus is restored after rendering; existing purchase-focus handling remains intact.
- Existing secondary system information and actions remain present inside the disclosures.
- No Lab, gameplay, economy, automation order, save, simulation, native or release changes.

## Validation

- Full behavioral suite: 57/57 deterministic scenarios passed.
- P1-05 strict accessibility: zero findings; control regressions and reduced motion passed.
- Rift viewport matrix: 20/20 passed, including 360x800, 360x780, 390x844, 412x915 and 360x640 with 24px top/bottom insets.
- All 12 negative scenarios failed as expected.
- New Wisp hierarchy test verifies active-first ordering, Formation identities, Empower ordering, reachable disclosure content, retained open state/focus and unchanged gameplay state.
- Identity QA maps canonical portraits by Wisp ID rather than roster position, checking exactly one encyclopedia match per Wisp.
- Existing nested-icon QA opens progression disclosures before measuring their purchase icons; sizing assertions are preserved.
- Diff whitespace check passed. Remote blob hashes match the tested local files.

## Rendered mobile inspection

Inspected the original main screen and revised fresh/mixed-auto screens at 360x780, plus high progression at 390x844 with level 200 Wisps, Mythic rarity, maxed modules, unlocked Ultimates and a 1e50 balance. Expanded secondary progression was also inspected.

On 360x780 the original first Empower action began beyond 1100px. The revised action begins at approximately 513px in the fresh state and 614px in the mixed-auto state. Formation and active identities now precede guidance. Inspected views had no horizontal overflow. Secondary progression still has its existing internal cards, but they no longer lengthen the collapsed roster or precede Empower.

Physical Android/TalkBack and font scaling require manual verification. This checkpoint does not claim those checks.

## Continuation

P2-02B IS NOT COMPLETE.

The Wisp implementation is committed; do not recreate it. Lab was explicitly excluded from this session and remains identical to main. Continue the separately authorized Lab hierarchy work later. Before a combined P2-02B PR, refresh main, inspect all remaining visual state combinations (including each saved Formation and poor/unrecruited states), rerun required QA, review the combined diff, and run pre-merge validation. No PR or merge was performed for this checkpoint.
