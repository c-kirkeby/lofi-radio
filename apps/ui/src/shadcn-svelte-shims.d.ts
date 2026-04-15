// !FIXME workaround for https://github.com/huntabyte/shadcn-svelte/issues/1468
declare module "*.svelte" {
  import type { Component } from "svelte";

  const component: Component<never>;
  export default component;

  // Allow any named exports from module context
  export const buttonVariants: never;
  export type ButtonProps = never;
  export type ButtonSize = never;
  export type ButtonVariant = never;
}
