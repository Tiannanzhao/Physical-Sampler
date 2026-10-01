# Physical Sampler

Live controls for tuning motion and interface details inside the app you are building. Install in each project, mount one root, bind controls in a component, and use the project's existing development server.

## Installation

Not published to npm yet. After publication, the intended command is:

```sh
npm install physical-sampler
```

The public package name is provisional. For now, install the package from a local checkout:

```sh
npm install /absolute/path/to/Physical-Sampler/packages/physical-sampler
```

React and React DOM 18+ are required. The basic panel does not require Motion, a Vite plugin, an MCP server or a separate workspace. Keep using your project's animation library. This prototype ships JSX sources; use a JSX-capable bundler. React + Vite is the verified setup; other bundlers have not been tested.

## Or ask your coding agent

For Codex, install the bundled Skill once after installing this package:

```sh
npx --no-install physical-sampler install-skill --global
```

It installs into `$CODEX_HOME/skills/physical-sampler` (or `~/.codex/skills/physical-sampler`) and records the local package source for first-time integration in other projects. Existing skills are preserved. Open a new Codex session to load it, then use a short request:

> Use Physical Sampler to tune this component.

Or explicitly invoke `$physical-sampler`. To limit discovery to the current project instead, run `npx --no-install physical-sampler install-skill`, which installs under `.agents/skills/physical-sampler`.

The Skill teaches the agent how to install the package when needed, mount the root, bind useful controls, verify the page, and apply copied values. It is not an automatically running service. Each project still needs its own dependency and first-time integration. This installer targets Codex; other agents can read the brief below or adapt the bundled Skill to their own discovery conventions. Moving the package requires updating the installed source hint or reinstalling the Skill after removing the old copy.

Without the Skill, use the full brief below.

Copy this brief to your coding agent (replace the install path with your local checkout until npm publication):

> Install Physical Sampler in this React project using its existing package manager. Import SamplerRoot and usePhysicalSampler from physical-sampler. Mount one SamplerRoot as a sibling alongside the application, not as a wrapper. Styles load automatically. In the component I want to tune, call usePhysicalSampler with a stable ID and a small set of controls based on its existing values. Bind the returned values to actual styles or animation properties, and spread attributes on the component's DOM element. Use the replay counter to restart an animation when useful. Preserve existing behavior. Start the project's usual development command and verify that the panel opens and closes and controls update the component. After I share copied Physical Sampler values, apply them to the corresponding control defaults or production code and verify the result. No Vite plugin or MCP setup is required for this basic flow.

## Manual setup

Mount one root and define controls where they are used:

```jsx
import React from 'react';
import {SamplerRoot, usePhysicalSampler} from 'physical-sampler';

function Card() {
  const {values, attributes} = usePhysicalSampler('card', {
    radius: [18, 0, 48],
    color: '#d0ec5c',
  }, {label: 'Card'});

  return (
    <article {...attributes} style={{borderRadius: values.radius, background: values.color, padding: 24}}>
      Make room for curiosity.
    </article>
  );
}

export default function App() {
  return <><Card /><SamplerRoot /></>;
}
```

The root can be mounted alongside your app shell; no provider is needed. In a server-rendered React framework, keep these interactive components in the client boundary. Framework-specific support beyond Vite has not been verified. Styles load automatically; `physical-sampler/styles.css` is also available.

Start your usual development server. Click **Physical Sampler** or press **Alt+Shift+P** to toggle the panel. **Escape** closes it. Use the component selector or **Select on page** to tune a registered component.

## Controls

```js
const {values, replay, attributes} = usePhysicalSampler('card', {
  duration: [650, 100, 2000, 10], // [default, minimum, maximum, step]
  color: '#d0ec5c',
  enabled: true,
  easing: {type: 'select', value: 'ease-out', options: ['linear', 'ease-out']},
  distance: {type: 'number', label: 'Rise distance', value: 40, min: 0, max: 150, step: 1, unit: 'px'},
});
```

Bind `values` to the real implementation. Add `replay` to the dependencies of an animation effect so **Replay** restarts it. Attach `attributes` to the DOM element to enable page selection. A control cannot change unbound properties. Supported types: number, boolean, select and six-digit hex color. Each independently tuned component needs a unique stable ID; matching definitions can share an ID and live values.

## Tune, copy, close

- Sliders update live values immediately.
- **Replay** increments the component's replay counter.
- **Reset** restores the selected component's authored defaults.
- **Copy values for agent** copies chosen values with a short instruction to apply them to the component defaults. It does not edit source files.
- **Download values** exports the selected component's values as JSON.
- Closing the panel preserves live values while the component remains mounted. Reloading or unmounting the last instance restores authored defaults. Copy values before leaving if you want to keep them.

The default `<SamplerRoot />` starts collapsed. Use `<SamplerRoot defaultOpen />` to start open. In Vite production builds the root UI is hidden by default; `productionEnabled` explicitly enables it. Hiding the panel does not remove parameter hooks or animation bindings. Apply your chosen values to code before removing the tool; a hook-free production adapter is not implemented.

## Optional direct project writes and MCP

The original `SamplerProvider` / `useSampler` integration remains available for projects that need direct configuration writes through a localhost Vite bridge. This is a separate advanced integration; see [PROJECT-BRIDGE.md](./PROJECT-BRIDGE.md). MCP tools operate on that file-backed configuration, not the basic inline controls. Do not mix the two control systems for the same component.

## Scope

Physical Sampler controls registered components inside the current project. Installing it does not automatically edit application code, bind arbitrary components, or start another project. A coding agent can perform the first integration. Reference-video studies are excluded from the package. Automatic video recognition and agent-generated animation execution are not implemented.
