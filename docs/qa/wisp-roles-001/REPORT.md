# WISP_ROLES_001 — lokal baselineanalyse

Dette er måling og designforberedelse. Ingen produktændring, integration eller deviceaccept.

Kilde: live main `b2a1f440e8ad9fed34b37551e468224310d2a6f6`, produktblob `ea44431c163569548973d9e489f75345749a07ee`.
Produkt-SHA256: `f896459f4f113b4173f8d1d1875f32cca9e3e4ae6f7416c6aca9be208f2537b4`. Node: v24.19.0.

## Modtaget save og faktiske indstillinger

Den bevarede og igen indsendte backup er efter Ascend: Ember 1, resten 0. MaxDepthEver 220; alle Rarity 5, Modules 20 og Ultimates. Kun Titan Auto-Empower er ON, Auto-Ascend target er 22 (clear 21). Presets er hensigt, ikke bevis for powered medlemmer.

| Simulering fra save | Tid | Rift | Aktive levels | Empowers |
| --- | ---: | ---: | --- | ---: |
| saved-settings | 60s | 1 | ember 1 | 0 |
| saved-settings | 600s | 1 | ember 1 | 0 |
| saved-settings | 3600s | 1 | ember 1 | 0 |
| auto-ascend-disabled | 60s | 149 | titan 23, ember 1 | 23 |
| auto-ascend-disabled | 600s | 190 | titan 98, ember 1 | 98 |
| auto-ascend-disabled | 3600s | 190 | titan 98, ember 1 | 98 |

Uændrede indstillinger genopbygger ikke det gemte Boss-hold i disse vinduer. Med kun Auto-Ascend OFF opbygges Titan og startup-Ember; det er en eksplicit kontrolvariant, ikke et nyt bruger-save eller en foreslået indstillingsændring.

## Equal-budget

Hvert hold får samme Lumen-loft, fordelt lige pr. slot. Hele eksisterende afrundede køb købes fra level 0; restbudget beholdes som cash. Det er samme spend-cap, ikke præcis samme forbrug eller en optimal købsstrategi. Permanent collection holdes identisk; historisk betalt Rarity/Module/Ultimate-værdi kan ikke udledes af levels og er ikke hævdet lige.

Alle 56 fem-Wisp-hold undersøges for hvert af tre budgetter, to permanente profiler og tre kontekster (1.008 holdmålinger). Push/Farm her deler damage-konteksten Rift 99; Farm har også ressourcefrontier. Alle tre Boss traits prøves særskilt i fuldmotoren nedenfor.

| Lumen-loft | Profil | Kontekst | Højeste målte DPS med Titan | Højeste målte DPS uden Titan | Uden / med |
| ---: | --- | --- | ---: | ---: | ---: |
| 100.000.000 | fresh-permanent | push | 2.124.991,61 | 1.003.658,5 | 47.23% |
| 100.000.000 | fresh-permanent | boss | 2.612.564,75 | 909.167,12 | 34.80% |
| 10.000.000.000 | fresh-permanent | push | 14.301.895,92 | 3.624.822,14 | 25.35% |
| 10.000.000.000 | fresh-permanent | boss | 17.600.498,72 | 3.339.039,84 | 18.97% |
| 1.000.000.000.000 | fresh-permanent | push | 34.010.818,95 | 7.322.287,57 | 21.53% |
| 1.000.000.000.000 | fresh-permanent | boss | 41.872.007,23 | 6.771.003,07 | 16.17% |
| 100.000.000 | saved-permanent | push | 15.463.547.307,03 | 6.503.551.811,53 | 42.06% |
| 100.000.000 | saved-permanent | boss | 15.463.547.307,03 | 6.503.551.811,53 | 42.06% |
| 10.000.000.000 | saved-permanent | push | 75.803.611.709,46 | 20.696.936.635,5 | 27.30% |
| 10.000.000.000 | saved-permanent | boss | 75.803.611.709,46 | 20.696.936.635,5 | 27.30% |
| 1.000.000.000.000 | saved-permanent | push | 170.038.523.249,12 | 40.913.527.445,11 | 24.06% |
| 1.000.000.000.000 | saved-permanent | boss | 170.038.523.249,12 | 40.913.527.445,11 | 24.06% |

Højeste betyder under den angivne lige slotfordeling. Det beviser ikke global optimalitet eller at Titan vinder under alle mulige købsfordelinger.

## Dine presets under et fælles 10 mia. Lumen-loft

Permanente køb følger den modtagne late-game-save. Run-levels er kontrollerede konstruktioner; ingen powered mid-game-save er modtaget.

