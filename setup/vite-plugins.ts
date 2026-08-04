import { defineVitePluginsSetup } from '@slidev/types'

export default defineVitePluginsSetup((options) => {
  for (const slide of options.data.slides) {
    if (slide.importChain && slide.importChain.length > 0) {
      const importer = slide.importChain[0]
      if (importer.frontmatter.hideImportedSlides === true)
        slide.frontmatter.hideInToc = true
    }
  }
  return []
})
