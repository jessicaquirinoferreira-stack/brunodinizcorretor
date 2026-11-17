// Phase 0 Security Rules Verification Spec (Run against Firebase Emulator Suite)
// Verifies the Dirty Dozen payloads return PERMISSION_DENIED.

export const DIRTY_DOZEN_CASES = [
  { id: 1, name: 'Unauthenticated read on /leads', collection: 'leads', op: 'list', expected: 'PERMISSION_DENIED' },
  { id: 2, name: 'Unauthenticated unfiltered list on /properties', collection: 'properties', op: 'list_unfiltered', expected: 'PERMISSION_DENIED' },
  { id: 3, name: 'Shadow field injection on /leads create', collection: 'leads', op: 'create', payload: { name: 'Tester', phone: '81999999999', source: 'home', score: 'morno', status: 'novo_lead', lgpdConsent: true, isAdmin: true }, expected: 'PERMISSION_DENIED' },
  { id: 4, name: 'Stage shortcutting on /leads create', collection: 'leads', op: 'create', payload: { name: 'Tester', phone: '81999999999', source: 'home', score: 'quente', status: 'fechado', lgpdConsent: true }, expected: 'PERMISSION_DENIED' },
  { id: 5, name: 'Forged timestamp on /leads create', collection: 'leads', op: 'create', payload: { name: 'Tester', phone: '81999999999', source: 'home', score: 'frio', status: 'novo_lead', lgpdConsent: true, createdAt: '2020-01-01T00:00:00Z' }, expected: 'PERMISSION_DENIED' },
  { id: 6, name: 'Oversized message (>2000 chars) on /leads create', collection: 'leads', op: 'create', payload: { name: 'Tester', phone: '81999999999', source: 'home', score: 'frio', status: 'novo_lead', lgpdConsent: true, message: 'a'.repeat(2500) }, expected: 'PERMISSION_DENIED' },
  { id: 7, name: 'Pre-confirmed visit on /visits create', collection: 'visits', op: 'create', payload: { clientName: 'Tester', clientPhone: '81999999999', scheduledDate: '2026-12-01', status: 'confirmada' }, expected: 'PERMISSION_DENIED' },
  { id: 8, name: 'Unverified email spoofing write on /properties', collection: 'properties', op: 'create', auth: { email: 'jonasweb2rj@gmail.com', email_verified: false }, expected: 'PERMISSION_DENIED' },
  { id: 9, name: 'Privilege escalation write on /adminUsers', collection: 'adminUsers', op: 'create', auth: { uid: 'attacker', email_verified: true }, expected: 'PERMISSION_DENIED' },
  { id: 10, name: 'Non-admin update on /leads', collection: 'leads', op: 'update', expected: 'PERMISSION_DENIED' },
  { id: 11, name: 'Unauthenticated write on /siteSettings/default', collection: 'siteSettings', op: 'update', expected: 'PERMISSION_DENIED' },
  { id: 12, name: 'Invalid analytics eventType', collection: 'analytics', op: 'create', payload: { eventType: 'sql_injection', path: '/' }, expected: 'PERMISSION_DENIED' }
];