| Preset / Rift | Faktisk forbrug | Rest | Rå damage-DPS | Bond-ekstra | Support-ekstra | Samlet |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| push / 99 | 9.253.542.216 | 746.457.784 | 26.780.729.378,28 | 6.516.850.843,46 | 0 | 33.297.580.221,74 |
| farm / 99 | 9.163.559.479 | 836.440.521 | 32.685.396.995,37 | 5.883.371.313,39 | 37.234.843.400,7 | 75.803.611.709,46 |
| boss / 100 | 9.313.367.610 | 686.632.390 | 32.707.274.223,49 | 9.430.610.208,52 | 20.167.595.834,7 | 62.305.480.266,72 |

### push / Rift 99

| Wisp | Level | Rå DPS | Ekstra support-DPS | Tab af hold-DPS ved fjernelse | Tab i % | Ability-Lumen/s | Ability-Shards/s | Motes-tab pr. Luminous kill |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ember | 146 | 1.542.176,41 | 0 | 5.080.919.067,53 | 15.26% | 0 | 0 | 0 |
| gale | 102 | 110.689.000,05 | 0 | 1.826.932.721,21 | 5.49% | 0 | 64.926,17 | 0 |
| thorn | 88 | 464.727.180,73 | 0 | 2.244.697.774,42 | 6.74% | 545.180,67 | 0 | 0 |
| void | 74 | 1.876.600.624,3 | 0 | 7.059.466.506,7 | 21.20% | 0 | 0 | 0 |
| titan | 45 | 24.327.169.586,88 | 0 | 30.246.335.479,73 | 90.84% | 0 | 0 | 0 |

Bonds med additivt skadebidrag før support: starcaller (ember + void): 4.820.531.142,31 DPS; pathfinder (gale + thorn): 1.696.319.701,15 DPS.
Faktisk reward pr. Luminous kill ved denne Rift: 27. Ability-rewards afrundes pr. cast; kill-rewards er et separat flow.

### farm / Rift 99

| Wisp | Level | Rå DPS | Ekstra support-DPS | Tab af hold-DPS ved fjernelse | Tab i % | Ability-Lumen/s | Ability-Shards/s | Motes-tab pr. Luminous kill |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ember | 146 | 1.542.176,41 | 0 | 11.566.265.997,14 | 15.26% | 0 | 0 | 0 |
| tide | 131 | 6.154.305,93 | 18.617.421.700,35 | 18.628.314.821,85 | 24.57% | 0 | 0 | 45 |
| void | 74 | 1.876.600.624,3 | 0 | 15.218.006.183,05 | 20.08% | 0 | 0 | 0 |
| aurora | 59 | 6.473.929.491,95 | 18.617.421.700,35 | 30.076.276.901,1 | 39.68% | 0 | 0 | 45 |
| titan | 45 | 24.327.169.586,88 | 0 | 56.194.470.786,31 | 74.13% | 0 | 0 | 0 |

Bonds med additivt skadebidrag før support: starcaller (ember + void): 5.883.371.313,39 DPS; dawnpriest (tide + aurora): 0 DPS.
Faktisk reward pr. Luminous kill ved denne Rift: 99. Ability-rewards afrundes pr. cast; kill-rewards er et separat flow.

### boss / Rift 100

| Wisp | Level | Rå DPS | Ekstra support-DPS | Tab af hold-DPS ved fjernelse | Tab i % | Ability-Lumen/s | Ability-Shards/s | Motes-tab pr. Luminous kill |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ember | 146 | 1.542.176,41 | 0 | 9.506.707.697,91 | 15.26% | 0 | 0 | 0 |
| stone | 117 | 28.031.534,05 | 0 | 5.130.183.379,1 | 8.23% | 0 | 0 | 0 |
| void | 74 | 1.876.600.624,3 | 0 | 12.524.549.692,69 | 20.10% | 0 | 0 | 0 |
| aurora | 59 | 6.473.929.491,95 | 20.167.595.834,7 | 28.437.489.508,54 | 45.64% | 0 | 0 | 27 |
| titan | 45 | 24.327.169.586,88 | 0 | 47.531.534.545,37 | 76.29% | 0 | 0 | 0 |

Bonds med additivt skadebidrag før support: starcaller (ember + void): 5.887.309.214,45 DPS; duskguard (stone + titan): 3.543.300.994,08 DPS.
Faktisk reward pr. Luminous kill ved denne Rift: 54. Ability-rewards afrundes pr. cast; kill-rewards er et separat flow.

## Regnskab uden dobbeltoptælling

