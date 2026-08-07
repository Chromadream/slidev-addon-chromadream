# slidev-addon-chromadream

A [Slidev](https://sli.dev) addon with these components:

- **`StepCode`** — highlights code words one step at a time on each slide click
- **`FlipSwitch`** — shows one child panel at a time and flips after each panel's v-clicks finish
- **`two-cols-footer`** — a grid layout with a header, two columns, and a footer
- **silent subtitle** — hides the subtitle on seriph-themed slides. Write `+SBE` beneath the heading.
- **TOC — hide imported slides** — slides imported with `src:` show in the Table of Contents unless you hide them
- **iframe print fallback** — replaces every iframe with a clickable URL link during PDF export
- **markdown link print fallback** — shows each markdown link as `text (url)` during PDF export

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

## `FlipSwitch`

A container that shows one child at a time. Each child lives in a `<FlipSwitchItem>`.
The switch waits until all `v-click` steps in the current child are done. Then it flips
to the next child. Each flip uses one click on its own.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flip` | `boolean` | `true` | Enable or disable the horizontal card-flip animation |
| `duration` | `number` | `600` | Animation time in milliseconds |

### Usage

```md
<FlipSwitch>
  <FlipSwitchItem>
    <v-clicks>
      <li>First item</li>
      <li>Second item</li>
    </v-clicks>
  </FlipSwitchItem>
  <FlipSwitchItem>
    This panel shows after the first panel is done.
  </FlipSwitchItem>
</FlipSwitch>
```

You do not need to set `clicks` in the slide frontmatter. The component counts the
clicks automatically.

---

## `StepCode`

Shows a code block with syntax highlighting. Words become highlighted as you click through the slide.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | required | The code to show |
| `lang` | `string` | `'sh'` | Shiki language identifier (for example `ts`, `bash`, `python`) |
| `steps` | `string[][]` | required | Array of word arrays. Each array is highlighted on a click. |
| `at` | `string \| number` | `1` | Click start position. The default absolute value `1` shares clicks with sibling `<v-clicks>`. Use `"+1"` for a separate sequential range. |
| `scrollable` | `boolean` | `false` | Constrain height and lock vertical scroll until all steps are revealed. Auto-scrolls to keep highlights visible during reveal. |
| `maxHeight` | `string` | auto | CSS max-height for the code block (for example `'400px'`, `'60vh'`). When you do not set this prop and the `scrollable` prop is `true`, the component calculates the value from the slide layout. |

### Usage

The component uses one click per step. You do not need to set `clicks` in the slide frontmatter.

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

By default, `StepCode` shares clicks with sibling `<v-clicks>`. At click 1, the first bullet and the first code step highlight at the same time. No `at` prop is needed on `<v-clicks>`.

After the last step, the next click advances to the next slide.

You can add a clear-step by setting `clicks: N` in the slide frontmatter with `N` equal to `steps.length + 1`. One click after the last step clears all highlights and shows the raw code. The next click then advances.

The component picks the Shiki theme for the Slidev mode. It uses `vitesse-light` in light mode and `vitesse-dark` in dark mode.

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
| `class` | `string` | CSS classes applied to the two columns |
| `layoutClass` | `string` | CSS classes applied to the container |

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
Footer content that spans the full width
````

---

## Silent subtitle

On seriph-themed slides, a subtitle shows below the `# Title` heading. To hide it, put `+SBE` on its own line directly after the heading:

```md
# My Slide Title
+SBE

Regular slide content here...
```

The addon replaces the `+SBE` line with a zero-width space. As a result, the subtitle slot stays hidden.

---

## TOC — hide imported slides

Imported slides are visible in the Table of Contents by default.

To hide slides from a specific import, set `hideImportedSlides: true` on the importing slide:

```md
# slides.md

---
addons:
  - slidev-addon-chromadream
---

# Table of Contents
<Toc />

---
src: ./module-a.md
---

---
src: ./module-b.md
hideImportedSlides: true
---
```

Slides from `module-a.md` appear in the `<Toc />`. Slides from `module-b.md` are hidden because the import slide has `hideImportedSlides: true`.

To show a specific slide (for example the cover of a module), set `hideInToc: false` in that slide's frontmatter:

```md
<!-- module-b.md -->
---
hideInToc: false
---

# Module B

Welcome to module B.
```

## iframe print fallback

During PDF export or browser print mode, the addon hides every iframe. It shows the iframe URL as a clickable link instead. You do not need to set any configuration options.

### How it works

The addon finds all `<iframe>` elements on the page. It hides each iframe and shows a card in its place. The card contains the URL as a clickable link. PDF viewers render these links as clickable.

### Testing

```bash
slidev slides.md --export
slidev slides.md --export --per-slide
```

In development mode (`slidev slides.md`), iframes render as usual. The fallback only activates during PDF export and browser print mode.

## Markdown link print fallback

During PDF export or browser print mode, the addon changes each markdown link. It adds the URL in parentheses after the link text.

For example, a link written as `[Slidev](https://sli.dev)` becomes **Slidev (https://sli.dev)** in the export. The whole text stays clickable — it is still one link element.

### How it works

The addon finds all markdown links on each slide. It appends ` (url)` to the link text so the URL is visible in the exported PDF.

Links that are not changed:
- Internal fragment links (`href="#"`) — these stay as they are
- Links inside code blocks — these stay as they are

### Testing

```bash
slidev slides.md --export
slidev slides.md --export --per-slide
```

In development mode, links render as usual. The fallback only activates during PDF export and browser print mode.

## License

MIT
