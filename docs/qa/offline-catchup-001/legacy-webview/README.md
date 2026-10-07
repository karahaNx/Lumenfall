# Native legacy WebView follow-up

The user asked whether Android could be tested here. An isolated Android 8.1
API27 x86_64 emulator with AOSP WebView **61.0.3163.98** runs the actual signed
APK **0.1.134**. Advanced-save startup throws
`TypeError: select.replaceChildren is not a function` before catch-up.
`native-before.json` records that real exception. This is a failed native check,
not acceptance. The initial debugger/harness adaptation attempts are preserved
in `harness-adaptation.txt` and are not passing evidence.

Baseline: main `e0775c5ac13ddfb8ba66def51cb14e1b774caeb0`, product SHA256
`4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`;
APK134 SHA256 `09e53527d8a968801f6457297558efcb4ffcf5b260af47f202447e57455b6f6c`.
Candidate product SHA256
`c347c5a5206f35e6fb694e9e78d4b389e74ecdd6175873cb540db79ec33b6174`.

The focused patch preserves the selector/focus while replacing its children
with legacy DOM operations. A new registered regression removes
`Element.prototype.replaceChildren` before real product startup. `dom-before.txt`
fails on the unchanged baseline; `dom-after.txt` passes on the candidate, with
cold 8h, resume, interruption/retry, primary failure/retry and daily return UI.

Two PR51 automated P2 findings were reproduced on unchanged baseline bytes:
[processing time](https://github.com/karahaNx/Lumenfall/pull/51#discussion_r4207393562)
and [daily retry](https://github.com/karahaNx/Lumenfall/pull/51#discussion_r4207393577).
`processing-time-before.txt` fails because the final save loses 60 seconds;
`processing-time-after.txt` passes 8h and 72h live-policy parity and unchanged
offline accounting. Processing time uses the existing live policy inside the
same detached transaction, to normal 100ms live-tick granularity. The offline
cap and study-only tail are unchanged.

`daily-retry-before-final.txt` fails after awaiting the existing intro and using
real Claim input. `daily-retry-before.txt` is the initial diagnostic, superseded
by that synchronized reproduction. The passing candidate DOM receipt also
checks daily presentation after retry, no duplicate award and one presentation.

Commands: `node tests/behavioral/offline-catchup.cjs`;
`node tests/behavioral/run.cjs --web-root . --scenario offline-catchup-legacy-dom`;
baseline UI command uses `--web-root /tmp/lumenfall-legacy-oracle` with immutable
baseline source and current regression assertions. Node24, Chrome155 were used
locally. Before-results exit 1 without timeout; after-results exit 0. Full
required CI and the corrected signed APK/native suite follow publication.

Exact physical Android/WebView60/TalkBack acceptance is still pending. WebView61
emulation, Chrome155 DOM capability removal and V8 6.0 checks are useful separate
evidence and do not establish those remaining requirements. Keep the feature open.

## PR54 review revision

The first candidate above was published as `2674b571103c84d8dbfc2300e2784592f6d8d074`.
Automated review identified [wall-clock correction](https://github.com/karahaNx/Lumenfall/pull/54#discussion_r4208474235)
and [another midnight before retry](https://github.com/karahaNx/Lumenfall/pull/54#discussion_r4208474251).
Both are reproduced against unchanged first-candidate bytes. The revised product
SHA256 is `006213815911c04f273d7568e3ea410df7c0114c956f48dd534e3ec2a31911e0`.
It measures processing with WebView60-supported `performance.now()`, uses a
separate wall-clock save endpoint and queues daily presentation without changing
awards/schema. Reset/new-game clears pending presentations.

`monotonic-before.txt` fails on a +1h clock correction; `monotonic-after.txt`
passes 8h/72h live parity and ±7-day clock corrections with only 60 seconds of
earned processing time. `monotonic-v8.txt` passes V8 6.0. Browser fixed-clock
parity controls replace only the processing clock through the existing injected
QA bridge, retaining the real batch clock/frames. Core VM tests independently
control wall and monotonic clocks. The UI timeout allows the added next-midnight
simulation; reload polling retries only the expected transient CDP navigation
errors, and still fails on runtime exceptions/assertions/timeouts.

`daily-queue-before.txt` fails the first-day presentation after another midnight on the first candidate. `daily-queue-after.txt` passes, showing both rewards in order, awarding each once and consuming each prompt once. Earlier prompts are claimed before the focused case.
