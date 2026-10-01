# Physical Sampler

Turn motion ideas into editable interface animations, then tune registered components in your own React + Vite project.

## Try the workspace

Install Node.js compatible with Vite 8 (20.19+ or 22.12+), then run:

```sh
git clone https://github.com/Tiannanzhao/Physical-Sampler.git
cd Physical-Sampler
npm install
npm run dev
```

Open http://127.0.0.1:5174 for the workspace, or http://127.0.0.1:5174/playground for the in-project panel demo.

The workspace offers local video playback, Bounce/Swing/Reveal design models, live preview, a timeline, model parameters, browser-local saves and standalone React code export. Uploaded videos stay in the browser. Automatic video motion recognition and agent-generated behavior execution are not implemented. Extension requests are session briefs.

## Install in your own project

The reusable package is in `packages/physical-sampler`. npm publication is pending; the public package name is provisional. From your own React + Vite project, install a local clone:

```sh
npm install --save-dev /absolute/path/to/Physical-Sampler/packages/physical-sampler
```

Follow the [installation guide](./packages/physical-sampler/README.md) for manual setup or copy its coding-agent brief. Add the Vite plugin, configure registered components and wrap the application in SamplerProvider. Start your own project's development server; no separate workspace server is needed for the panel. Installing the package does not automatically edit source.

Use **Physical Sampler** at the bottom right, or **Alt+Shift+P**. Select a registered component, adjust its controls, replay and apply values to `physical-sampler.config.json`. MCP is optional; see [integration details](./INTEGRATION.md).

Reference-video studies and machine-specific editor settings are excluded from this repository snapshot. Generate MCP settings on the computer where the package is installed.

## Development

```sh
node --test tests/sampler.test.mjs
npm run build
```

- `src/studio/models.js`: parameter schemas, sampling and code export.
- `src/studio/Studio.jsx`: workspace and model editing.
- `src/SamplerDemo.jsx`: registered component demonstration.
- `packages/physical-sampler`: reusable panel, Vite bridge, configuration store and MCP CLI.

Production integrations should consume saved configuration values directly and omit development panel imports. A production hook adapter is not implemented.
