# Deployment

Deployment is intentionally disabled. This repository should remain preview/build-only until content, contact details, DNS, and GitHub Pages settings are deliberately completed.

No active `.github/workflows/deploy.yml` is included.

## Local Preview

```sh
npm install
npm run dev
```

## Local Build

```sh
npm run build
npm run preview
```

## Public Readiness

The site defaults to private-preview behavior:

```sh
SITE_PUBLIC_READY=false
```

While not public-ready, pages include `noindex,nofollow`, and `public/robots.txt` disallows crawling.

Before launch, replace placeholder project content and blog content. Then set `SITE_PUBLIC_READY=true` in the deployment environment and update `robots.txt` if you want crawlers allowed.

## Deploy Later With GitHub Pages

When ready:

1. Copy `docs/deploy-github-pages.yml.example` to `.github/workflows/deploy.yml`.
2. Commit the workflow.
3. In GitHub, open repository Settings.
4. Go to Pages.
5. Set Build and deployment source to GitHub Actions.
6. Set the custom domain to `loganmesh.com`.
7. Wait for DNS to resolve, then enable HTTPS.

Do not do these steps until the placeholder content is replaced.

## Spaceship DNS Records

A records for the apex domain:

```text
@ 185.199.108.153
@ 185.199.109.153
@ 185.199.110.153
@ 185.199.111.153
```

Optional AAAA records:

```text
@ 2606:50c0:8000::153
@ 2606:50c0:8001::153
@ 2606:50c0:8002::153
@ 2606:50c0:8003::153
```

CNAME for `www`:

```text
www lmesh91.github.io
```

Keep the existing root `CNAME` file as `loganmesh.com` for GitHub Pages once deployment is intentionally enabled.
