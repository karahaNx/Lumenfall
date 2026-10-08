# Integrated Tree game delivery — 8 October 2026

PR66 is merged at ac0d28e589bd1caef4b9c70f2383a8b3ee384acd. It implements
PR90's accepted ownership matrix with effective purchase caps6/20, exact Prism
debits and closed-upgrade value preservation. PR85's fixed12h/schema2/refunds
remain intact. PR89 naming/Bonds refunds and PR88 Forge cap are separate work.

Candidate11cb7363bc304b31821e2b46b39a43cc7684be99 passed full
[CI37748062741](https://github.com/karahaNx/Lumenfall/actions/runs/37748062741):
176 default scenarios, all17 required causal negatives, source/tooling/identity
and guarded runtime startup. Game/assets/tests/scripts/CI gates and current
instructions were byte-identical between that candidate and integration ac0d28e.
The intervening PR95/96 main changes were delivery documentation/evidence only.
Fresh13 integrated commands pass; [results](results.json) and run-checks.cjs record
their exact arguments, Node version, source and raw log hashes.

- Tree154 assertions cover actual handlers/UI/save, caps, exact last-level prices,
  forged/invalid/retired inputs, finite/unrepresentable/partially rounded debits,
  over-cap/raw closed levels, full replacement backups and idempotent canonical
  migration. Included F26 legacy Reserves3 costs6+10+16 refund once.
- Normal/reduced browser320/390/430px, actual200% text,44px, wrapping/focus/labels,
  no ownership changes and conservative text contrast>=5.504 pass.
- Matrix chronology, reload/recovery/backup and F26 core pass, preserving paid
  Lab work, Prism stacking, live/offline chronology and documented fixed Motes.
- [Build152](https://github.com/karahaNx/Lumenfall/actions/runs/37751572716) passes.
  Exact signed com.lumenfall.app0.1.152, established certificate and release digest
  verified locally. All526 ZIP CRCs and15 HTML/font/branding assets equal ac0d28e.
  Extracted APK JavaScript passes119 Tree assertions on V8 6.0.287.53 plus the
  F26 no-BigInt/12h/once-only original-price refund probe. V8 is not a native DOM.

[Preserved APKs](../../../../../archive/android/tree-exclusive-001/README.md)
retain immutable152 and the actual148 baseline. APK152 SHA256:
bd17117782adfd37bc5b46cc109e0d6e3e4f290e3bc2df80b47edd2f87e729a8.
Product SHA256:45ae4c62bd37aed28bfd2b77147bffcbda1a9b6a699c4a3107e0fd1a4feccd02.
Exact build/release metadata and decoded raw build log are preserved here.

## Native Android update and interactions

Own software API27 emulator, Android8.1, actual WebView61.0.3163.98. The baseline
fixture supplies20000 Prisms and raw Starlight13/Steady9/Momentum7; actual unmodified
signed148 controls bought Echo5→6→7 and Bonds19→20→21 at11/16/2329/3376 Prisms.
The resulting14268 wallet, raw primary/recovery and native storage were captured.
No physical user save was modified; the synthetic seed is explicitly recorded.

Installing signed152 over148 preserves the104448-byte native Local Storage tar
byte-for-byte before first launch. After normal offline return commits, all raw
Tree/Lab/Forge/rarity/module/ultimate/Deed/queue ownership and14268 Prisms remain.
The inherited F26 migration creates schema2 with no invented refund for Reserves0.
Closed Tree13/9/7 contributions remain visible as+130%/+72%/+42% with no buying UI;
Echo7/Bonds21 remain saved and Maxed. Actual Android input touch buys Swift4→5
for16 Prisms, leaving14252. Disabled cap clicks cannot charge.

Six actual native width/text profiles320/390/430px×normal/doubled CSS text pass:
horizontal fit,44px targets, accessible labels, real5px focus outline and raw
ownership stability. Screenshots/metrics are in native/. Native cold-start,
corrupt-primary recovery and two actual confirmed backup restores/reloads retain
the same raw levels/wallet and equal primary/recovery. No restore grants currency.
Modern browser checks establish reduced-motion policy separately; native61 does
not establish a physical motion-setting or TalkBack observation.

Exact session drivers and raw records are preserved. They use the owned qemu
ADB port5681 and Node24/CDP; adapt paths/port only when replaying in a separate
isolated test environment. Never target a player's device with the seed/corruption
fixture. The initial connector bytes used for update/purchase are separately
saved as native-connect-initial.cjs; the later connector waits for startup and
graceful debugger closure. Tests never modify production game scripts or signing.

Probe failures are retained: early schema1 was read before cooperative catch-up
committed; the old debugger temporarily returned a page without a socket URL;
an asynchronous launch was read before its app PID; an open Welcome modal correctly
kept focus; a transient blank startup document denied Local Storage. Drivers now
wait for the actual origin/committed return, use normal Continue and close the
debugger gracefully. Assertions remain intact; no production fix/gate bypass.

## Completion status

Integrated code and verified APK152 delivered. Automated review's two findings
(partial-debit rounding and frozen-inventory reproduction) are fixed. Self-review
and automated review only; no human-independent review claimed. Later main06b28d5
adds another feature's Rift cosmetics; its Tree retention checks are recorded
separately, never treated as byte-identical to APK152 or its full CI.
All13 [current-main focused checks](../current-main-06b28/results.json) PASS,
including154 Tree assertions and the same matrix/persistence/F26/mobile checks.
The upstream diff and current source hash are preserved with those results.

[Physical/exact-native60/TalkBack acceptance](DEVICE_ACCEPTANCE.md) remains OPEN.
A pinned native60 emulator preparation is now possible and tracked by this chat;
it is not a pass until actual packaged-game tests complete. Feature/chat stays
open for missing required acceptance; shared product work for this Tree is done.
