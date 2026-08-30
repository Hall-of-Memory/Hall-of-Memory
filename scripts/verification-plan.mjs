export const verificationClasses = Object.freeze({
  INVARIANT: 'INVARIANT',
  DESIGN_SENSITIVE: 'DESIGN-SENSITIVE',
  EVIDENCE: 'EVIDENCE',
});

const invariant = verificationClasses.INVARIANT;
const designSensitive = verificationClasses.DESIGN_SENSITIVE;
const evidence = verificationClasses.EVIDENCE;

export const verificationPlan = Object.freeze({
  preflight: Object.freeze([
    Object.freeze({
      id: 'install-state-contract',
      script: 'test:install-state',
      failureCode: 'VERIFY-PREFLIGHT-INSTALL-CONTRACT',
      classes: Object.freeze([invariant]),
    }),
    Object.freeze({
      id: 'installed-dependencies',
      script: 'check:install-state',
      failureCode: 'VERIFY-PREFLIGHT-INSTALLED-DEPS',
      classes: Object.freeze([invariant]),
    }),
  ]),
  checks: Object.freeze([
    Object.freeze({ id: 'verification-runner', script: 'test:verification-runner', failureCode: 'VERIFY-INVARIANT-RUNNER', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'inquiry-contract', script: 'test:inquiry-contract', failureCode: 'VERIFY-INVARIANT-INQUIRY-CONTRACT', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'inquiry-migrations', script: 'test:inquiry-migrations', failureCode: 'VERIFY-INVARIANT-INQUIRY-MIGRATIONS', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'inquiry-spike', script: 'spike:inquiry', failureCode: 'VERIFY-INVARIANT-INQUIRY-SPIKE', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'admin-privacy', script: 'test:admin-privacy', failureCode: 'VERIFY-INVARIANT-ADMIN-PRIVACY', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'dns-cutover', script: 'test:dns-cutover', failureCode: 'VERIFY-INVARIANT-DNS-CUTOVER', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'domain', script: 'test:domain', failureCode: 'VERIFY-INVARIANT-DOMAIN', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'gallery-access', script: 'test:gallery-access', failureCode: 'VERIFY-INVARIANT-GALLERY-ACCESS', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'inquiry-form', script: 'test:form', failureCode: 'VERIFY-INVARIANT-INQUIRY-FORM', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'release-safety', script: 'test:release-safety', failureCode: 'VERIFY-INVARIANT-RELEASE-SAFETY', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'quality', script: 'test:quality', failureCode: 'VERIFY-MIXED-QUALITY', classes: Object.freeze([invariant, designSensitive]) }),
    Object.freeze({ id: 'sales-demo', script: 'test:demo', failureCode: 'VERIFY-MIXED-SALES-DEMO', classes: Object.freeze([invariant, designSensitive]) }),
    Object.freeze({ id: 'visual-startup', script: 'test:visual-startup', failureCode: 'VERIFY-INVARIANT-VISUAL-STARTUP', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'visual-regression', script: 'test:visual', failureCode: 'VERIFY-MIXED-VISUAL', classes: Object.freeze([invariant, designSensitive, evidence]) }),
    Object.freeze({ id: 'fundus-corner', script: 'test:fundus-corner', failureCode: 'VERIFY-MIXED-FUNDUS-CORNER', classes: Object.freeze([invariant, designSensitive]) }),
    Object.freeze({ id: 'preview-base', script: 'test:preview-base', failureCode: 'VERIFY-EVIDENCE-PREVIEW-BASE', classes: Object.freeze([invariant, evidence]) }),
    Object.freeze({ id: 'pages-artifact', script: 'test:pages-artifact', failureCode: 'VERIFY-EVIDENCE-PAGES-ARTIFACT', classes: Object.freeze([invariant, evidence]) }),
    Object.freeze({ id: 'astro-check', script: 'check', failureCode: 'VERIFY-INVARIANT-ASTRO-CHECK', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'verification-build', script: 'build:verification', failureCode: 'VERIFY-INVARIANT-BUILD', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'worker-dry-run', script: 'dry-run:worker', failureCode: 'VERIFY-INVARIANT-WORKER-DRY-RUN', classes: Object.freeze([invariant]) }),
    Object.freeze({ id: 'site-dry-run', script: 'dry-run:site', failureCode: 'VERIFY-INVARIANT-SITE-DRY-RUN', classes: Object.freeze([invariant]), dependsOn: Object.freeze(['verification-build']) }),
  ]),
});

export const allVerificationItems = (plan = verificationPlan) => [
  ...plan.preflight,
  ...plan.checks,
];
