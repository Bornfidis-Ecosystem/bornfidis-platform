# BBOS Phase Two Usability Backlog

**Purpose:** Capture friction from the Founder Walkthrough without fixing during the test.  
**Companion protocol:** `docs/BBOS_FOUNDER_WALKTHROUGH.md`  
**Rule:** Phase One frozen assets stay untouched until an issue is **Accepted** for a named release and explicitly unlocked.

---

## How to use this file

1. Complete the Founder Walkthrough first.  
2. Log every pause here (one ID per distinct issue).  
3. Prefer honest “I wasn’t sure” notes over polished analysis.  
4. After the full journey, run the **Prioritization method** below.  
5. Only then decide what (if anything) becomes a V1 launch blocker fix.

Duplicate this file or copy the log table into a working sheet if you prefer spreadsheets — keep the field set identical.

---

## Controlled values

### Severity

| Value | Meaning |
|---|---|
| **Blocker** | Owner cannot complete the task or risks a serious mistake. |
| **Friction** | Completable, but hesitation from instructions, layout, terms, or flow. |
| **Nice-to-have** | Works; polish or convenience only. |

### Issue type

`Content` · `Instruction` · `Terminology` · `Worksheet` · `Calculator` · `Workbook` · `Navigation` · `Packaging` · `Accessibility` · `Consistency` · `Other`

### Status

`New` · `Reviewed` · `Accepted` · `Deferred` · `In progress` · `Fixed` · `Retested` · `Closed`

### Recommended release

`V1 launch blocker` · `V1 polish` · `V1.1` · `V2` · `Not planned`

### Frequency (suggested)

`Once` · `Several times in session` · `Every similar step` · `Unknown`

### Affected customer type (suggested)

`First-time BBOS user` · `Busy delivery owner` · `Owner with helper/worker` · `Non-native English reader` · `Other: ___`

---

## Backlog fields (canonical)

Every entry must include:

| Field | Description |
|---|---|
| **ID** | Stable ID, e.g. `UW-001` |
| **Date found** | YYYY-MM-DD |
| **Module** | 1 / 2 / 3 / 4 / Cross-cutting |
| **Asset** | Main Guide module, Calculator, Workbook, Other |
| **Location** | Chapter, sheet name, section, or step ID (A1, B5, D9…) |
| **Task attempted** | What the reviewer was trying to finish |
| **What happened** | Observed friction or failure |
| **What was expected** | What “good” looked like |
| **Issue type** | From controlled list |
| **Severity** | Blocker / Friction / Nice-to-have |
| **Evidence or example** | Quote, paraphrased confusion, time lost, fictional scenario |
| **Suggested improvement** | Hypothesis only — not a commitment to change |
| **Affected customer type** | Who would feel this most |
| **Frequency** | How often it showed up |
| **Risk if unchanged** | Practical risk (wrong price, abandoned cadence, etc.) |
| **Recommended release** | From controlled list |
| **Status** | From controlled list |
| **Owner** | Who will decide/fix later (blank during walkthrough) |
| **Resolution notes** | Filled only after accepted work |

---

## Session header

| Field | Value |
|---|---|
| Walkthrough date(s) | |
| Reviewer | |
| Fictional test business | |
| Copy of calculator used? (Y/N) | |
| Copy of workbook used? (Y/N) | |
| Normal week simulated? (Y/N) | |
| Disruption / Catch-Up tested? (Y/N) | |
| Fixes made during test? (**must be No**) | No |
| Total issues logged | |
| Blockers count | |
| Friction count | |
| Nice-to-have count | |

---

## Issue log

Copy a block for each issue. Keep IDs sequential.

### UW-001

| Field | Value |
|---|---|
| ID | UW-001 |
| Date found | |
| Module | |
| Asset | |
| Location | |
| Task attempted | |
| What happened | |
| What was expected | |
| Issue type | |
| Severity | |
| Evidence or example | |
| Suggested improvement | |
| Affected customer type | |
| Frequency | |
| Risk if unchanged | |
| Recommended release | |
| Status | New |
| Owner | |
| Resolution notes | |

