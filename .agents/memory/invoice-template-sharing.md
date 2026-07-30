---
name: Invoice template system shared across features
description: How the 8-template invoice design system is shared between Invoices and Recurring Invoices, and field-naming differences between endpoints
---

The 8 invoice templates (Classic, Modern, Bold, Corporate, Elegant, Vibrant, Plain, Custom id=8) and the `InvoicePreview` renderer live in `src/components/InvoiceTemplates.tsx`, extracted from InvoicesPage.tsx so any invoice-like feature (e.g. Recurring Invoices in AutomationsPage.tsx) can reuse the same picker UI and live preview instead of duplicating template code.

Custom template (id 8) is designed once via `InvoiceTemplateDesigner.tsx` (`hasSavedTemplateConfig()`, `getSavedTemplateName()`, `loadTemplateConfig()`) and is shared globally — any form picking template 8 should lock/disable it with a toast until a custom design exists, rather than embedding a mini designer inline.

**Why:** avoids drift between invoice-like features and prevents users from re-designing custom templates per-feature.

**How to apply:** when adding template selection to a new invoice-like form, import from `InvoiceTemplates.tsx` + `InvoiceTemplateDesigner.tsx` rather than recreating the template list/preview. Watch field naming: the invoices API (`server/invoices.ts`) expects camelCase `templateConfig` in the request body, while the recurring/automations API (`server/automations.ts`) expects snake_case `template_config` — check the specific endpoint's field names before wiring a payload.
