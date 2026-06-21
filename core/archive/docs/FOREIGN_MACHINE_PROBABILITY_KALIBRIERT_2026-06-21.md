# 🎯 FOREIGN MACHINE PROBABILITY — KALIBRIERT (Phase 2)

> **Stand:** 2026-06-21 | **Tier:** T2 | **Sample-Size:** 20 Trials
> **Hardware:** RAM=12.00GB, CPUs=6, arch=x64, platform=win32
> **Detection-Reason:** forced by --tier CLI flag

---

## 📊 Tier-Runtime-P(Full) — Aggregate

| Metrik | Wert |
|--------|------|
| Trials | 20 |
| Tier-Runtime-P(Full) | 100.00% (20/20) |
| Latency Mean | 130 ms |
| Latency P50 | 128 ms |
| Latency P95 | 141 ms |
| Latency Min | 123 ms |
| Latency Max | 156 ms |

## 📋 Per-Mod Slot Latenz (informational)

> Trial-Marker isoliert pro (mod, run). Probe-Code ist IDENTISCH pro Trial;

> per-mod-Breakdown zeigt Slot-Allocation, NICHT mod-spezifische P(Full).

| Mod-Slot | Trials | Success-Rate | Mean ms | P95 ms | Max ms |
|----------|--------|--------------|---------|--------|--------|
| error1_watermark_mask | 5 | 100.0% | 131 | 131 | 141 |
| error2_false_positive | 5 | 100.0% | 135 | 140 | 156 |
| error5_english_text | 5 | 100.0% | 129 | 130 | 135 |
| error6_english_complex | 5 | 100.0% | 126 | 128 | 128 |

---

## ⚠️ SCOPE-LIMITS (was diese Messung NICHT abdeckt)

- **Mod-Empirische P(Full):** Probe ist `tests/plugin-boundary-contract.js` (76 Plugin-Boundary-Assertions, identischer Code pro Trial per Mod). Mod-spezifische Translation-Pipeline wird **nicht** gemessen — das wäre 20 LLM-Roundtrips + DB-Persist, separate Studie (Phase 1 Telemetrie).
- **LLM-Roundtrips:** Kein API-Call in dieser Messung. Echte Provider-Latenz kann ±30pp abweichen.
- **Network-Jitter:** Gemessen wird Node-Spawn + Plugin-Ladevorgang, NICHT Provider-Network.
- **Mod-Content-Validation:** Watermark-Sanitization, Placeholder-Shield, Deep-Polish nicht in Probe enthalten.

## 🔀 Tier → Statische Use-Case-Matrix (Delta vs. LOWEST Tier-P Match)

> Pro Tier EIN Use-Case aus der statischen Matrix als Referenz.
> Bei mehreren Use-Cases auf einem Tier (z.B. T2 → Casual + Mid-Range-keys) wird nur der LOWEST-Fit als Vergleich herangezogen — die Messung gilt dem Tier, nicht einer einzelnen Mod-Kategorie.

| Tier | Ref-Use-Case (statisch) | Statisch P | Tier-Runtime-P (empirisch) | Δ |
|------|-----|------|------|---|
| T2 | unknown (tier not in static-matrix) | NaN | 1.0000 | NaNpp |

---

## 🔗 Cross-Refs

- Statische Schätzung: `docs/FOREIGN_MACHINE_PROBABILITY_2026-06-21.md`
- Plan: `docs/plans/PLAN_RUNTIME_PROBABILITY.md`
- Tool-Spec: `docs/plans/PLAN_GLOBAL_SCORE.md`
- Aggregation: `docs/plans/CALCULATION_AND_INTEGRATION_2026-06-21.md`
