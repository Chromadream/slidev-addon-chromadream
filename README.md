# slidev-addon-chromadream

A [Slidev](https://sli.dev) addon that gives you two components:

- **`StepCode`** — highlights code words one step at a time on each slide click
- **`two-cols-footer`** — a grid layout with a header, two columns, and a footer

## Install

```bash
pnpm add slidev-addon-chromadream
```

## Setup

Add this to your `slides.md` frontmatter:

```yaml
---
addons:
  - slidev-addon-chromadream
---
```

---

## `StepCode`

Shows a code block with syntax highlighting. Specific words become highlighted as you click through the slide.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | required | The code to show |
| `lang` | `string` | `'sh'` | Shiki language identifier (for example `ts`, `bash`, `python`) |
| `steps` | `string[][]` | required | Array of word arrays. Each array is highlighted on a click. |

### Usage

The component uses one click per step automatically. You do not need to set `clicks` in the slide frontmatter.

````md
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

Each click highlights the next set of words. After the last step, the next click advances to the next slide.

If you want an extra step that clears all highlights, add `clicks: N` to the slide frontmatter. Set `N` to `steps.length + 1`. This value overrides the default click count.

The component automatically picks the Shiki theme for the Slidev mode. In light mode it uses `vitesse-light`. In dark mode it uses `vitesse-dark`.

---

## `two-cols-footer` layout

A CSS grid layout with four named areas. It has a full-width header, a two-column body, and a full-width footer.

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
