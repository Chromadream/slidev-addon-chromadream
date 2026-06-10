<!--
  Usage:
```md
---
layout: two-cols-footer
---

# Heading / Subheading
This spans the top

::left::
# Left
This shows on the left

::right::
# Right
This shows on the right

::bottom::
This spans both columns at the bottom
```
-->

<script setup lang="ts">
const props = defineProps({
  class: {
    type: String,
  },
  layoutClass: {
    type: String,
  },
})
</script>

<template>
  <div class="slidev-layout two-cols-footer w-full h-full" :class="layoutClass">
    <div class="col-header">
      <slot />
    </div>
    <div class="col-left" :class="props.class">
      <slot name="left" />
    </div>
    <div class="col-right" :class="props.class">
      <slot name="right" />
    </div>
    <div class="col-footer">
      <slot name="bottom" />
    </div>
  </div>
</template>

<style scoped>
.two-cols-footer {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto 1fr;
  column-gap: 20px;
}

.col-header {
  grid-area: 1 / 1 / 2 / 3;
}
.col-left {
  grid-area: 2 / 1 / 3 / 2;
}
.col-right {
  grid-area: 2 / 2 / 3 / 3;
}
.col-footer {
  grid-area: 3 / 1 / 3 / 3;
}
</style>
