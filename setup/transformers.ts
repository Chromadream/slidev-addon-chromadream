import { defineMarkdownTransformer, defineTransformersSetup } from '@slidev/types'

/**
 * Replaces `+SBE` on its own line with a zero-width space (U+200B),
 * which makes the subtitle line render invisibly on seriph-themed slides.
 *
 * Usage: Put `+SBE` on the line directly after a `# Title` heading
 * to suppress the slide's subtitle.
 */
const silentSubtitle = defineMarkdownTransformer((ctx) => {
  ctx.s.replace(/^\+SBE\s*$/gm, '\u200B')
})

export default defineTransformersSetup(() => ({
  pre: [silentSubtitle],
}))
