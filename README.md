# Journeys

[![npm version](https://img.shields.io/npm/v/@journeys/core)](https://www.npmjs.com/package/@journeys/core)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Journeys is a TypeScript library and visual builder for representing
product-editable workflows as plain JSON adjacency lists — no DSL, no `eval`.

Install the core package from npm:

```bash
pnpm add @journeys/core
```

Your app maps runtime state into a workflow context, stores JSON, and calls
`@journeys/core` to validate definitions and evaluate the next node. A visual
builder helps non-developers edit branching rules and export portable JSON.

## Documentation

- [Docs site](https://atinagnihotri.github.io/journeys/) (GitHub Pages from `docs/`)
- [Quickstart](docs/quickstart.md)
- [API reference](docs/api.md)
- [Workflow JSON schema](docs/02-workflow-json-schema.md)
- [Examples](docs/examples.md) — runnable code in [`examples/`](examples/)
- [Release notes](docs/release-notes.md)

## Monorepo

```text
packages/core   — @journeys/core (types, validation, evaluation)
apps/builder    — visual workflow editor
examples/       — integration patterns (vanilla, React, routers, Next.js, edge)
docs/           — public documentation (GitHub Pages)
```

Local development:

```bash
pnpm install
pnpm validate
pnpm --filter builder dev
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Run `pnpm validate` before opening a PR.

## License

Licensed under the [Apache License 2.0](LICENSE).
