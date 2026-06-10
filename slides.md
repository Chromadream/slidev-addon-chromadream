---
addons:
  - ./
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
clicks: 3
---

# StepCode — live demo

<script setup>
const script = `#!/usr/bin/env -S copilot agent \\
  --allow-all \\
  --model claude-sonnet-4.6 \\
  -p /angular-v22-migration`

const steps = [
  ['#!', '/usr/bin/env'],
  ['-S', 'copilot', 'agent'],
  ['--allow-all', '--model', 'claude-sonnet-4.6', '-p', '/angular-v22-migration'],
]
</script>

<StepCode :code="script" :steps="steps" />

<div class="mt-4 text-sm text-gray-500">
  Click to advance → step 1 highlights the shebang, step 2 the CLI invocation, step 3 the flags
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

Add `clicks: N` to the slide frontmatter to enable the click counter (where N = `steps.length`).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | — | The code block content |
| `lang` | `string` | `'sh'` | Shiki language identifier |
| `steps` | `string[][]` | — | Words to highlight per click step |

---
layout: statement
---

That's it.

`pnpm add slidev-addon-chromadream`
