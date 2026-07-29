# Field Mapper — Design Notes & Decisions

Running log of decisions and requirements captured during design/brainstorm, to feed into the prototype/story. Not a spec — a memory aid.

---

## Copy mappings between offer forms (Direct ↔ Partner)

**Context:** Direct and Partner offer forms share ~80% of fields but intentionally diverge on some (e.g., CrowdStrike `Offer name`: `... - Private Offer` vs `... Private Offer - CPPO`). We chose an **explicit, user-initiated copy** ("Copy to / Copy from") over automatic propagation, because divergence is intentional and a manual action encodes user intent.

**Requirement — REQUIRED for the prototype/story:**
- The copy action MUST include a **preview / diff step before Apply**, not a blind bulk-write. This is non-negotiable for trust.
  - Show a summary such as: *"12 fields will be copied. 2 will overwrite existing partner values: [Offer name, Offer description]."*
  - Surface exactly which target fields will be **overwritten** (i.e., already have a value) so the user doesn't silently clobber intentional divergences.
- Consider (secondary) an **"only fill empty fields" vs "overwrite all"** choice, but the preview/diff is the primary safeguard.

**Decided (2026-07-28):**
- **Scope of copy:** copies **both the Salesforce mapping AND the default value** (not structure-only). No separate opt-in toggle — it's one action.
- **Surface this in the diff:** the diff shows a **before → after per field across both columns** (SF field + default value), with the overwrite callout. Header/CTA content must be explicit, e.g. *"Copy Salesforce mappings and default values from Direct offer."* Copying default values means intentional divergences (e.g. CPPO `Offer name`) will appear as "will overwrite" — that's desired; the user sees and decides.
- **Direction:** **Pull only.** Affordance lives in the **footer of the destination form**: `Copy from…` → pick source → preview diff → Apply.
- **Scope to active account only.** Cross-account copy is out of scope for now (higher risk — only safe if accounts share a Salesforce schema; would need validation-on-paste). Revisit after cross-account research.
- **Naming:** **"Copy from / Copy to"** (not "Clone").
- **Surface:** the copy preview/diff opens in a **right-side drawer** (`RightPanelLayout` / elevation `500R`), not a centered modal. Header = "Copy from {source}"; a warning `Alert` summarizes the overwrite count; each field shows mapping + default before→after (struck-through old value) with an "Overwrites" tag on conflicts. Implemented in Version 3.

---

## Listings tab (listing-unique fields)

**Model (decided 2026-07-28):**
- The Listings tab lists **all registration and additional fields** in their own child sections (Registration fields, Additional fields).
- **Every row shows its listing membership.** A `Common` badge (with tooltip listing the specific listings) **emphasizes** when a field applies to >1 listing; single-listing fields still show which listing they belong to.
- **Fields shared across listings auto-share one mapping** — a recurring field (e.g. "Business Address" on 8 listings) is **one shared row, mapped once**, applied to every listing that has it. This avoids mapping the same field N times.
  - **Both the Salesforce mapping AND the default value are shared** across all listings that have the field (not just the mapping). Assumption to validate with PM; adjust if a default legitimately differs per listing.
- **No per-listing override in v1.** If a listing ever needs a different mapping for a shared field, v1 can't express it (accepted under the "same everywhere" assumption).
- **Remove the V1 propagation checkbox** ("Apply this Salesforce mapping to X other listings"). Propagation is now *structural* (one shared row), so the checkbox is redundant. The `Common` badge + tooltip remain but are **informational only**, not an action.

**Sharing philosophy — intentional asymmetry (articulate for PM):**
- **Offer type (Direct/Partner):** separate documents → **explicit, on-demand copy** (divergence is common, e.g. CPPO).
- **Listings:** a listing field is **one logical field** → **auto-shared** across the listings that have it.

**Needed from mock field data before building:**
1. A **shared identity/key** for fields that are "the same" across listings (match on identity, not just label text) so they collapse into one shared row.
2. Per field: **section** (Registration vs Additional), **type**, and the **shared default value** (one default per field).

---

## Usage dimensions — scalable model (Pattern B) [V3]

**Problem:** A listing can have many usage dimensions (e.g. `add_charge`, `api_overage`). On the private offer form it's the **fee amount** that gets mapped and assigned to the correct dimension. We need this to scale to any number of dimensions without adding a field/row per dimension.

**Decision:** Use a **child object + match key** model (not field-per-dimension):
- Map the **Salesforce object for usage pricing** once (child/line-item object).
- Map a **Dimension identifier (match key)** — the SF field whose value equals the dimension's SKU name (e.g. `add_charge`). Tackle uses it to route each line item's fee to the right dimension.
- Map the **Fee amount**.
- One rule fans out across every dimension on every listing. Consistent with how **contract dimensions** are modeled.

**Placement:** Stays in the **Direct / Partner** tabs, inside the **Product & pricing** section (usage pricing is offer-level pricing, not a Tackle/listing-only field).

**Mock usage dimensions** on the listing catalog (kept for realism / future use in the existing "Preview your mapping" feature — no inline preview in the mapper form):
- `add_charge`: Hooli Premium, Standard API, Enterprise
- `api_overage`: Hooli Premium, Standard API
- `data_egress`: Hooli Enterprise
- Hooli Basic: none (contract-only)

**Note:** No inline "resolves to N dimensions" preview in the mapping form — the field mapper already has a dedicated **"Preview your mapping"** feature, and all previews live there.

**Note:** V1 (`HomePage.tsx`) still uses the older per-dimension rows (Dimension / Description / Fee) — left as-is for comparison; only V3 uses Pattern B.

---

## Parent-scoped child field mappings [V3]

**Rule:** When a field group has a **parent object mapping** (e.g. "Salesforce object for buyer contact", "…for contract dimensions", "…for payment schedule", "…for usage pricing"), every **child field** underneath it is scoped to that object. The child's field options all start with the object's leaf name, e.g. selecting `Opportunity > Quote > QuoteLineItems` makes the child options read `QuoteLineItems > SKU`, `QuoteLineItems > Fee Amount`, etc.

**Groups this applies to:**
- Buyer contact (`buyer_contact_obj` → `OpportunityContactRoles`): Full name, Email, Title
- Contract dimensions (`contract_dimension_obj` → `QuoteLineItems`): Dimension, API name, Quantity, Price per unit
- Payment schedule (`payment_schedule_obj` → `QuoteLineItems`): Invoice date, Payment amount
- Usage dimensions (`usage_pricing_obj` → `QuoteLineItems`): Dimension identifier, Fee amount

**Behavior:** If the parent object isn't selected yet, the child combos are **disabled** with placeholder "Select the object above first". Child option lists come from `CHILD_FIELDS_BY_OBJECT` keyed by object leaf.

---

## Page-wrapper padding convention (applies to all versions going forward)

`ApplicationShell`'s `.pageContent` region already applies **32px** padding on all sides. So a page's own top-level wrapper must **NOT** re-add top padding, or the gap above the page header doubles to 64px.

**Convention:** page wrapper uses `padding: '0 32px 32px 32px'` (top = 0, sides/bottom = 32px). This yields a **32px gap above the "Account settings" header**.

- Applied in **V3** (both the field-mapper and placeholder-tab return branches).
- **V1 / V2 intentionally left as-is** (still double-padded) — not worth churning.
- **Any future version must follow the V3 convention** so its top padding matches.
