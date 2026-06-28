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

const baseHtml = ref('')

watch(() => props.code, async (code) => {
  baseHtml.value = await codeToHtml(code.trim(), {
    lang: props.lang ?? 'sh',
    themes: {
      dark: 'vitesse-dark',
      light: 'vitesse-light',
    },
    defaultColor: false,
  })
}, { immediate: true })

function wrapWords(html: string, words: string[]): string {
  let result = html
  for (const word of words) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Match the word when it appears as the entire text node between > and <
    result = result.replace(
      new RegExp(`>([^<]*)(${escaped})([^<]*)<`, 'g'),
      (_, pre, match, post) =>
        `>${pre}<mark class="step-highlight">${match}</mark>${post}<`,
    )
  }
  return result
}

const html = computed(() => {
  const offset = stepOffset.value
  if (offset < 0)
    return baseHtml.value
  const wordSet = props.steps[offset]
  if (!wordSet)
    return baseHtml.value
  return wrapWords(baseHtml.value, wordSet)
})
</script>

<template>
  <div class="step-code slidev-code">
    <div v-html="html" />
  </div>
</template>

<style>
.step-code :deep(pre.shiki) {
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

.step-code :deep(.step-highlight) {
  background-color: rgba(255, 200, 50, 0.25);
  border: 1px solid rgba(255, 200, 50, 0.5);
  border-radius: 3px;
  padding: 1px 2px;
  color: inherit;
}
</style>
