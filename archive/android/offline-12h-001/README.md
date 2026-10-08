# F26 signed update inputs

PR85 integration:91decbc8e26744b21c26a21b20742be6ebca1d8e.
The immutable150 APK contains the common12h/refund feature and PR78 bulk memory.
The144 baseline is retained for the real signed-app update regression.
Package com.lumenfall.app; established signing SHA256
A9:1C:BF:34:27:D2:CE:B1:CD:BE:07:E5:22:5F:17:D4:71:B1:82:9E:52:F7:AB:66:49:7E:75:49:75:AD:3E:21.

| File | SHA256 |
| --- | --- |
| Lumenfall-0.1.150.apk | 8ad8aeab6df7224e629c8a93805386a5c16851ffeb53e2f7338f42c76b0d79bc |
| Lumenfall-0.1.144-baseline.apk | 6e2006cb90ebe27104bd1ae38ba8c8afa700f4ede90e6fe8046bf7b2f505ca5d |
| baseline-144-index.html | 18d5b7775c7e69e0419d2d96a52ddddc5180790bc67672c1f93f880f1f49c8cf |

[Task](../../../docs/tasks/OFFLINE_12H_001.md) and
[verification/replay](../../../docs/qa/offline-12h-001/README.md) record actual status,
device identity, CRC/asset manifests and remaining acceptance. No signing keys are
included. Prepare fixtures only in an isolated QA emulator, never a player's save.
