# Measured Inquiry

Scoped candidate for Lead 00_09, based on `df78d51181a59d247bf4fc9abf1c7e05237e9c2b`.

`measuredinquiry` unlocks at historical Rift 60 and caps purchases/effect at
completed level 10. Raw saved ownership is retained. Each paid level starts
at speed 1, costs `round(30000 * 1.8^k)` Lumen and `round(1200 * 1.8^k)`
Shards, and requires `round(600 * 1.6^k)` work seconds. Levels 0–10 require
13,351,752 Lumen, 534,070 Shards and 108,951 nominal work seconds.

Each completed level reduces work by 2%, capped at 20%, only on future paid
starts of the original eight studies. Duration is rounded before and after
the reduction. Inquiry never discounts itself. Existing paid snapshots and
Mote tiers/prices are unchanged; the next queued start uses speed 1.

The frozen eight IDs govern discount targets, existing study Deeds, slot
thresholds and v0 autostudy seeding. Inquiry occupies a normal slot and
does not count toward First Discovery, Devoted Scholar or Every Path Studied.
Their requirement text names the eight studies. Slots remain 2/3/4/5 at
historical Rifts 1/40/60/90. The original five Forge Deed targets and the
683-Comet reward pool are unchanged.

A shared start plan rejects unknown, locked, maxed, duplicate, full-slot,
unaffordable or nonfinite-cost/duration starts before payment. These finite
guards do not cap or migrate original-study ownership. Due completions are
processed before automatic starts, including study-only entry after the
combat cap. Closing an already-paid overcap Inquiry record counts as
scheduler progress, separately from earned completions: no level, refund,
Deed credit or false completion notification is granted.

Schema 1 and existing save keys/guards remain unchanged. Inquiry defaults to
level 0 and queue OFF; v0 autostudy enables only the original eight queues.
Ascension and compatible reload/backup/recovery preserve raw levels, queues
and active work. Full Reset clears them. Older schema-1 app code can strip
unknown IDs and their active records when it canonicalizes and saves. Safe
downgrade round trips are not promised; an untouched new-app backup requires
compatible new-app code. This candidate adds no version strategy or refund.

Behavioral coverage adds contract, chronology, mobile UI/reduced-motion,
real reload, backup restore, recovery and reset cases. Causal negative
controls catch self-discount, queue-before-completion and disposal reported
as no scheduler progress. Three existing catalog assumptions change:
destination count becomes nine; the 25-level Deed fixture stays scoped to
the original eight; v0 autostudy requires those eight ON and Inquiry OFF.
Existing state/chronology/persistence oracles remain.

Local browser verification uses Chromium 141 headless shell because the
full Chromium binary cannot create its process-singleton AF_UNIX socket in
this execution environment. The unchanged GitHub pre-merge workflow supplies
the independent Ubuntu/Chrome check. No Android build or release is part of
this candidate; Lead assigns independent Core/QA review after freeze.
