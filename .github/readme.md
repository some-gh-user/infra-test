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

## sponsors

## release

```
for every push to `next`,
  - run `pnpm version-packages`
  - if no changes, skip
  - if there's old release PR delete it
  - create a new release PR
    - title: `release: v${version}`
    - body: changelog
    - labels: `release`

for every `release` PR merged:
  - run `pnpm release`
  - github release
  - add comments to fixed issues
```
