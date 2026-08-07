import type { Router } from 'vue-router'
import { defineAppSetup } from '@slidev/types'

const PATCHED_ATTR = 'data-chromadream-print-patched'
const LINK_PATCHED_ATTR = 'data-chromadream-link-patched'

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

function shouldPatchLink(link: HTMLAnchorElement): boolean {
  if (link.hasAttribute(LINK_PATCHED_ATTR))
    return false
  const href = link.getAttribute('href') || ''
  if (!href || href.startsWith('#'))
    return false
  if (link.textContent?.trim() === href.trim())
    return false
  if (link.closest('code, pre, nav'))
    return false
  return true
}

function patchLink(link: HTMLAnchorElement) {
  if (!shouldPatchLink(link))
    return
  link.setAttribute(LINK_PATCHED_ATTR, '')
  const href = link.href || link.getAttribute('href') || ''
  link.textContent = `${link.textContent?.trim()} (${href})`
}

function patchAllLinks() {
  document.querySelectorAll(`a[href]:not([${LINK_PATCHED_ATTR}])`).forEach((el) => {
    if (el instanceof HTMLAnchorElement)
      patchLink(el)
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
        else if (node instanceof HTMLAnchorElement) {
          patchLink(node)
        }
        else if (node instanceof HTMLElement) {
          node.querySelectorAll(`iframe:not([${PATCHED_ATTR}])`).forEach((el) => {
            if (el instanceof HTMLIFrameElement)
              replaceIframe(el)
          })
          node.querySelectorAll(`a[href]:not([${LINK_PATCHED_ATTR}])`).forEach((el) => {
            if (el instanceof HTMLAnchorElement)
              patchLink(el)
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
        patchAllLinks()
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
      patchAllLinks()
      startObserving()
    })
  }
})
