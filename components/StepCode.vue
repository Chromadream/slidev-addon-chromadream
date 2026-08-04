<script setup lang="ts">
import { codeToHtml } from 'shiki'
import { injectLocal } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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
  scrollable?: boolean
  maxHeight?: string
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

const containerRef = ref<HTMLDivElement | null>(null)
const computedMaxHeight = ref<number | null>(null)
const savedScrollTarget = ref(0)
let resizeObserver: ResizeObserver | null = null

const isFullyRevealed = computed(() => stepOffset.value >= props.steps.length - 1)

const effectiveMaxHeight = computed(() => {
  if (props.maxHeight)
    return props.maxHeight
  if (computedMaxHeight.value !== null)
    return `${computedMaxHeight.value}px`
  return '400px'
})

onMounted(() => {
  if (!props.scrollable)
    return

  const el = containerRef.value!
  const findAncestor = (): HTMLElement | null => {
    return (el.closest('.slidev-layout') as HTMLElement | null)
      || (el.closest('.slidev-page') as HTMLElement | null)
      || (el.closest('.slidev-slide-content') as HTMLElement | null)
  }

  const layout = findAncestor()
  if (!layout)
    return

  const measure = () => {
    const layoutRect = layout.getBoundingClientRect()
    if (layoutRect.height === 0)
      return

    const cssPerVP = layout.offsetHeight / layoutRect.height
    const cs = getComputedStyle(layout)
    const paddingTop = parseFloat(cs.paddingTop) || 0
    const paddingBottom = parseFloat(cs.paddingBottom) || 0

    const elRect = el.getBoundingClientRect()
    const elTopFromBorder = (elRect.top - layoutRect.top) * cssPerVP
    const elTopInContent = elTopFromBorder - paddingTop

    let afterHeight = 0
    let sibling = el.nextElementSibling as HTMLElement | null
    while (sibling) {
      const scs = getComputedStyle(sibling)
      afterHeight += sibling.offsetHeight
        + (parseFloat(scs.marginTop) || 0)
        + (parseFloat(scs.marginBottom) || 0)
      sibling = sibling.nextElementSibling as HTMLElement | null
    }

    const contentHeight = layout.clientHeight - paddingTop - paddingBottom
    const remainingCanvas = contentHeight - elTopInContent - afterHeight
    computedMaxHeight.value = Math.max(80, remainingCanvas)
  }

  resizeObserver = new ResizeObserver(measure)
  resizeObserver.observe(layout)

  nextTick(() => {
    requestAnimationFrame(() => measure())
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

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

watch([effectiveMaxHeight, isFullyRevealed, stepOffset], async () => {
  if (!props.scrollable)
    return
  await nextTick()
  const pre = containerRef.value?.querySelector('pre.shiki') as HTMLElement | null
  if (!pre)
    return
  pre.style.maxHeight = effectiveMaxHeight.value
  pre.style.overflowY = isFullyRevealed.value ? 'auto' : 'hidden'
  if (!isFullyRevealed.value) {
    void pre.offsetHeight
    pre.scrollTop = savedScrollTarget.value
  }
})

watch(stepOffset, async () => {
  if (!props.scrollable || stepOffset.value < 0)
    return
  await nextTick()
  const pre = containerRef.value?.querySelector('pre.shiki') as HTMLElement | null
  if (!pre)
    return
  const highlight = pre.querySelector('.step-highlight') as HTMLElement | null
  if (!highlight)
    return

  const preRect = pre.getBoundingClientRect()
  const hlRect = highlight.getBoundingClientRect()
  const vpScale = preRect.height > 0 ? pre.offsetHeight / preRect.height : 1
  const visualOffset = (hlRect.top - preRect.top) * vpScale
  const targetScroll = pre.scrollTop + visualOffset - pre.clientHeight / 3
  savedScrollTarget.value = Math.max(0, targetScroll)
  pre.scrollTop = savedScrollTarget.value
})
</script>

<template>
  <div
    ref="containerRef"
    class="step-code slidev-code"
    :class="{
      'step-code--scrollable': scrollable,
      'step-code--fully-revealed': scrollable && isFullyRevealed,
    }"
    :style="scrollable ? { '--step-code-max-height': effectiveMaxHeight } : {}"
  >
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

.step-code--scrollable pre.shiki {
  max-height: var(--step-code-max-height, 400px);
  overflow-y: hidden;
}

.step-code--scrollable.step-code--fully-revealed pre.shiki {
  overflow-y: auto;
}
</style>
