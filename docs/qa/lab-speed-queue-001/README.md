# F12 local dependency review

Read the [task](../../tasks/LAB_SPEED_QUEUE_001.md) first. This is owner evidence
on the frozen B2 candidate, not independent B2 acceptance or an integrated
feature. The local product delta is zero. Publication awaits a coordinated
Lead writer checkpoint.

`review.cjs` runs the unchanged B2 browser assertions through CDP, plus measured
200% text checks. Reproduce with Node 20+, Python for the original historical
B2 instrumentation, and Chromium at `/usr/bin/chromium`:

```sh
node scripts/recovery/restore_candidate.cjs /tmp/lumenfall-f12-b2
node docs/qa/lab-speed-queue-001/review.cjs /tmp/lumenfall-f12-b2 /tmp/lumenfall-f12-results
```

Use a new restore destination; the source hash must be exactly
`7c25b0b57722bda4ad6842b173bf9a390f2fa39942ad91206675a20e779d4d9b`.
The driver needs loopback-server/browser process access. It copies the original
instrumentation into a temporary stage and deletes only its own stage/profile.
It does not modify product sources. Browser shutdown and complete QA JSON
are required. Intentional reloads may discard an evaluation context; only
that transient protocol loss is retried.

Final evidence is in `raw/cdp/`, `raw/native.log`, `raw/reduced-motion.log`,
`raw/reduced-motion-screens/` and `raw/context-current.log`. Both native drivers
returned exit 0 with clean Chromium teardown. Contract assertions include
three causal mutants and restored controls, not just passive code comparisons.

`raw/cdp-attempt-1/` preserves the new driver's initial reload race.
`raw/cdp-attempt-2/` preserves an earlier report whose `color(srgb ...)`
contrast parser used the wrong units; it is superseded by `raw/cdp/`.
`raw/contracts*.log` and related process artifacts preserve sandbox and
`--dump-dom` failures. `raw/main-inquiry*` demonstrates the same dump timeout
on current main. A timeout without QA JSON never counts as PASS.
Original Chromium logs retain their trailing whitespace; documentation/code
whitespace checks exclude the raw evidence directory rather than edit it.

Native reduced-motion screenshots and the final 200% text screenshots cover
320/390/430px. At 320px the native select can shorten the option suffix with
200% text. Tier/price remain visible and the full option label is retained.
These measurements concern F12 controls; F11's future panel and F08–F10's
layout are separate. Physical Android/WebView60/TalkBack remain unverified.

`remote-snapshot.json` records observations and their endpoints/times.
`validation.json` records exits, hashes and scoped findings.
`PROJECT_STATE_DELTA.txt` is for Lead at the coordinated checkpoint; this chat
does not edit shared PROJECT_STATE. `manifest.json` covers this directory's
payloads except itself. The handoff ZIP has its own complete manifest.

No app scripts, Android files, signing, costs/rewards or workflows change.
Current main's PR51 scheduler postdates frozen B2. The future integration must
reconcile that scheduler and renew relevant interrupted/retried offline tests.