Rå skade = passive skade + damaging abilities/cycle + Wisp-afledt Auto-Tap + Guardians faste grundbidrag. Permanente globale effekter er med. Bonds anvendes i fast kildeorden og deres inkrementer summeres. Support-ekstra er øgningen af passive skade og Auto-Tap efter Bonds; abilities buffes ikke. Rå skade + Bond-ekstra + support-ekstra matcher sustainedCombatDps i alle målte hold.

Tab ved fjernelse er en separat hvad-nu-hvis-måling med uændret investering, øvrige levels og permanent collection. Bond-partnere kan begge være nødvendige for samme effekt. Tallene må derfor aldrig summeres eller tegnes som en 100%-fordeling. I Farm-eksemplet bliver den fejlagtige sum 173.72% af totalen; negativkontrollen fanger begge former for dobbeltoptælling.

Lumen, Shards og Motes omregnes ikke til DPS. Dawnpriest/Modules vises som betingede resource-effekter og marginalt tab. Uptime er sustained, ikke første cast eller et løfte om konkret kill-tid. Pending/Bench giver intet earned bidrag; legacy buffs kræver særskilt visning som eksisterende entitlement ved en fremtidig UI-implementation.

## Observeret Boss-TTK fra fuldmotoren

Samme 10 mia.-loft, eksisterende permanente køb, ingen køer eller nye upgrades i vinduet, ingen startbuff, resource 0. Tidspunkt observeres efter alle motor-events, så både ability- og tap-kills medtages. 60s vindue. Dette er genererede hold, ikke faktisk spillede snapshots.

| Rift | Hold | Gennemsnitsestimat (s) | Første Boss-kill (s) |
| ---: | --- | ---: | ---: |
| 160 | titan, void, ember, gale, thorn | 5,09 | 5,44 |
| 160 | aurora, titan, void, ember, tide | 2,07 | 3 |
| 160 | aurora, titan, void, ember, stone | 2,53 | 3 |
| 160 | ember, void, tide, aurora, stone | 8,41 | 9 |
| 170 | titan, void, ember, gale, thorn | 20,11 | 20,69 |
| 170 | aurora, titan, void, ember, tide | 8,07 | 9 |
| 170 | aurora, titan, void, ember, stone | 9,82 | 10,56 |
| 170 | ember, void, tide, aurora, stone | 35,5 | 36,44 |
| 180 | titan, void, ember, gale, thorn | 36,06 | 36 |
| 180 | aurora, titan, void, ember, tide | 13,13 | 14 |
| 180 | aurora, titan, void, ember, stone | 17,24 | 18 |
| 180 | ember, void, tide, aurora, stone | 64,61 | ikke dræbt inden 60s |

## Åbne verifikationsfund

Den nye måler returnerer exit 1, fordi whole/split Farm-parity ikke består. Alle 16 kontroller bevarer konkrete motor-exceptions. På main afsluttes de otte 60s-vinduer med save-clock, men første 10s-chunk staller ved en mikroskopisk windowEnd-rest. Aligned control staller ved farmGrid. Den præcise nyere B2-index er også prøvet; se b2-results.json. Dette accepterer eller ændrer ikke B2 og er ikke en rettelse i WISP-scope.

Den arkiverede formula_probe genkører PASS og matcher præcis sit gemte resultat. Pending-zero, read-purity og de to negative double-count-kontroller består. Browserchecks er forsøgt: sandbox blokerer localhost-socket; support-stacking med ekstra adgang og derefter escalation afslutter med 25s timeout og ingen QA-resultat. Ingen browser-, mobil- eller Androidaccept påstås.

Alle detaljer, eksakte køb, restbudgetter, reward-rater, next-purchase DPS/Lumen, summaries, Boss-eventspor og exceptions ligger i results.json. Produktionsdesign og fortsættelse står i ../../tasks/WISP_ROLES_001.md.

## Latest integrated main — current receipt

PR51 merged to main `0bcce84d0b5c3c47daa2b16235311f48b1ab0bfd`. Exact product blob `90e4678cb28fa833fdacbc01d1744d9465f6a356`; SHA256 `4a9fac11b413071f9b722e2c50e0e46839d9de26e3214b52f619c279fc5d5607`.

All equal-budget and individual-Wisp outputs are unchanged. The numerical tables above remain applicable to this newer main. The old Farm failure summary above describes its explicitly named initial baseline.

On current main, 8/16 Farm whole/split checks pass: all saved-fractional-clock cases pass; aligned-clock cases still throw at farmGrid. Aggregate exit remains 1. See latest-main-results.json.

Current Node context check passes. Browser acceptance, actual powered mid/late-game snapshots, balance decisions, coordinated writer checkpoint and Wisp implementation/integration remain pending.
