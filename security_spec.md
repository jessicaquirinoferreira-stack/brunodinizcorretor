# Security Specification — Bruno Diniz Imóveis & CRM

## 1. Data Invariants
1. **Default-Deny Catch-All**: Every Firestore path is denied by default (`match /{document=**} { allow read, write: if false; }`).
2. **PII Isolation**: Collections containing client PII (`leads`, `clients`, `clients/*/interactions`, `pipeline`, `visits`, `proposals`, `tasks`, `adminUsers`, `analytics`) are strictly readable, updatable, and deletable ONLY by verified admins (`isAdmin()`).
3. **Public Read Surface**: Only published catalog items (`properties` where `published == true`, `empreendimentos` where `published == true`, `landingPages` where `published == true`) and public institutional config (`siteSettings/default`, `professionalProfile/bruno-diniz`) are readable by public visitors. Draft or unpublished records are strictly readable only by `isAdmin()`.
4. **Public Lead & Visit Submission Gate**: Anonymous site visitors can `create` documents in `leads`, `visits`, and `analytics` ONLY when:
   - Document ID passes `isValidId()` (`^[a-zA-Z0-9_-]+$`, `<= 128` chars).
   - Strict schema validation (`hasOnly` + `hasAll` + type & `.size()` bounds) passes.
   - Initial state is locked (`leads.status == 'novo_lead'`, `visits.status == 'solicitada'`).
   - Temporal integrity is enforced (`createdAt == request.time`).
5. **Privilege Escalation Prevention**: No client can self-assign `adminUsers/{uid}`. Only verified admins (`isAdmin()`) can manage `adminUsers`.
6. **Email Spoofing Guard**: Any email-based admin check requires `request.auth.token.email_verified == true`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. Unauthenticated `get` or `list` on `/leads`, `/clients`, `/pipeline`, `/proposals`, `/tasks`, `/adminUsers`, or `/analytics` -> `PERMISSION_DENIED`.
2. Unauthenticated `list` on `/properties` without filtering `published == true` (attempting to read draft properties) -> `PERMISSION_DENIED`.
3. Public lead creation attempting to inject a shadow field (`isAdmin: true`, `ghostField: "x"`) -> `PERMISSION_DENIED`.
4. Public lead creation attempting to skip pipeline stages (`status: "fechado"` instead of `"novo_lead"`) -> `PERMISSION_DENIED`.
5. Public lead creation with forged `createdAt` timestamp (`new Date(0)` instead of `serverTimestamp()`) -> `PERMISSION_DENIED`.
6. Public lead creation with oversized `message` (> 2000 chars) or oversized document ID (> 128 chars) -> `PERMISSION_DENIED`.
7. Public visit creation attempting to pre-confirm visit (`status: "confirmada"` instead of `"solicitada"`) -> `PERMISSION_DENIED`.
8. Unverified email spoofing attempt (`email: "jonasweb2rj@gmail.com"`, `email_verified: false`) writing to `/properties` -> `PERMISSION_DENIED`.
9. Non-admin authenticated user attempting to write `/adminUsers/{uid}` to escalate privileges -> `PERMISSION_DENIED`.
10. Non-admin authenticated user attempting to update or delete an existing `/leads/{leadId}` -> `PERMISSION_DENIED`.
11. Unauthenticated user attempting to write `/siteSettings/default` or `/professionalProfile/bruno-diniz` -> `PERMISSION_DENIED`.
12. Public analytics event creation with invalid `eventType` or missing `path` -> `PERMISSION_DENIED`.
