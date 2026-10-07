# LAB-MOTES-001 — repeat paid Study speed

Current integration (7 October 2026): user-authorized PR57/46 are merged;
full 146 CI and signed APK 0.1.138 asset/signing checks pass. Required device
acceptance and independent review remain open. See
[the integration receipt](FEATURE_BRANCH_INTEGRATION_001.md).
The checkpoint below is historical; its writer/release holds do not describe
the current authorized task. Archived originals remain unchanged.

02_07 Gameplay implementation for scoped Core and independent QA review.
The current [product mandate](LAB_MOTES_001_MANDATE.txt) supplements the older
writer status in PROJECT_STATE and the prototype-only boundary in the
[original requirements](LAB_MOTES_001_REQUIREMENTS.txt).
Read both and the [original user request](LAB_MOTES_001_USER_REQUEST.txt) in full.
All three TXT originals are retained byte for byte.

Fixed base: `1ddc246eb62782a61ec5c486cd5f51ea170bb338` (PR45).
Branch: `02/lab-motes-repeat-v1`. One Draft PR; review precedes integration.

Each known Study has independent saved `studyUseMotes` and `studySpeedTargets`.
Defaults are OFF and 1.5x; old saves may remember an active paid speed as their
OFF target. Only explicit true plus a valid numeric target can retain ON.
Normalization never buys and does not mutate input work snapshots. Save schema,
keys, recovery guards and Ascension/reset policies retain their existing roles.

Study Queue starts the next paid level at 1x. Use Motes buys exactly the chosen
existing tier at its full existing price, again per level. It waits at the
current speed when short; OFF or a lower target retains speed already paid.
Successful manual speed purchases remember the target without enabling ON.
Repeat purchases follow LONG_STUDIES declaration order after due completion,
closure and new paid starts at each authoritative timestamp.

Farm economy boundaries count actual Luminous rewards using the current enemy,
pity accumulator, chance and reward, including partial HP. Purchases do not use
an expected reward rate or wait until batch end. Existing live/offline reward
policies and the study-only tail remain in force. UI/render never buys repeat
speed. Native Lab controls expose intent separately from actual running speed.

Tests are in `tests/behavioral/lab-motes.js` and `lab-motes.cjs`, registered in
the default behavioral suite. Coverage includes prices, repeated full debits,
independent toggles, malformed/old saves, recovery/backup/reset/Ascend, caps,
actual reward/work timelines and shared-budget order. Scoped causal mutants
exercise cheaper fallback, free next-level carry and delayed batch-end buys.
Native touch/keyboard, focus, ARIA and 44px targets run at 320/390/430px with
normal and reduced motion. Pre-merge source/runtime gates and existing tests
remain required; workflows are unchanged. The existing native Rift driver
observes bounded kinetic-scroll settling before tapping after a swipe; it
never corrects scroll or relaxes the immediate first-frame Rift assertions.
These multi-profile Rift driver processes have a 120s bound to accommodate
observing native scroll settling; generic process/timeout controls are unchanged.

The delivery packet records the exact final head/tree, patch, raw logs and
exit codes, automatic PR CI and explicit writer release. Physical Android and
TalkBack remain untested. Green CI does not replace Core/QA/Lead acceptance.
No merge, ready, Android build, workflow dispatch/rerun or release is authorized.
