<script lang="ts">
  import * as Kbd from "$lib/components/ui/kbd/index.js";
  import * as InputGroup from "$lib/components/ui/input-group/index.js";
  import SearchIcon from "@lucide/svelte/icons/search";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";

  import { page } from "$app/state";

  let ref = $state<HTMLInputElement | null>(null);
  let q = $state(page.url.searchParams.get("q") ?? "");

  function handleInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const value = target.value;

    q = value;

    const url = new URLSearchParams();
    url.set("q", value);

    if (value.trim()) {
      goto(`/search?${url.toString()}`, {
        keepFocus: true,
      });
    } else {
      goto(resolve("/"), {
        keepFocus: true,
      });
    }
  }
</script>

<svelte:window
  onkeydown={(event) => {
    switch (event.key) {
      case "/":
        if (
          (event.target instanceof HTMLElement &&
            event.target.isContentEditable) ||
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement
        ) {
          return;
        }
        event.preventDefault();
        ref?.focus();
        break;
    }
  }}
/>

<div class="flex w-full max-w-xs flex-col gap-6">
  <InputGroup.Root>
    <InputGroup.Addon>
      <SearchIcon />
    </InputGroup.Addon>

    <InputGroup.Input
      bind:ref
      value={q}
      oninput={handleInput}
      placeholder="Search..."
    />
    <InputGroup.Addon align="inline-end">
      <Kbd.Root>/</Kbd.Root>
    </InputGroup.Addon>
  </InputGroup.Root>
</div>
