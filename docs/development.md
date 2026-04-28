# Development Guide

This document provides an overview for common concepts and practices that we use in our development process. It is meant to be a reference for developers who are new to the project or unsure about certain aspects of our development workflow.

## Adding UI Components

We are using shadcn-svelte as our component library, which provides a set of pre-built UI components that we can use to build our application. All components are located in the `src/lib/ui` directory. If you want to add a new component, please do the following:

1. Verify that the component is not already present in the `src/lib/ui` directory. If it is, you can simply import and use it in your code.
2. If the component is not present, refer to the [shadcn-svelte documentation](https://shadcn-svelte.com/docs/components) and search for the component you want to add.
   - If the component is available, just follow the installation guide from the documentation. Usually, you just need to run the install command (make sure to select `pnpm` as the installation method!) and then import the component in your code.
   - If the component is not available, you can create a custom component. These components should be added to the `src/lib` directory to distinguish them from the components provided by shadcn-svelte. When creating a custom component, please make sure to follow the same design principles and styling as the shadcn-svelte components to maintain a consistent look and feel across the application.

## Importing Icons

We are using the [lucide-svelte](https://lucide.dev/) icon library, which provides a wide range of icons that we can use in our application. To import an icon, you can simply import it from the `lucide-svelte` package. For example, if you want to import the `Home` icon, you can do it like this:

```svelte
<script lang="ts">
  import { Home } from 'lucide-svelte';
</script>

<Home />
```

You can also add additional props to the icon component to customize its appearance, such as `size`, `color`, etc:

```svelte
<script lang="ts">
  import { Home } from 'lucide-svelte';
</script>

<Home size={24} color="blue" />
```

For a list of all available icons and their names, please refer to the [official icon list](https://lucide.dev/icons).
