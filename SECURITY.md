# Security policy

MOVERA treats the public website, CMS, API, content database, cache, uploaded
media, integrations, and deployment configuration as one application security
boundary. This policy explains supported code, private vulnerability reporting,
and the minimum controls expected for deployment.

## Supported versions

| Version | Supported |
| --- | --- |
| Latest commit on `main` | Yes |
| Feature branches and unmerged pull requests | No |
| Historical commits and locally modified deployments | No |

Security fixes are applied to `main` and must pass the relevant build, test,
runtime, and deployment checks before promotion.

## Report a vulnerability privately

Email **samy.magdy@live.com** with the subject:

```text
MOVERA security report: <short description>
```

Include, where available:

- the affected application, route, API endpoint, commit, image, or dependency;
- the security impact and realistic attack conditions;
- concise reproduction steps or a minimal proof of concept;
- required authentication, role, origin, or network conditions;
- redacted request, response, screenshot, or log evidence; and
- whether the issue is public, actively exploited, or reported elsewhere.

Do not include live passwords, access tokens, private keys, database dumps,
personal data, or unredacted environment files. Describe a safe transfer method
first if sensitive evidence is essential.

Do not open a public GitHub issue or pull request for an unpatched vulnerability.
Test only systems you are authorized to test, minimize data access, avoid
destructive actions, and stop after demonstrating impact.

The maintainer will aim to acknowledge a complete report within two business
days. Remediation and disclosure timing depend on severity, exploitability,
affected deployments, and upstream fixes.

## In scope

Security reports are welcome for the maintained MOVERA application, including:

- authentication, session, authorization, RBAC, or privilege-escalation flaws;
- cross-site scripting, CSRF, injection, SSRF, request smuggling, path traversal,
  unsafe redirects, cache poisoning, or sensitive response disclosure;
- host, origin, proxy, or rewrite validation failures;
- public access to private media, CVs, uploads, database data, or CMS functions;
- unsafe file upload handling or storage path confusion;
- hard-coded secrets, credential exposure, or insecure secret handling;
- exploitable denial of service in application-controlled paths;
- security-relevant dependency vulnerabilities reachable in the supported
  runtime; and
- deployment instructions or defaults that create an unintended public or
  administrative boundary.

Reports should identify whether behavior is local-only, development-specific,
or relevant to a deployed environment.

## Normally out of scope

The following generally require additional security impact:

- version disclosure without an exploitable condition;
- advisories for packages absent from the committed lockfile or unreachable in
  the supported runtime;
- missing headers on a local server when an approved production reverse proxy
  supplies them;
- denial of service against a deliberately exposed development environment;
- administrator actions that intentionally mount arbitrary host paths or reveal
  secrets; and
- content accuracy, visual design, or intended editor permissions.

Out-of-scope reports may still be recorded as hardening opportunities.

## Security architecture

The repository implements these application controls:

- separate public and administrative Next.js applications;
- API-enforced authentication, role checks, validation, rate limits, and origin
  restrictions;
- secure session handling for CMS access;
- PostgreSQL as the source of truth and Redis as a bounded public-content cache;
- separate public upload and private CV storage paths;
- encrypted integration secrets using `INTEGRATION_SECRET_KEY`;
- server-side reCAPTCHA verification when configured;
- audit history and recoverable Trash for administrative content operations;
- non-root runtime users for the public and CMS containers; and
- locked dependencies plus production build and browser verification workflows.

These controls reduce risk but do not make a deployment secure by themselves.

## Production deployment requirements

The checked-in Compose defaults are for development. Before internet exposure:

1. place public services behind an approved TLS reverse proxy;
2. restrict the CMS by network, identity, and role where practical;
3. do not publish PostgreSQL or Redis ports publicly;
4. set exact `WEB_ORIGIN`, `ADMIN_ORIGIN`, site, API, and CMS URLs;
5. generate a unique high-entropy `INTEGRATION_SECRET_KEY`;
6. use a unique one-time administrator bootstrap password and rotate it after
   first use;
7. configure reCAPTCHA for public forms where required;
8. store SMTP, newsletter, identity, and other integration secrets outside the
   repository;
9. configure encrypted backups and test restoration;
10. monitor container health, authentication events, logs, storage, and disk
    capacity; and
11. rebuild and redeploy images after security-relevant dependency changes.

Never deploy `.env.example` values unchanged.

## Dependency vulnerability handling

Do not run `npm audit fix --force` without reviewing the resulting dependency and
framework changes. Use this process instead:

1. identify the advisory, package path, runtime reachability, and fixed version;
2. confirm compatibility with supported Node.js and framework versions;
3. update `package.json` and `package-lock.json` together;
4. run `npm ci` from a clean dependency state;
5. run `npm audit` and `npm audit --omit=dev`;
6. run TypeScript, production builds, media checks, and relevant browser/API
   tests;
7. rebuild and verify the affected containers; and
8. document temporary mitigations when an upstream fix is unavailable.

## Maintainer safety

- Review the staged publication set for secrets before every push.
- Keep development, test, and production data separate.
- Never commit `.env`, raw database dumps, private uploads, CVs, or access tokens.
- Rotate any credential that may have been disclosed.
- Back up data before migrations, content refreshes, or deployment changes.
- Preserve rollback boundaries and verify both the application and unaffected
  workloads after shared-host deployments.

See [the backup and restore guide](docs/backup-restore.md) and
[the Ubuntu deployment guide](docs/deployment-ubuntu-docker.md) for operational
details.
