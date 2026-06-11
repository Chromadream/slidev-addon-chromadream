# slidev-addon-chromadream

A [Slidev](https://sli.dev) addon providing two reusable components:

- **`StepCode`** — step-by-step code highlighting that advances on slide clicks
- **`two-cols-footer`** — a grid layout with header, two columns, and a footer

## Install

```bash
pnpm add slidev-addon-chromadream
```

## Setup

Add to the frontmatter of your `slides.md`:

```yaml
---
addons:
  - slidev-addon-chromadream
---
```

---

## `StepCode`

Renders a syntax-highlighted code block where specific words become highlighted as you click through the slide.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | required | The code to display |
| `lang` | `string` | `'sh'` | Shiki language identifier (e.g. `ts`, `bash`, `python`) |
| `steps` | `string[][]` | required | Array of word arrays — each array is highlighted on the corresponding click |

### Usage

Add `clicks: N` to the slide frontmatter. Use `N = steps.length + 1` if you want an extra click to clear all highlights (see note below), then use the component:

````md
---
clicks: 4
---

<script setup>
const code = `#!/usr/bin/env -S copilot agent \
  --allow-all \
  --model claude-sonnet-4.6 \
  -p /my-skill`

const steps = [
  ['#!', '/usr/bin/env'],
  ['-S', 'copilot', 'agent'],
  ['--allow-all', '--model', '-p'],
]
</script>

<StepCode :code="code" :steps="steps" />
````

Clicking past the last step (when `clicks > steps.length`) clears all highlights and reverts to the raw code block. This extra click is a real Slidev click step, so other `v-click` / `v-clicks` elements on the same slide can reference it.

Themes are automatically matched to the Slidev light/dark mode via Shiki's `vitesse-light` / `vitesse-dark`.

---

## `two-cols-footer` layout

A CSS grid layout with four named areas: a full-width header, a two-column body, and a full-width footer.

### Slots

| Slot | Description |
|------|-------------|
| `default` | Header — spans both columns at the top |
| `left` | Left column |
| `right` | Right column |
| `bottom` | Footer — spans both columns at the bottom |

### Props

| Prop | Type | Description |
|------|------|-------------|
| `class` | `string` | CSS classes applied to both column divs |
| `layoutClass` | `string` | CSS classes applied to the container div |

### Usage

````md
---
layout: two-cols-footer
---

# Slide title

::left::
Left content here

::right::
Right content here

::bottom::
Footer content spanning the full width
````

---

## License

MIT
