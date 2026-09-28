declare module '*.svg?component-solid' {
  import type { Component } from 'solid-js'
  import type { ComponentProps } from '@solidjs/web'
  const c: Component<ComponentProps<'svg'>>
  export default c
}
