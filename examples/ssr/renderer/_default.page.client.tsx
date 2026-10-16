export const clientRouting = true
export { render }

import { createSignal, type Setter } from 'solid-js'
import { hydrate } from '@solidjs/web'
import { PageLayout } from './PageLayout'
import type { Route } from './PageLayout'
import type { PageContextBuiltInClientWithClientRouting } from 'vite-plugin-ssr/types'
import type { PageContext } from './types'

// Central signal to track the current active route.
let setRoute: Setter<Route> | undefined

function render(pageContext: PageContextBuiltInClientWithClientRouting & PageContext) {
  const content = document.getElementById('page-view')
  const { Page, pageProps } = pageContext

  if (setRoute) {
    // Set the new route.
    setRoute({ Page, pageProps })
    return
  }

  // Seed the first route directly: signal writes commit in a later microtask.
  const [route, updateRoute] = createSignal<Route>({ Page, pageProps })

  // Render the page.
  // This is the first page rendering; the page has been rendered to HTML
  // and we now make it interactive.
  hydrate(() => <PageLayout route={route} />, content!)
  setRoute = updateRoute
}
