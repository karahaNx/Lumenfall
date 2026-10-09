# Recovery debug — 9 October 2026

Scope: resume PR103, finish combined validation, then integrate only into the
PR102 development collection. Main and APK publication remain held.

## Reproduced failure

Pinned head3629cdfabab298d242f7eb7872f3879db3add665, product SHA256
`d4ac7160103da236623164445791478ff42a94d03dbf548aff11cde25f952f0a`.
[Run37938418288](https://github.com/karahaNx/Lumenfall/actions/runs/37938418288)
replayed thirteen relevant scenarios twice with exact source/test manifests.
Both iterations fail only upgrade-effects-and-deeds: the test reads textContent
from an absent retired-upgrade DOM element. The user explicitly removed these
read-only shop cards; restoring them to satisfy an obsolete test is incorrect.
The original failed DOM/error and all other results are preserved in artifact
11620276790, ZIP SHA256
`05245777d5cf093ebd07045bd18b2241d68f03730777cf00ca8cb7c211208a17`.

The other twelve scenarios pass both replays: Core QoL; Tree UI normal/reduced;
upgrade identity contracts, chronology, Farm clock, UI normal/reduced, save,
backup and recovery; Rift guidance. Isolated passes do not replace full CI and
do not prove the causes of every intermittent earlier full-run failure.

## Correction and unchanged contracts

Upgrade clarity now asserts that all retired shop cards are absent at every
fixture level, while their raw bought levels, authoritative earned text and
actual Lumen/Tap/Momentum/offline/Formation/Prism factors remain correct.
Current shop text, capped values, paid pending Study completion, exact render
and storage purity, all Deed thresholds and the 683-Comet total remain checked.
No product, balance, save schema, wallet, purchase or Android bytes change.
No scenario is removed and no existing numeric tolerance is relaxed.

Full CI additionally retains the complete behavioral output, raw failures and
source/commit identity as an artifact. This changes evidence collection only;
all existing checks, failure exits and negative controls remain required.

Local Node22 numerical341654 and state3506 checks pass on the exact product.
Local Chromium144 attempts produced no completed QA DOM and are NOT TESTED;
GitHub provides actual browser execution. The corrected browser/full-suite
results must be recorded before integration. No merge or APK is claimed here.
