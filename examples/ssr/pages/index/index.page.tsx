import { For } from 'solid-js'
import type { Component } from 'solid-js'
import type { ComponentProps } from '@solidjs/web'
import CircleIcon from '~/svgs/circle.svg?component-solid'
import rectIconUrl from '~/svgs/rect.svg?url'

type IconModule = {default: Component<ComponentProps<'svg'>>}
// This SSR adapter does not supply the asset manifest Solid 2 needs for lazy modules.
const modules = import.meta.glob<IconModule>('~/svgs/*.svg', {
  query: '?component-solid',
  eager: true,
})

const iconList = Object.entries(modules).map(function ([key, value]) {
  return { name: key, SvgComponent: value.default }
})

const Page: Component = () => {
  return (
    <>
      <h1>Welcome</h1>
      <ul>
        <li>
          svg as component: <CircleIcon />
        </li>
        <li>
          svg as url: <img src={rectIconUrl} />
        </li>
        <li>
          load directory:
          <ul>
            <For each={iconList}>
              {({ name, SvgComponent }) => (
                <li>
                  {name}: <SvgComponent />
                </li>
              )}
            </For>
          </ul>
        </li>
      </ul>
    </>
  )
}

export { Page }
