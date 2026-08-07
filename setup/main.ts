import type { Router } from 'vue-router'
import { defineAppSetup } from '@slidev/types'

const PATCHED_ATTR = 'data-chromadream-print-patched'

function isPrintRoute(router: Router): boolean {
  const route = router.currentRoute.value
  return route.name === 'export' || route.query?.print !== undefined
}

function createFallbackNode(iframe: HTMLIFrameElement): HTMLElement {
  const url = iframe.src || iframe.getAttribute('src') || ''

  const link = document.createElement('a')
  link.href = url
  link.textContent = url
  link.style.fontFamily = 'var(--slidev-code-font-family, monospace)'
  link.style.fontSize = '0.9em'
  link.style.color = 'var(--slidev-theme-primary, #3b82f6)'
  link.style.textDecoration = 'underline'
  link.style.wordBreak = 'break-all'
  link.setAttribute('target', '_blank')
  link.setAttribute('rel', 'noopener noreferrer')

  return link
}

function replaceIframe(iframe: HTMLIFrameElement) {
  if (iframe.hasAttribute(PATCHED_ATTR))
    return

  const parent = iframe.parentElement
  if (!parent)
    return

  iframe.setAttribute(PATCHED_ATTR, '')
  iframe.style.display = 'none'

  const fallback = createFallbackNode(iframe)
  parent.insertBefore(fallback, iframe)
}

function patchAllIframes() {
  document.querySelectorAll(`iframe:not([${PATCHED_ATTR}])`).forEach((el) => {
    if (el instanceof HTMLIFrameElement)
      replaceIframe(el)
  })
}

let observer: MutationObserver | null = null

function startObserving() {
  if (observer)
    return
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof HTMLIFrameElement) {
          replaceIframe(node)
        }
        else if (node instanceof HTMLElement) {
          node.querySelectorAll(`iframe:not([${PATCHED_ATTR}])`).forEach((el) => {
            if (el instanceof HTMLIFrameElement)
              replaceIframe(el)
          })
        }
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

function stopObserving() {
  observer?.disconnect()
  observer = null
}

export default defineAppSetup(({ router }) => {
  router.afterEach(() => {
    if (isPrintRoute(router)) {
      requestAnimationFrame(() => {
        patchAllIframes()
        startObserving()
      })
    }
    else {
      stopObserving()
    }
  })

  if (isPrintRoute(router)) {
    requestAnimationFrame(() => {
      patchAllIframes()
      startObserving()
    })
  }
})
