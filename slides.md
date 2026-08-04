---
addons:
  - '@/'
title: slidev-addon-chromadream
theme: seriph
background: https://cover.sli.dev
hideInToc: true
transition: slide-left
---

# slidev-addon-chromadream

Two reusable Slidev components — `StepCode` and `two-cols-footer`

---
layout: default
hideInToc: true
---

# Table of Contents

<Toc />

---
src: ./imported-demo.md
hideImportedSlides: true
---

---
src: ./imported-demo-visible.md
---

---

# TOC — hide imported slides

Imported slides are visible in the TOC by default. Opt in per import with `hideImportedSlides: true`.

Slides from `imported-demo.md` are imported with `hideImportedSlides: true`. Beta is hidden from the TOC. Alpha overrides with `hideInToc: false` and stays visible.

Slides from `imported-demo-visible.md` (Imported Slide Charlie & Delta) **appear** in the TOC — they are imported without `hideImportedSlides`.

---

# two-cols-footer layout

A grid layout with a **header**, **two columns**, and a **footer** spanning both.

---
layout: two-cols-footer
---

# This is the header slot (default)

It spans both columns at the top.

::left::

### Left column

Use `::left::` to fill this slot.

- Bullet one
- Bullet two
- Bullet three

::right::

### Right column

Use `::right::` to fill this slot.

```ts
const greeting = 'hello'
console.log(greeting)
```

::bottom::

👇 This is the **bottom** slot — spans the full width. Use `::bottom::` to fill it.

---
layout: default
---

# two-cols-footer — usage

````md
---
layout: two-cols-footer
layoutClass: gap-8       # optional: extra classes on the container
class: text-sm           # optional: applied to both columns
---

# Header (default slot)

::left::
Left content here

::right::
Right content here

::bottom::
Footer content here
````

| Slot | Description |
|------|-------------|
| `default` | Header — spans both columns |
| `left` | Left column body |
| `right` | Right column body |
| `bottom` | Footer — spans both columns |

---

# StepCode component

Highlights specific words in a code block as you click through slides.

Each click advances to the next **step**, highlighting a different set of words.

---

# StepCode — live demo

<script setup>
const script = `#!/usr/bin/env -S copilot agent \
  --allow-all \
  --model claude-sonnet-4.6 \
  -p /angular-v22-migration`

const steps = [
  ['#!', '/usr/bin/env'],
  ['-S', 'copilot', 'agent'],
  ['--allow-all', '--model', 'claude-sonnet-4.6', '-p', '/angular-v22-migration'],
]
</script>

<StepCode :code="script" :steps="steps" />

<div class="mt-4 text-sm text-gray-500">
  Click to advance → step 1 highlights the shebang, step 2 the CLI invocation, step 3 the flags; the next click advances to the following slide
</div>

---
clicks: 4
---

# StepCode — clear-step variant

<script setup>
const clearScript = `#!/usr/bin/env -S copilot agent \
  --allow-all \
  --model claude-sonnet-4.6 \
  -p /angular-v22-migration`

const clearSteps = [
  ['#!', '/usr/bin/env'],
  ['-S', 'copilot', 'agent'],
  ['--allow-all', '--model', 'claude-sonnet-4.6', '-p', '/angular-v22-migration'],
]
</script>

<StepCode :code="clearScript" :steps="clearSteps" />

<div class="mt-4 text-sm text-gray-500">
  Set <code>clicks: steps.length + 1</code> in the frontmatter to override the click count → after the last step, one more click clears every highlight and reverts to the raw code, then the following click advances to the next slide
</div>

---
layout: default
---

# StepCode — usage

````vue
<script setup>
const code = `npm install && npm run build`

const steps = [
  ['npm', 'install'],   // highlighted on click 1
  ['npm', 'run', 'build'], // highlighted on click 2
]
</script>

<StepCode :code="code" :steps="steps" />
````

The component automatically registers one click per step, so you don't need to set
`clicks` in the slide frontmatter — clicking past the last step advances to the next slide.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | — | The code block content |
| `lang` | `string` | `'sh'` | Shiki language identifier |
| `steps` | `string[][]` | — | Words to highlight per click step |

---

# FlipSwitch component

Switches between child panels on click. The flip waits until every `v-click` in the current
child has fired before switching to the next one.

---

# FlipSwitch — live demo

<script setup>
const cli = `#!/usr/bin/env -S copilot agent \\
  --allow-all \\
  --model claude-sonnet-4.6 \\
  -p /angular-v22-migration`

const cliSteps = [
  ['#!', '/usr/bin/env'],
  ['-S', 'copilot', 'agent'],
  ['--allow-all', '--model', 'claude-sonnet-4.6', '-p', '/angular-v22-migration'],
]

const cfg = `{
  "compilerOptions": {
    "strict": true,
    "target": "ES2024",
    "module": "NodeNext"
  }
}`

const cfgSteps = [
  ['"strict"', 'true'],
  ['"target"', '"ES2024"'],
  ['"module"', '"NodeNext"'],
]
</script>

<FlipSwitch>
  <FlipSwitchItem>
    <StepCode :code="cli" :steps="cliSteps" />
  </FlipSwitchItem>
  <FlipSwitchItem>
    <StepCode :code="cfg" lang="json" :steps="cfgSteps" />
  </FlipSwitchItem>
</FlipSwitch>

<div class="mt-4 text-sm text-gray-500">
  Clicks 1–3 highlight the CLI command. Click 4 flips to the JSON config (shown as base code).
  Clicks 5–7 highlight the config words. After click 7 the next click advances.
</div>

---

# FlipSwitch — usage

````md
<FlipSwitch>
  <FlipSwitchItem>
    <v-clicks>
      <li>Point A</li>
      <li>Point B</li>
    </v-clicks>
  </FlipSwitchItem>
  <FlipSwitchItem>
    Another panel — shown after the last click of the first.
  </FlipSwitchItem>
</FlipSwitch>
````

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flip` | `boolean` | `true` | Enable the horizontal card-flip transition |
| `duration` | `number` | `600` | Animation duration in milliseconds |

**How clicks work** — Each `<FlipSwitchItem>` (except the first) adds one click for the
flip. The first item is visible right away. The flip fires after the current item's
last `v-click` and before the next item's content. You do not need to set `clicks`
in the slide frontmatter.

---
layout: statement
---

That's it.

`pnpm add slidev-addon-chromadream`
