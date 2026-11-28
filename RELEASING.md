# Releasing

Releases are automated with [release-please](https://github.com/googleapis/release-please) and published to npm with [trusted publishing](https://docs.npmjs.com/trusted-publishers).

## Flow

1. Work lands on `develop`, the repository's default branch, through pull requests using [Conventional Commits](https://www.conventionalcommits.org).
2. When ready to release, merge `develop` into `master` (merge commit).
3. On every push to `master`, release-please opens or updates a **release PR** against `master` (set with `target-branch` in `release.yml`) with the version bump and `CHANGELOG.md` entry.
4. Merging the release PR tags the release (`vX.Y.Z`), creates a GitHub Release, and triggers the `publish` job, which tests, builds, and runs `npm publish --provenance`.
   - Prereleases (versions containing `-`, e.g. `2.0.0-beta.1`) are published under the `next` dist-tag; stable versions under `latest`.
5. Merge `master` back into `develop` (merge commit) so the version bump and changelog are on `develop` too.

## 2.0 prerelease series

`release-please-config.json` currently sets `"release-as": "2.0.0-beta.1"` with prerelease versioning:

- After `2.0.0-beta.1` is released, **remove `release-as`**; following releases bump to `2.0.0-beta.2`, and so on.
- For the stable release, set `"release-as": "2.0.0"`, remove `"prerelease"`, `"versioning"` and `"prerelease-type"`, release, then remove `release-as` again.

## One-time setup

- **npm**: on npmjs.com → package `html-to-docx` → Settings → Trusted Publisher, add GitHub Actions with repository `privateOmega/html-to-docx`, workflow `release.yml`, environment `npm`.
- **GitHub**: Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests" must be enabled (needed for the release PR).
