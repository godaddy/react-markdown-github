# `react-markdown-github`

- [#5] **BREAKING** Change `resolver` prop to `transformLinkUri` to be consistent with `react-markdown`
- Create prop pass-through to provide props to `react-markdown`

### 2.0.0

- [#2] **BREAKING** Handle hash URLs, provide both `{ filename, filepath }`.
   - `filename` is now `filepath` in `resolver` 
- [#3] **BREAKING** Use `*Uri` and `uri` consistently to match the props
  exposed by `react-markdown`.
   - `sourceUrl` is now `sourceUri`.
   - `transformImageUri` now accepts `({ uri, github, org, repo, filename })`
   - `resolver` now accepts `({ uri, github, org, repo, filename, filepath })`

### 1.0.1

- [#1] Better support for non-text children to header nodes.

### 1.0.0

- Initial release

[#2]: https://github.com/godaddy/react-markdown-github/pull/2
[#3]: https://github.com/godaddy/react-markdown-github/pull/3
[#5]: https://github.com/godaddy/react-markdown-github/pull/5
