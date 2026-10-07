Genprøve er kun privat lokal og read-only remote. Ingen dependency/native/
workflowændring autoriseres. Byg repo fra exactR2 og overlay SOURCE14/modes;
verificér fulltree. Placer scripts ved privat projektrod ved siden af repo/,
input/, baselines/, stages/, runtime/, evidence/, gates/. OWN_RAW genskaber
logical evidence/gates. Rawcommands har originalabsolute paths; adaptér kun
private paths. Ordnet afhængighed: prepare.py → runtime/numeric/gates →
verify-gates → motor/minima/performance/diagnostic analyses → identity/stop.

prepare.py viser den anvendte private instrumentering og de syv uændrede
workflowcommands. Den henviser til den modtagne00_16-inputstruktur; original
modtagelsespakke er nødvendig for disse historical paths. De relevante bridge/
fixtures er også direkte i REPRODUCE for målrettet replay. Brug Source_Index.
run.py i SOURCE er den permanente aktuelle142-scenarieharness; gatescommand
kan køres direkte på den frosne repo med lokalChrome og Node20+.

Chrome153.0.8010.0 binary SHA256:
1346545781835e04ece3434a16d656ad5cbe60a6a179a43dff43f79a21f9a4ad.
https://storage.googleapis.com/chrome-for-testing-public/153.0.8010.0/linux64/chrome-headless-shell-linux64.zip
Node8.17.0/V86.2 actuallegacy syntax/helper/perf:
https://nodejs.org/dist/v8.17.0/node-v8.17.0-linux-x64.tar.xz
Node24.19.0/Python3.12/Playwright via primaryruntime bruges af private probes.
Acorn8.15 er grammar-testmateriale, aldrig en appdependency.

Fuldappgrammarkontrol og API-fravær har expectedFAIL på blocked; matrixhelper
på Node8 harBigInt utilgængelig. farm-runtime.cjs har ekstern moderne oracle,
appcontext udenBigInt. Fraction-orakler bruger IEEEhex/float-restoration.
Den oprindelige post-gates-batch exit1 skyldes det bevarede R2 verbose-timeline-
benchmarkFAIL; ni motor/diagkommandoer var allerede afsluttet. Performance
blev derefter kørt separat med normal captureTimeline:false; ikke rerun afgates.
Ingen fysisk Android/TalkBack/WebView60 emulering; ingen acceptclaim ud fra
historical grønne gates eller samlede checkcounts alene.
