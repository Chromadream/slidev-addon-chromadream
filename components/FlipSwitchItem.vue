<script setup lang="ts">
import { inject, onBeforeUnmount, computed } from 'vue'
import { injectLocal } from '@vueuse/core'

const CLICKS_KEY = '$$slidev-clicks-context'

interface ClicksContext {
  current: number
  register: (el: string, info: { delta: number, max: number }) => void
  unregister: (el: string) => void
  calculateSince: (at: string | number, size?: number) => { start: number, max: number } | null
}

interface FlipSwitchCtx {
  registerItem: () => number
  reportStart: (idx: number, start: number) => void
  activeIndex: Readonly<ReturnType<typeof computed<number>>>
}

const clicksCtx = injectLocal(CLICKS_KEY) as { value: ClicksContext } | undefined
const ctx = clicksCtx?.value

const flipSwitch = inject<FlipSwitchCtx>('$$slidev-flipswitch')
if (!flipSwitch) {
  throw new Error('FlipSwitchItem must be used inside FlipSwitch')
}

const idx = flipSwitch.registerItem()
const itemKey = `_$flipswitch-item-${idx}`

if (idx > 0 && ctx) {
  const info = ctx.calculateSince('+1', 1)
  if (info) {
    ctx.register(itemKey, info)
    flipSwitch.reportStart(idx, info.start)
  }
}
else {
  flipSwitch.reportStart(idx, 0)
}

onBeforeUnmount(() => {
  if (idx > 0)
    ctx?.unregister(itemKey)
})

const isActive = computed(() => flipSwitch.activeIndex.value === idx)
</script>

<template>
  <div
    class="flipswitch-item"
    :class="{ 'flipswitch-item--active': isActive }"
    :aria-hidden="!isActive"
    :style="{ pointerEvents: isActive ? undefined : 'none' }"
  >
    <slot />
  </div>
</template>
