---
name: Safe invoice schema migrations
description: Reliable migration ordering and verification for invoice-related database changes.
---

For invoice-related migrations, run after the base invoice schema exists, verify whether each column exists before adding it, and surface migration failures. If an alter fails, only treat it as a harmless concurrent change after confirming the column now exists.

**Why:** A swallowed column-migration error left public quote lookups querying fields that the live database did not have.

**How to apply:** When adding columns used by invoice, quote, receipt, or credit-note routes, check `INFORMATION_SCHEMA`, keep migration ordering explicit, and verify the resulting route against the actual database.
