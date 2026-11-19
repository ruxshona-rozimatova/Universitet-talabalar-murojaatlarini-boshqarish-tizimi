# Security Specification & Hardening Audit

## 1. Data Invariants
1. **Identity Integrity**: Every document in `/appeals/{appealId}` and `/settings/{userId}` must contain an `ownerId` matching `request.auth.uid` on creation, and `ownerId` is immutable on update.
2. **Verified Auth**: All read and write operations require an authenticated user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`).
3. **Strict Schema & Size Limits**: Every string field (`studentName`, `group`, `type`, `description`, `status`, `responseNote`, `universityName`, `departmentName`) has strict type, enum, and `.size()` bounds synchronized with `firebase-blueprint.json`.
4. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time` on creation; `createdAt` is immutable on update, and `updatedAt` must equal `request.time` on update.
5. **Terminal State Locking**: Once an appeal's `status` reaches `'Yakunlandi'`, non-admin users cannot alter `status`, `studentName`, `group`, `type`, or `description`. Only an administrator can override or reopen a completed appeal.
6. **Path Hardening & Query Isolation**: Single-document operations validate `isValidId(docId)`. `list` queries on `/appeals` enforce `resource.data.ownerId == request.auth.uid || isAdmin()` without `get()`/`exists()` inside `allow list`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Read/Write**: Read or create `/appeals/a1` when `request.auth == null`.
2. **Unverified Email Spoof**: Write to `/appeals/a1` with `request.auth.token.email == "ruxshonarozimatova0@gmail.com"` and `email_verified: false`.
3. **Identity Spoofing on Create**: Create `/appeals/a2` with `ownerId: "victim-uid"` while authenticated as `"attacker-uid"`.
4. **Shadow Field Injection**: Create `/appeals/a3` containing all valid fields plus an undeclared ghost key `isApproved: true`.
5. **Owner Hijack on Update**: Update `/appeals/a1` changing `ownerId` to another UID.
6. **CreatedAt Tampering**: Create or update `/appeals/a1` with a forged `createdAt` timestamp not equal to `request.time` / `existing().createdAt`.
7. **Resource Exhaustion (1MB String)**: Create `/appeals/a4` with `description` length > 2000 characters.
8. **Invalid Enum Injection**: Create `/appeals/a5` with `status: "Bekor qilindi"` or `type: "Admin"`.
9. **ID Poisoning**: Create `/appeals/invalid$id!@#` violating `^[a-zA-Z0-9_\-]+$`.
10. **Terminal State Bypass**: Non-admin user updates `/appeals/a1` when `existing().status == "Yakunlandi"` to change `status` back to `"Yangi"`.
11. **Cross-Tenant List Scraping**: Non-admin user lists `/appeals` without filtering to `ownerId == request.auth.uid`.
12. **Cross-Tenant Settings Tampering**: Non-admin user reads or writes `/settings/otherUserId`.
