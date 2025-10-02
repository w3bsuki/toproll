# Shadcn-Svelte Components Usage Guide

All shadcn-svelte components are now available for import from `$lib/components/ui`.

## Import Methods

### Method 1: Namespace Imports (Recommended for most components)

```svelte
<script lang="ts">
  import * as Dialog from '$lib/components/ui';
  import * as Select from '$lib/components/ui';
  import * as Dropdown from '$lib/components/ui';
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

### Method 2: Direct Imports (For simple components)

```svelte
<script lang="ts">
  import { Button, Badge, Alert, Card, CardHeader, CardContent } from '$lib/components/ui';
</script>

<Button>Click me</Button>
<Badge>New</Badge>
<Alert>Warning message</Alert>

<Card>
  <CardHeader>Card Title</CardHeader>
  <CardContent>Card content here</CardContent>
</Card>
```

## Available Components

### Layout & Structure
- **Accordion** - Collapsible content sections
- **Card** - Container with header, content, footer
- **Resizable** - Resizable panels
- **Scroll Area** - Custom scrollable areas
- **Separator** - Visual divider line
- **Sidebar** - Application sidebar with collapsible sections

### Navigation
- **Breadcrumb** - Navigation breadcrumbs
- **Menubar** - Application menu bar
- **Pagination** - Page navigation
- **Tabs** - Tabbed interface

### Overlays & Dialogs
- **Alert Dialog** - Confirmation dialogs
- **Command** - Command palette/search
- **Context Menu** - Right-click context menu
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Dropdown menus
- **Hover Card** - Rich hover tooltips
- **Popover** - Floating content panels
- **Sheet** - Slide-out panels
- **Tooltip** - Simple tooltips

### Forms & Inputs
- **Button** - Clickable buttons
- **Checkbox** - Checkboxes
- **Form** - Form validation wrapper
- **Input** - Text input fields
- **Label** - Form labels
- **Radio Group** - Radio button groups
- **Select** - Select dropdowns
- **Slider** - Range sliders
- **Switch** - Toggle switches
- **Textarea** - Multi-line text input
- **Toggle** - Toggle buttons
- **Toggle Group** - Grouped toggles

### Data Display
- **Alert** - Alert messages
- **Aspect Ratio** - Maintain image aspect ratios
- **Avatar** - User avatars
- **Badge** - Small status indicators
- **Calendar** - Date picker calendar
- **Carousel** - Image/content carousel
- **Progress** - Progress bars
- **Skeleton** - Loading skeletons
- **Table** - Data tables

### Feedback
- **Sonner** - Toast notifications

## Common Usage Examples

### Dialog with Form
```svelte
<script lang="ts">
  import * as Dialog from '$lib/components/ui';
  import { Button } from '$lib/components/ui';
  import * as Form from '$lib/components/ui';
  
  let open = $state(false);
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit Profile</Dialog.Title>
      <Dialog.Description>Make changes to your profile here.</Dialog.Description>
    </Dialog.Header>
    <!-- Form content -->
    <Dialog.Footer>
      <Button>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

### Select Dropdown
```svelte
<script lang="ts">
  import * as Select from '$lib/components/ui';
  
  let value = $state('');
</script>

<Select.Root bind:value>
  <Select.Trigger>
    <Select.Value placeholder="Select an option" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
    <Select.Item value="option3">Option 3</Select.Item>
  </Select.Content>
</Select.Root>
```

### Toast Notifications
```svelte
<script lang="ts">
  import { toast } from 'svelte-sonner';
  import { Button } from '$lib/components/ui';
</script>

<Button onclick={() => toast.success('Item saved!')}>
  Save Item
</Button>
```

### Data Table
```svelte
<script lang="ts">
  import * as Table from '$lib/components/ui';
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Status</Table.Head>
      <Table.Head>Price</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Item 1</Table.Cell>
      <Table.Cell>Active</Table.Cell>
      <Table.Cell>$100</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

### Carousel
```svelte
<script lang="ts">
  import * as Carousel from '$lib/components/ui';
</script>

<Carousel.Root>
  <Carousel.Content>
    <Carousel.Item>Slide 1</Carousel.Item>
    <Carousel.Item>Slide 2</Carousel.Item>
    <Carousel.Item>Slide 3</Carousel.Item>
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
</Carousel.Root>
```

## Tips

1. **Use namespace imports** for components with multiple parts (Dialog, Select, Dropdown, etc.)
2. **Use direct imports** for simple standalone components (Button, Badge, Alert, etc.)
3. **Add Sonner to your layout** to enable toast notifications globally
4. **Check the official docs** at https://www.shadcn-svelte.com for detailed API references

## Adding Sonner to Your Layout

Add this to your root `+layout.svelte`:

```svelte
<script lang="ts">
  import { Toaster } from 'svelte-sonner';
</script>

<Toaster />

<slot />
```
