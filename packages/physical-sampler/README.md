# Physical Sampler

Adjust registered React components in the page where they live. Preview parameter changes, replay interactions, and apply values to your project's configuration.

For local React + Vite development. No separate workspace server or Motion dependency is required. Components must bind their controls to actual styles or animation code.

## Installation

This package is not published yet. The intended installation command after publication is:

```sh
npm install --save-dev physical-sampler
```

The public package name is provisional; availability must be checked before publishing. For now, install a local checkout instead:

```sh
npm install --save-dev /absolute/path/to/Physical-Sampler/packages/physical-sampler
```

## Or ask your coding agent

Copy this brief into your coding agent after installing the package:

> Set up Physical Sampler in this React + Vite project. Add physicalSampler from physical-sampler/vite to the existing Vite plugins. Create physical-sampler.config.json with a version 1 schema for one existing component and controls that are actually bound to its styles or animation. Import SamplerProvider and useSampler from physical-sampler, wrap the application in SamplerProvider with that configuration, and use useSampler in the chosen component. Attach the hook's attributes to its DOM element. Preserve existing project behavior and scripts. Styles load automatically. Start the project's existing development command, verify the panel connects and that controls preview the component, and explain where to open the panel. Before a production release, use the saved configuration directly and remove development panel imports. MCP setup is optional; configure it only if requested.

Installing dependencies and integrating source are separate steps. The CLI does not automatically edit React or Vite files.

## Manual setup

1. Add the development bridge to your existing Vite configuration, keeping other plugins:

```js
import {defineConfig} from 'vite';
import {physicalSampler} from 'physical-sampler/vite';

export default defineConfig({
  plugins: [/* your existing plugins, */ physicalSampler()],
});
```

2. Create `physical-sampler.config.json` in the Vite project root:

```json
{
  "version": 1,
  "components": [{
    "id": "card",
    "label": "Card",
    "parameters": [{
      "id": "radius",
      "label": "Corner radius",
      "type": "number",
      "value": 18,
      "min": 0,
      "max": 48,
      "step": 1,
      "unit": "px"
    }]
  }]
}
```

3. Wrap your application and bind the component. Adjust the configuration import to your file's location:

```jsx
import {SamplerProvider, useSampler} from 'physical-sampler';
import config from '../physical-sampler.config.json';

function Card() {
  const {values, attributes} = useSampler('card');
  return (
    <article {...attributes} style={{borderRadius: values.radius, padding: 24, background: '#d0ec5c'}}>
      Make room for curiosity.
    </article>
  );
}

export default function App() {
  return <SamplerProvider config={config}><Card /></SamplerProvider>;
}
```

Styles are imported automatically. `physical-sampler/styles.css` is also available as an explicit CSS entry. The provider owns the panel and must wrap hook consumers; a sibling root component is not supported.

4. Start your project's usual Vite development command. Open **Physical Sampler** at the bottom right or press **Alt+Shift+P**. Use **Select on page**, adjust the registered component, then **Apply to project** to save configuration. **Discard** removes drafts; **Undo last apply** restores the most recent applied values during the current browser session.

For animation controls, bind `values` to your animation implementation and use the hook's `replay` counter to trigger replay. Adding a schema field alone does not implement behavior.

## Optional coding-agent connection

After installing locally, run this from the project root:

```sh
npx --no-install physical-sampler init .
```

This creates an empty configuration only when one does not exist, and adds project-local MCP settings for Cursor, Claude Code and VS Code Copilot without replacing existing server entries. Enable the server in your editor. Keep Vite running separately for the live page. Generated settings use this machine's paths; regenerate them when moving machines and remove stale Physical Sampler entries first, since existing entries are preserved.

Tools: `sampler_inspect`, `sampler_set_parameters`, and `sampler_register_component`. MCP is optional for the browser panel. It writes structured configuration, not arbitrary source code.

## Current scope

- Registered components only; supports number, boolean, select and color parameters.
- Apply persists `physical-sampler.config.json`; external edits are detected through revisions.
- Local, single-user development. The Vite bridge accepts localhost connections.
- Production: consume saved values directly and omit the provider, hooks and panel imports. An automatic production adapter is not implemented.
- No automatic DOM/video recognition, hosted project editing, or agent-generated behavior execution.
- Reference-video studies and the standalone workspace are not included in this package.
