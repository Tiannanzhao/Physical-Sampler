# Physical Sampler — local developer integration

This is a working local prototype, not a published npm package or marketplace extension. It has a reusable React panel, Vite development bridge, stdio MCP server, and project-local configurations for Cursor, Claude Code and VS Code Copilot. Actual editor connections still require enabling the server in that editor; no account settings have been changed.

This guide describes the optional file-backed configuration workflow. For the primary DialKit-style flow (sibling root, inline component controls and copy-to-agent), see [the package README](./packages/physical-sampler/README.md). The basic flow requires no Vite bridge or MCP. These MCP tools operate only on file-backed configuration.

## Try this project

Run `npm run dev`, then visit http://127.0.0.1:5174/project-bridge.
Open **Physical Sampler** at the bottom right (or Alt+Shift+P), click **Select on page**, then the card or button. Only registered components are selectable. Controls differ per component. Sliders preview immediately; **Apply to project** writes `physical-sampler.config.json`, which the component consumes. **Discard** drops all local drafts. **Undo last apply** restores the previous applied values during this browser session. External changes trigger a conflict rather than silently overwriting a draft; discard and retry.

These are authored controls, not inferred motion or automatic code understanding. Video analysis is not connected.

## Enable in your coding editor

The installer has generated project-local files:

- Cursor: `.cursor/mcp.json`
- Claude Code: `.mcp.json`
- VS Code Copilot: `.vscode/mcp.json`

Open this project in the editor, enable/trust the Physical Sampler MCP server using that editor's MCP UI, and ask: “Inspect the Physical Sampler components, then change the invitation entrance duration to 800 ms.” The server runs independently of Vite; start Vite separately for live preview. Configurations use this computer's absolute Node and package paths. Rerun the installer after moving the package to another computer. In WSL/remote environments, install and run everything in that environment.

## Use in another React + Vite project

Install the local package (substitute the actual path):

```sh
npm install --save-dev '/absolute/path/to/Physical-Sampler/packages/physical-sampler'
npx --no-install physical-sampler init .
```

The init command merges MCP settings without replacing existing servers or sampler configuration. It does not automatically rewrite your application's source.

Add the plugin to your existing Vite plugins:

```js
import { physicalSampler } from 'physical-sampler/vite';
// plugins: [yourExistingPlugins(), physicalSampler()]
```

Define components and their parameter schemas in `physical-sampler.config.json`. Use the example in this repository as a starting point. Parameter types supported: number, boolean, select and color. Then wrap the development application in `SamplerProvider` and bind each registered component:

```jsx
import { SamplerProvider, useSampler } from 'physical-sampler';
import config from './physical-sampler.config.json';

function Card() {
  const { values, attributes, replay } = useSampler('card');
  // Bind values to actual styles or animation code; replay increments on Replay.
  return <div {...attributes} style={{ borderRadius: values.radius }}>Hello</div>;
}
// <SamplerProvider config={config}><Card /></SamplerProvider>
```

For production, use persisted config values directly and omit the provider/panel and development package imports. The Vite write bridge only runs in development. A production hook adapter/tree-shaken entry point is not implemented yet.

## Agent workflow and MCP tools

1. `sampler_inspect`: read registered components, schemas, values and revision.
2. `sampler_set_parameters`: validate values and persist them; requires the revision from inspection.
3. `sampler_register_component`: register/replace a schema after editing source to actually bind those controls. Registration alone does not create a new animation.

The coding agent uses its existing code tools to implement new behavior, then registers the controls. The MCP server itself does not run an AI model, rewrite arbitrary source, or infer animation from DOM/video. Apply writes only the structured configuration; `source` is descriptive metadata, not a file-write target.

The service speaks newline-delimited JSON-RPC over stdio with MCP protocol 2025-06-18. The browser bridge accepts only local Host headers, same-origin requests and JSON with a custom header for writes. It has no external network or cloud storage dependency. The project config is constrained to a fixed filename, rejects symlinks and validates types/ranges. Concurrent changes are detected by content revision. Single-user local development only.

## Validation

`node --test tests/sampler.test.mjs` checks persistence, stale revisions, invalid/unbound values and the MCP process handshake/tools. `npm run build` checks the bundled demo. Tests of real Cursor, Claude Code and VS Code sessions must still be performed on installed clients.
