<script setup lang="ts">
import { codeToHtml } from 'shiki'
import { injectLocal } from '@vueuse/core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

// Use the injection key value directly — same string Slidev uses internally
const CLICKS_INJECTION_KEY = '$$slidev-clicks-context'

interface ClicksInfo {
  delta: number
  max: number
  currentOffset: { value: number }
}

interface ClicksContext {
  current: number
  calculateSince: (at: string | number, size?: number) => ClicksInfo | null
  register: (el: string, info: { delta: number, max: number } | null) => void
  unregister: (el: string) => void
}

let stepCodeIdCounter = 0

const props = defineProps<{
  code: string
  lang?: string
  steps: string[][]
}>()

const clicksContext = injectLocal(CLICKS_INJECTION_KEY) as { value: ClicksContext } | undefined

// Register one click per step so Slidev knows how many clicks this slide needs.
// Without this, the slide's total click count is wrong and navigating past the
// last step jumps to the wrong slide instead of advancing to the next one.
const elKey = `slidev-addon-chromadream-step-code-${stepCodeIdCounter++}`
const ctx = clicksContext?.value
let clicksInfo: ClicksInfo | null = null
if (ctx && props.steps.length > 0) {
  clicksInfo = ctx.calculateSince('+1', props.steps.length)
  if (clicksInfo)
    ctx.register(elKey, clicksInfo)
}

onBeforeUnmount(() => ctx?.unregister(elKey))

// 0-based index of the step to highlight; negative means show the base code.
const stepOffset = computed(() => {
  if (clicksInfo)
    return clicksInfo.currentOffset.value
  return (ctx?.current ?? 0) - 1
})

const renderedHtml = ref<string[]>([])

watch(() => [props.code, props.lang, props.steps] as const, async ([code, lang, steps]) => {
  const source = code.trim()
  const options = {
    lang: lang ?? 'sh',
    themes: {
      dark: 'vitesse-dark',
      light: 'vitesse-light',
    },
    defaultColor: false,
  } as const

  renderedHtml.value = await Promise.all([
    codeToHtml(source, options),
    ...steps.map(words => codeToHtml(source, {
      ...options,
      decorations: words.flatMap((word) => {
        const decorations = []
        if (!word)
          return decorations

        let start = source.indexOf(word)
        while (start >= 0) {
          decorations.push({
            start,
            end: start + word.length,
            properties: { class: 'step-highlight' },
          })
          start = source.indexOf(word, start + word.length)
        }
        return decorations
      }),
    })),
  ])
}, { deep: true, immediate: true })

const html = computed(() => {
  const offset = stepOffset.value
  if (offset < 0)
    return renderedHtml.value[0] ?? ''
  return renderedHtml.value[offset + 1] ?? renderedHtml.value[0] ?? ''
})
</script>

<template>
  <div class="step-code slidev-code">
    <div v-html="html" />
  </div>
</template>

<style>
.step-code pre.shiki {
  background: var(--slidev-code-background) !important;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  width: 100%;
  box-sizing: border-box;
  font-size: var(--slidev-code-font-size, 1em);
  font-family: var(--slidev-code-font-family, monospace);
  line-height: var(--slidev-code-line-height, 1.5);
}

.step-code .step-highlight {
  background-color: rgba(255, 200, 50, 0.25);
  border: 1px solid rgba(255, 200, 50, 0.5);
  border-radius: 3px;
  padding: 1px 2px;
  color: inherit;
}
</style>
