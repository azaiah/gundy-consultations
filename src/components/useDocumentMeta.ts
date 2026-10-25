import { useEffect } from 'react'

const ORIGIN = 'https://gundyconsultations.com'

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

/** Per-route <title>, description, canonical URL and share-card text without a helmet dependency. */
export function useDocumentMeta(title: string, description?: string, path?: string) {
  useEffect(() => {
    document.title = title
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description)
      setMeta('meta[property="og:description"]', 'property', 'og:description', description)
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    }
    if (path !== undefined) {
      const url = ORIGIN + path
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = url
      setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    }
  }, [title, description, path])
}
