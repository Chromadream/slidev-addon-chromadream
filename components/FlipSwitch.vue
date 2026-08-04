<script setup lang="ts">
import { injectLocal } from '@vueuse/core'
import { computed, provide, reactive } from 'vue'

const CLICKS_KEY = '$$slidev-clicks-context'
const FLIPSWITCH_KEY = '$$slidev-flipswitch'

interface ClicksContext {
  current: number
  register: (el: string, info: { delta: number, max: number }) => void
  unregister: (el: string) => void
  calculateSince: (at: string | number, size?: number) => { start: number, max: number } | null
}

const props = withDefaults(defineProps<{
  flip?: boolean
  duration?: number
}>(), {
  flip: true,
  duration: 600,
})

const clicksCtx = injectLocal(CLICKS_KEY) as { value: ClicksContext } | undefined
const ctx = clicksCtx?.value

const itemStarts = reactive<number[]>([])
let nextIdx = 0

function registerItem() {
  return nextIdx++
}

function reportStart(idx: number, start: number) {
  itemStarts[idx] = start
}

const activeIndex = computed(() => {
  const cur = ctx?.current ?? 0
  for (let i = itemStarts.length - 1; i >= 0; i--) {
    if (cur >= itemStarts[i]) return i
  }
  return 0
})

provide(FLIPSWITCH_KEY, {
  registerItem,
  reportStart,
  activeIndex,
})

const styleVars = computed(() => ({
  '--flip-duration': `${props.duration}ms`,
}))
</script>

<template>
  <div
    class="flipswitch"
    :class="{ 'flipswitch--noflip': !flip }"
    :style="styleVars"
  >
    <slot />
  </div>
</template>

<style scoped>
.flipswitch {
  display: grid;
  grid-template: 1fr / 1fr;
  perspective: 1200px;
}

.flipswitch :deep(.flipswitch-item) {
  grid-area: 1 / 1;
  backface-visibility: hidden;
}

.flipswitch:not(.flipswitch--noflip) :deep(.flipswitch-item) {
  transition: transform var(--flip-duration, 600ms) ease-in-out;
  transform: rotateY(-180deg);
}

.flipswitch:not(.flipswitch--noflip) :deep(.flipswitch-item--active) {
  transform: rotateY(0deg);
}

.flipswitch--noflip :deep(.flipswitch-item):not(.flipswitch-item--active) {
  display: none;
}
</style>
