First:

- fill the right values in `.github/scripts/params.mjs`
- add `canary.json` to gitignore
- add `NPM_TOKEN` to secrets
- enable PR creation for Actions
  - go to https://github.com/organizations/YOUR_ORG/settings/actions and check Allow GitHub Actions to create and approve pull requests
  - then go to https://github.com/YOUR_ORG/YOUR_REPO/settings/actions and check the box that previously was grayed out

---

## pr-updated

For every new commit in a PR to `next`:

```
- build and test package
- if is release PR
  - show it with pkg.pr.new
- if no new changeset
  - comment with a link to add a changeset
- if new changeset
  - add `changeset` label
  - show it with pkg.pr.new
```

## pr-merged

For every merged PR to `next`:

```
- if has changesets
  - go to fixed issues and add canary comment
```

## prepare-release

```
for every push to `next`,
  - run `pnpm version-packages`
  - if no changes, skip
  - if there's old release PR delete it
  - create a new release PR
    - title: `release: v${version}`
    - body: changelog
    - labels: `release`
```

## release

```
for every `release` pr merged to `next`:
  - run build and  `pnpm release`
  - push tags
  - github release
  - update comments in fixed issues
    - find all `changeset` PRs
    - find related issues
    - update comments
    - remove `changeset` label
```

## sponsors
