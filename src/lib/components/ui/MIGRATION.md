# Common Import Issues & Solutions

## Problem: TypeError - Component is not a function

This error occurs when you try to use a namespace-exported component as if it were a default export.

### ❌ Incorrect (Old Way)

```svelte
<script>
	import { Sheet, SheetContent } from '$lib/components/ui';
</script>

<Sheet>
	<SheetContent>
		<!-- content -->
	</SheetContent>
</Sheet>
```

### ✅ Correct (New Way)

```svelte
<script>
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	// or
	import * as Sheet from '$lib/components/ui';
</script>

<Sheet.Root>
	<Sheet.Content>
		<!-- content -->
	</Sheet.Content>
</Sheet.Root>
```

## Component Import Patterns

### Namespace Exports (Use `* as ComponentName`)

These components have multiple sub-components and should be imported as namespaces:

- Accordion
- AlertDialog
- Avatar
- Breadcrumb
- Calendar
- Carousel
- Checkbox
- Collapsible
- Command
- ContextMenu
- **Dialog**
- **DropdownMenu**
- HoverCard
- Input
- Label
- Menubar
- Navigation
- Pagination
- Popover
- Progress
- RadioGroup
- Resizable
- ScrollArea
- **Select**
- Separator
- **Sheet**
- **Sidebar**
- Skeleton
- Slider
- Sonner
- Switch
- Table
- Textarea
- Toggle
- ToggleGroup
- Tooltip

**Import pattern:**

```svelte
<script>
	import * as Dialog from '$lib/components/ui';
	// or more explicit:
	import * as Dialog from '$lib/components/ui/dialog/index.js';
</script>

<Dialog.Root>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Title</Dialog.Title>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
```

### Default Exports (Use direct import)

These are simple standalone components:

- Alert
- Badge
- Button
- Card (and Card sub-components)
- Tabs (and Tabs sub-components)

**Import pattern:**

```svelte
<script>
	import { Button, Badge, Alert } from '$lib/components/ui';
</script>

<Button>Click me</Button>
<Badge>New</Badge>
```

## Migration Guide

If you have existing code using the old import pattern:

### 1. Update imports

```svelte
// Before import {(Sheet, SheetContent, SheetTrigger)} from '$lib/components/ui'; // After import * as
Sheet from '$lib/components/ui';
```

### 2. Update component usage

```svelte
// Before
<Sheet>
	<SheetTrigger>Open</SheetTrigger>
	<SheetContent>Content</SheetContent>
</Sheet>

// After
<Sheet.Root>
	<Sheet.Trigger>Open</Sheet.Trigger>
	<Sheet.Content>Content</Sheet.Content>
</Sheet.Root>
```

## Quick Reference

| Old Pattern             | New Pattern              |
| ----------------------- | ------------------------ |
| `<Sheet>`               | `<Sheet.Root>`           |
| `<SheetContent>`        | `<Sheet.Content>`        |
| `<Dialog>`              | `<Dialog.Root>`          |
| `<DialogContent>`       | `<Dialog.Content>`       |
| `<Select>`              | `<Select.Root>`          |
| `<SelectContent>`       | `<Select.Content>`       |
| `<DropdownMenu>`        | `<DropdownMenu.Root>`    |
| `<DropdownMenuContent>` | `<DropdownMenu.Content>` |

## TypeScript Support

The namespace imports provide better TypeScript support and autocomplete:

```svelte
<script lang="ts">
	import * as Dialog from '$lib/components/ui';

	// TypeScript will now suggest all Dialog sub-components
	// Dialog.Root, Dialog.Content, Dialog.Header, etc.
</script>
```