### UW-002

| Field | Value |
|---|---|
| ID | UW-002 |
| Date found | |
| Module | |
| Asset | |
| Location | |
| Task attempted | |
| What happened | |
| What was expected | |
| Issue type | |
| Severity | |
| Evidence or example | |
| Suggested improvement | |
| Affected customer type | |
| Frequency | |
| Risk if unchanged | |
| Recommended release | |
| Status | New |
| Owner | |
| Resolution notes | |

### UW-003

| Field | Value |
|---|---|
| ID | UW-003 |
| Date found | |
| Module | |
| Asset | |
| Location | |
| Task attempted | |
| What happened | |
| What was expected | |
| Issue type | |
| Severity | |
| Evidence or example | |
| Suggested improvement | |
| Affected customer type | |
| Frequency | |
| Risk if unchanged | |
| Recommended release | |
| Status | New |
| Owner | |
| Resolution notes | |

<!-- Add UW-004, UW-005, … by duplicating the block above. -->

---

## Quick triage table (optional summary view)

After logging, compress into one row per ID for review meetings:

| ID | Module | Severity | Issue type | One-line summary | Recommended release | Status |
|---|---|---|---|---|---|---|
| UW-001 | | | | | | New |
| UW-002 | | | | | | New |
| UW-003 | | | | | | New |

---

## Prioritization method (after the walkthrough)

Run in order. Do not skip ahead to polish.

1. **Review all blockers first.**  
2. **Group duplicate issues** (same root cause → one Accepted item + linked IDs).  
3. **Identify system-wide patterns** (e.g., “completion criteria unclear,” “tool hard to find,” “term redefined”).  
4. **Separate genuine defects from personal preferences.** Preferences default to Nice-to-have or Not planned unless they cause real owner risk.  
5. **Fix only approved V1 launch blockers** before Phase Two content (Module 5 architecture) continues — and only with explicit unlock of the frozen asset.  
6. **Defer polish and feature requests** into V1 polish / V1.1 / V2.  
7. **Retest every accepted fix** (Status → Fixed → Retested → Closed).

### Pattern board (fill after grouping)

| Pattern name | Related IDs | System-wide? (Y/N) | Tentative release |
|---|---|---|---|
| | | | |
| | | | |
| | | | |

### Preference parking lot

Issues that are taste, not defect:

| ID | Why this is preference | Disposition |
|---|---|---|
| | | Not planned / V2 / V1 polish |

---

## V1 launch blocker register

Only issues with **Recommended release = V1 launch blocker** and **Status = Accepted** belong here.

| ID | One-line risk | Unlock required? | Owner | Retest date | Closed? |
|---|---|---|---|---|---|
| | | | | | |

If this table is empty after review, record that explicitly:

- [ ] No V1 launch blockers identified after Founder Walkthrough review.

---

## Module 5 architecture gate

Complete only after prioritization.

| Question | Answer |
|---|---|
| Walkthrough exit criteria met? (see Founder Walkthrough Guide) | Yes / No |
| Open Accepted V1 launch blockers? | Yes / No — IDs: |
| Go / no-go for Module 5 architecture | Go / Go with conditions / No-go |
| Conditions (if any) | |
| Decision date | |
| Decision maker | |

**Default rule:** If any **Accepted** V1 launch blocker remains open, recommendation is **No-go** or **Go with conditions** until retested and Closed.

---

## Change control reminder

- Frozen Phase One assets (Modules 1–4, Constitution, Style Guide, Release Register, Calculator, Rhythm Workbook, their build/validate scripts, tag `bbos-v1-phase1`) must not be edited from this backlog alone.  
- Accepted fixes require an explicit executive unlock and a normal commit/review path.  
- This backlog file may be updated freely with new findings; that is not a product unlock.

---

*BBOS Phase Two Usability Backlog · Template only · No product changes implied by logging an issue.*
