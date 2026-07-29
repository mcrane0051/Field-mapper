# PRD Background: Scalable Field Mapper for Private Offers

## Summary

The current field mapper experience does **not include support for unique listing fields**. As a result, users cannot map all of the fields required for private offers when some fields vary by listing, such as **product dimensions**. The goal is to design a **scalable, easy-to-use field mapper experience** that allows ISVs, especially deal desk teams, to map **all fields needed for private offers**, including listing-unique fields.

## Problem Statement

Today’s field mapper supports mapping at a more general/shared level, but it does not support **fields that are unique to a specific product listing**. That creates a gap for private offer workflows where certain fields are not universal across all listings. One example discussed is **product dimensions**. These can vary by listing, but the current field mapper experience has no clear way to represent and map those listing-specific differences. Because of that limitation, ISVs cannot fully configure private offer field mappings in a way that reflects how their listings are actually structured.

## Users

**Primary users:**

-   ISV operations teams
-   Deal desk teams
-   Admin users configuring private offer field mappings  
These users need confidence that every field required to generate a private offer can be mapped correctly, even when listings differ from one another.

---

## Why This Matters

Private offer configuration gets harder as product/catalog complexity grows. The meeting surfaced several scaling problems:

-   Some fields are shared across listings, while others are unique
-   Users should not have to recreate large amounts of configuration for each listing
-   Maintenance becomes difficult when many listings exist
-   Multi-entity and multi-listing setups can multiply configuration burden quickly  
The product needs to support real-world seller complexity without making setup or maintenance unmanageable.

---

## Current Limitation

The important clarification is:

-   This is not just a case where the experience is inefficient
-   The experience **does not currently include listing-unique fields at all**  
That means users are missing the ability to map a complete set of private-offer fields when listing-specific attributes are required.

---

## Example Use Case

A product may have multiple listings. Some mappings apply broadly, but others depend on the specific listing being used. Example:

-   Shared private-offer fields may apply to all listings
-   Certain listing-specific fields, such as **product dimensions**, only apply to one listing or vary across listings
-   The field mapper needs to let users map both the shared fields and the listing-specific ones in a coherent experience  
Without that, users cannot completely configure private offers for all listing scenarios.

---

## Product Goal

Design a field mapper experience that enables ISVs / deal desk teams to:

-   Map **all fields required for private offers**
-   Include both **shared/common fields** and **unique listing fields**
-   Handle listing-specific complexity without creating an unscalable configuration experience
-   Maintain mappings efficiently as the number of listings grows

---

## Design Goals

1.  **Complete coverage**
    -   Users can map every field needed for private offers, including listing-unique fields.
2.  **Scalable structure**
    -   The experience works for products with many listings and does not become unmanageable as complexity grows.
3.  **Ease of use**
    -   The model should be understandable for deal desk / admin users, not just internally logical.
4.  **Low duplication**
    -   Shared mappings should not need to be recreated unnecessarily across listings.
5.  **Clear distinction between shared and unique**
    -   Users should understand which mappings apply broadly and which apply only to a specific listing.

---

## Key Design Tension

The core design problem is balancing two needs:

-   **Completeness:** support listing-unique fields like product dimensions
-   **Scalability:** avoid a model where every listing requires full reconfiguration from scratch  
The ideal solution gives users flexibility without making the mapper too heavy to set up or maintain.

---

## Open Questions

1.  What is the right primary structure: product-first, listing-first, or shared-base-plus-overrides?
2.  How should listing-specific fields be introduced in the UI?
3.  How should shared mappings be reused across listings?
4.  How should users understand which fields are inherited vs unique?
5.  How should the experience scale for multi-entity and future plan-specific complexity?
6.  What is the minimum V1 needed to support private offers end to end?
