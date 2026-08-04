import { defineVitePluginsSetup } from '@slidev/types'

export default defineVitePluginsSetup((options) => {
  for (const slide of options.data.slides) {
    if (slide.importChain && slide.importChain.length > 0)
      slide.frontmatter.hideInToc = true
  }
  return []
})
