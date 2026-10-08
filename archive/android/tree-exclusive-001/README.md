# TREE_EXCLUSIVE_001 signed game update

The Tree implementation is integrated through
[PR66](https://github.com/karahaNx/Lumenfall/pull/66),
main ac0d28e589bd1caef4b9c70f2383a8b3ee384acd.
[Build152](https://github.com/karahaNx/Lumenfall/actions/runs/37751572716)
published the established Android release. These copies preserve the exact
verified binaries independently of the mutable android-latest release.

| APK | SHA256 | Purpose |
| --- | --- | --- |
| [Milestone0.1.152](Lumenfall-0.1.152.apk) | bd17117782adfd37bc5b46cc109e0d6e3e4f290e3bc2df80b47edd2f87e729a8 | Test-only: initial Tree caps/value update before final accessible-name correction;6847762bytes |
| [Milestone0.1.153](Lumenfall-0.1.153.apk) | 5374062662994247904792323d332430cd76121157cf8648f9e48163ba8c3d46 | Test-only: native60 update/payment milestone before final accessible-name correction;6849458bytes |
| [Baseline0.1.148](Lumenfall-0.1.148-baseline.apk) | cef6c291a4f91a3921bdc3b2d2e6f772906d39560f995fcaedf420ccd9972657 | Actual old over-cap purchases/native update fixture;6844772bytes |

Both are com.lumenfall.app with established certificate SHA256
A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21.
APK152's526 ZIP entries pass CRC checks and all15 index/font/branding assets
equal the integrated source. index.html SHA256:
45ae4c62bd37aed28bfd2b77147bffcbda1a9b6a699c4a3107e0fd1a4feccd02.

[Delivery evidence](../../../docs/qa/tree-exclusive-001/finish/integrated/README.md)
records exact versions, checks, fixtures and limits.
[Required physical acceptance](../../../docs/qa/tree-exclusive-001/finish/integrated/DEVICE_ACCEPTANCE.md)
remains OPEN. All binaries currently listed are test milestones. The final
accessible-name correction requires a new verified signed APK before delivery.
