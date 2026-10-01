# Physical Sampler

Tune motion and interface details in the product you are building. Ask your coding agent to add controls, adjust them in the running page, then give chosen values back to the agent to save in code.

## Install in your project

The reusable React package lives in `packages/physical-sampler`. Mount a single `SamplerRoot` alongside your application and use `usePhysicalSampler` in the components you want to tune. No provider, separate workspace server, Vite plugin or MCP is required for basic controls.

npm publication is pending. Install from a local checkout today:

```sh
npm install /absolute/path/to/Physical-Sampler/packages/physical-sampler
```

See the [installation guide](./packages/physical-sampler/README.md) for manual setup and a copyable coding-agent brief. First-time source integration is required in each project; an agent can do it for the user.

After installing the package, install its Skill once with `npx --no-install physical-sampler install-skill --agent codex --global`. Targets `claude`, `cursor`, and `copilot` are also available; see the installation guide. Start a new agent session, then say **“用 Physical Sampler 给这个组件加实时调参面板”** or invoke `$physical-sampler`. The Skill handles the integration workflow; project dependencies remain project-local. Video motion analysis is not implemented yet.

## Try this repository

Use Node.js compatible with Vite 8 (20.19+ or 22.12+):

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5174 for the in-project demo (`/playground` is an alias). Click Physical Sampler, or press Alt+Shift+P. Tune the card or button, replay, copy chosen values for your agent, and close the panel when finished. The UI is hidden in production by default.

The secondary motion workspace is at `/studio`. It supports local video playback, Bounce/Swing/Reveal models, live preview, browser-local saves and standalone React code export. Automatic video recognition is not connected. Video metadata and authored design controls are distinct from recovered physics.

## Optional file-backed integration

For direct writes to project configuration and optional MCP tools, use the advanced [integration guide](./INTEGRATION.md). This remains available separately from the inline-controls flow. Machine-specific editor configurations should be regenerated locally and are ignored by Git.

## Development

```sh
node --test tests/*.test.mjs
npm run build
```

- `packages/physical-sampler/inline.jsx`: sibling root, component-defined hooks and panel.
- `packages/physical-sampler/controls.js`: shared control registration and live values.
- `src/SamplerDemo.jsx`: in-project installation and usage example.
- `src/studio`: secondary motion workspace.

Reference-video studies are not part of the reusable package or the main product navigation.
