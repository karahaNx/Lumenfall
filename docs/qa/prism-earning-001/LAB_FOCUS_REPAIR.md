# Lab completion focus — reviewed repair

User continuation: bring the verified Lab repair into PR103, validate the combined
candidate, integrate into PR102 development only. No main merge or APK publication.

## Reproduction and correction

Full run37940354355 on a5783524 failed only lab-motes-ui at320/390/430px,
lab-motes-native and lab-motes-reduced-motion; raw output is preserved in
artifact11622771951 (ZIP SHA256
9c59b4a761bde24d6136bc19102b57a37d4fdce5170f7363ed6fe6e50fe0c5a1).
The retired-card expectation was obsolete, but replacing it revealed a real
presentation regression: focus reaches the Study choices heading after paid
legacy work completes, then is lost when the heading is recreated on refresh.

Repair994040ee1bf5c63c2250922707472fd912866580 retains that focused heading
across renderLongStudies. Five production lines; no economy/save mutation.
The remaining Encyclopedia Ascend description now matches the protected-bonus
repeat policy, with a regression assertion. The repair does not reintroduce
legacy shop entries, change controls for Auto-Ascend, or grant duplicate levels.

## Executed evidence

[Isolated repair run37945085905](https://github.com/karahaNx/Lumenfall/actions/runs/37945085905),
job113869166555: SUCCESS, including tested-file commit to fix/prism-lab-closeout.
All three baseline mobile cases fail via completed in-page assertions specifically
on lost heading focus, with zero runtime errors. Corrected lab-motes-ui at all
three widths, lab-motes-native, lab-motes-reduced-motion, upgrade-effects-and-deeds,
source and numerical/Encyclopedia checks pass. Tests retain value/save purity,
repeated refresh and no-second-completion assertions from five focused controls.
Here native means the browser driver's native controls, not an Android device.

Downloaded artifact11623184612, prism-focus-repair-37945085905, verified ZIP SHA256:
779a76e260be5c53ab1514c227f02f917af8c9dc3deec9a584f9720c9577c7f8.
Product SHA256:5a65b50ed8f2c1f7bbdd91f1b93bf60fefb273668cd855f59ae4e8b66568ad40.
Exact copied Git blobs:
- index.html:2edf633f9752685d34723d70449e218287b185c3
- tests/behavioral/lab-ui.js:979b950f1b0669956072907f6e3c36ade1f2d9a7
- tests/behavioral/prism-earning.cjs:c3db73127eb38202c73b4a6a6809705db74ded8e

The temporary repair workflow is NOT imported. Only these three reviewed files
and current task/evidence documents are added on top of a5783524.

## Remaining acceptance

The complete PR103 combined-source regression and required negative/startup gates
must pass on this exact candidate before development integration. Record final
runs, source/tree identity and actual merge in PR103/PR102; earlier green runs
are not relabelled. Physical Android, native WebView60, OS font scaling, TalkBack
and final signed APK acceptance remain separate. Late exponential pricing and
the broader progression expansion are not certified by a correct reward formula.
