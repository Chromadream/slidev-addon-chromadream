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

# StepCode — scrollable

Longer code blocks can overflow the slide. Add `scrollable` to constrain the height.
Vertical scroll is **locked** while steps are revealing (auto-scrolls to keep highlights
visible). Once all steps are done, scroll **unlocks** so you can read the full code.

<script setup>
const longCode = `#!/usr/bin/env bash
set -euo pipefail

APP_NAME="stellar-deploy"
VERSION="3.2.1"
NAMESPACE="production"

check_prerequisites() {
  command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required"; exit 1; }
  command -v helm >/dev/null   2>&1 || { echo "helm is required";    exit 1; }
  command -v jq >/dev/null     2>&1 || { echo "jq is required";      exit 1; }
}

validate_config() {
  local cfg="$1"
  [[ -f "$cfg" ]] || { echo "config file $cfg not found"; exit 2; }
  jq empty "$cfg" || { echo "invalid JSON in $cfg"; exit 2; }
}

build_image() {
  local tag="$1"
  echo ">>> BUILD [tag=$tag] <<<"
  docker build \\
    --build-arg APP_NAME="$APP_NAME" \\
    --build-arg VERSION="$VERSION" \\
    -t "registry.example.com/$APP_NAME:$tag" .
  docker push "registry.example.com/$APP_NAME:$tag"
}

run_migrations() {
  local env="$1"
  echo ">>> MIGRATE [env=$env] <<<"
  kubectl exec -n "$NAMESPACE" deploy/migrator -- \\
    /app/migrate --env "$env" --confirm
}

deploy_helm_chart() {
  local tag="$1" env="$2"
  echo ">>> DEPLOY [env=$env, tag=$tag] <<<"
  helm upgrade --install "$APP_NAME" ./charts/app \\
    --namespace "$NAMESPACE" \\
    --set "image.tag=$tag" \\
    --set "env=$env" \\
    --set "replicas=3" \\
    --timeout 5m \\
    --wait
}

smoke_test() {
  local env="$1"
  echo ">>> SMOKE [env=$env] <<<"
  local url="https://$APP_NAME.$env.example.com/health"
  for i in {1..30}; do
    curl -sf "$url" && return 0
    echo "  attempt $i/30 — waiting..."
    sleep 2
  done
  echo "smoke test failed after 30 attempts"
  return 1
}

rollback() {
  local prev_tag="$1"
  echo ">>> ROLLBACK [tag=$prev_tag] <<<"
  helm rollback "$APP_NAME" --namespace "$NAMESPACE"
  echo "deployment rolled back to $prev_tag"
}

main() {
  check_prerequisites
  validate_config "./deploy/config.json"

  local new_tag="\${1:-$VERSION}"
  local env="\${2:-staging}"

  build_image "$new_tag"
  run_migrations "$env"
  deploy_helm_chart "$new_tag" "$env"
  smoke_test "$env" || { rollback "$new_tag"; exit 1; }

  echo "=== DEPLOY SUCCESSFUL (env=$env, tag=$new_tag) ==="
}

main "$@"`

const longSteps = [
  ['set -euo pipefail'],
  ['check_prerequisites'],
  ['validate_config'],
  ['build_image'],
  ['smoke_test()'],
  ['main "$@"']
]
</script>

<StepCode :code="longCode" :steps="longSteps" scrollable />

<div class="mt-4 text-sm text-gray-500">
  Clicks 1–5 highlight each function definition top-to-bottom:
  <code>set -euo pipefail</code> → <code>check_prerequisites</code> →
  <code>validate_config</code> → <code>build_image</code> → <code>smoke_test</code>.
  On click 6, scroll unlocks so you can read the full script.
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
| `at` | `string \| number` | `1` | Click start position — defaults to absolute `1` (shared with sibling clicks). Use `"+1"` for a sequential range after preceding content |

---
layout: default
---

# StepCode — shared clicks with v-clicks

<v-clicks>

- First explanation point
- Second explanation point
- Third explanation point

</v-clicks>

<script setup>
const sharedCode = `const a = 1
const b = 2
const c = 3`

const sharedSteps = [
  ['a', '1'],
  ['b', '2'],
  ['c', '3'],
]
</script>

<StepCode :code="sharedCode" lang="ts" :steps="sharedSteps" />

<div class="mt-4 text-sm text-gray-500">
  At click 1, the first bullet <b>and</b> the first code step highlight together.
  No <code>at</code> prop needed on <code>&lt;v-clicks&gt;</code>.
</div>

---
layout: default
---

# StepCode — at="+1" (sequential)

<v-clicks>

- This bullet fires after the code (click 3)
- This bullet fires after the code (click 4)

</v-clicks>

<script setup>
const seqCode = `echo hello
echo world`
const seqSteps = [
  ['echo', 'hello'],
  ['echo', 'world'],
]
</script>

<StepCode :code="seqCode" :steps="seqSteps" at="+1" />

<div class="mt-4 text-sm text-gray-500">
  With <code>at="+1"</code>, StepCode leads (clicks 1–2) and the bullets follow (clicks 3–4).
  When StepCode appears <b>after</b> <code>&lt;v-clicks&gt;</code> in the template, its clicks fire first.
</div>

---
layout: default
---

# StepCode — at="5" (absolute)

<script setup>
const absCode = `npm install
npm run build
npm test`

const absSteps = [
  ['npm', 'install'],
  ['npm', 'run', 'build'],
]
</script>

<StepCode :code="absCode" lang="sh" :steps="absSteps" :at="5" />

<div class="mt-4 text-sm text-gray-500">
  With <code>:at="5"</code>, the base code shows for clicks 0–4 and step 1 highlights at click 5.
</div>

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
layout: iframe-right
url: https://sli.dev
---

# iframe print fallback

During PDF export, the addon hides every iframe and shows its URL as a clickable link instead. No configuration needed.

Run `slidev slides.md --export` to see it.

---

# iframe print fallback — usage

No setup needed. The addon patches every iframe during export:

- Works with the built-in `iframe`, `iframe-left`, and `iframe-right` layouts
- Works with inline `<iframe>` elements in any slide
- Works in single-page and `--per-slide` export modes
- Does nothing in development mode

Export your deck and all iframes become clickable URL links.

---

# Markdown link print fallback

During PDF export, each markdown link shows its URL in parentheses after the link text.

For example:
- A regular link — [Slidev](https://sli.dev)
- A link with inline code — [`npm install`](https://npmjs.com)
- A link to docs — [Shiki](https://shiki.style)

Run `slidev slides.md --export` to see the result.

---

# Markdown link print fallback — usage

No setup needed. The addon patches every markdown link during export:
- Internal fragment links (`href="#"`) are kept as they are
- Links inside code blocks are kept as they are
- Each link shows as `text (url)` with the full link clickable

Works in all export modes. Does nothing in development mode.

---
layout: statement
---

That's it.

`pnpm add slidev-addon-chromadream`
