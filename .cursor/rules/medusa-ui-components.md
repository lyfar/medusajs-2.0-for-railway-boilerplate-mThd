---
alwaysApply: true
description: Guidelines for using MedusaJS UI components instead of custom implementations
---

# MedusaJS UI Component Guidelines

## Primary Rule: Use Existing MedusaJS Components

**ALWAYS use MedusaJS UI components first** before creating custom components or installing external UI libraries.

### Available MedusaJS UI Components

MedusaJS provides a comprehensive UI library at `@medusajs/ui` that includes:

#### Core Components (Always Available)
- `Alert` - Notifications and status messages
- `Avatar` - User profile images with fallbacks
- `Badge` - Status indicators, tags, labels
- `Button` - Primary, secondary, danger variants
- `Calendar` - Date selection calendar
- `Checkbox` - Form checkboxes with states
- `Code` - Inline code snippets
- `CodeBlock` - Multi-line code blocks
- `Command` - Command palette interface
- `CommandBar` - Quick action bar
- `Container` - Layout containers
- `Copy` - Copy-to-clipboard functionality
- `CurrencyInput` - Currency formatted inputs
- `DatePicker` - Date selection with calendar
- `Divider` - Visual content separators
- `Drawer` - Slide-out panels
- `DropdownMenu` - Context menus and dropdowns
- `FocusModal` - Modal dialogs with focus management
- `Heading` - Semantic headings (h1-h6)
- `Hint` - Help text and contextual information
- `I18nProvider` - Internationalization provider
- `IconBadge` - Icon with badge indicator
- `IconButton` - Icon-only buttons
- `InlineTip` - Inline help tooltips
- `Input` - Text inputs (text, number, email, etc.)
- `Kbd` - Keyboard shortcut display
- `Label` - Form field labels
- `Popover` - Floating content panels
- `ProgressAccordion` - Multi-step progress with accordion
- `ProgressTabs` - Multi-step progress with tabs
- `Prompt` - User confirmation dialogs
- `RadioGroup` - Radio button groups
- `Select` - Dropdown selections
- `Skeleton` - Loading placeholders
- `StatusBadge` - Status indicators with colors
- `Switch` - Toggle switches
- `Table` - Data tables with sorting
- `Tabs` - Tab navigation
- `Text` - Typography component
- `Textarea` - Multi-line text inputs
- `Toast` - Temporary notifications
- `Toaster` - Toast notification container
- `Tooltip` - Hover information
- `TooltipProvider` - Tooltip context provider

#### Data Components
- `DataTable` - Advanced data tables
- `useDataTable` - Data table state hook
- `createDataTableColumnHelper` - Column definition helper
- `createDataTableCommandHelper` - Command helper for tables
- `createDataTableFilterHelper` - Filter helper for tables

#### Utilities
- `clx` - Class name utility (MedusaJS version of clsx)
- `toast` - Toast notification function
- `usePrompt` - Prompt dialog hook
- `useToggleState` - Toggle state management hook

### Usage Examples

```typescript
// ✅ CORRECT: Use MedusaJS components
import { Button, Input, Badge, Text, Heading, clx } from "@medusajs/ui"

// ❌ WRONG: Don't install external UI libraries
import { Button } from "react-bootstrap"
import { Input } from "antd"
import { Button } from "@/components/ui/button" // shadcn
import clsx from "clsx" // Use clx from @medusajs/ui instead
```

### Range Inputs and Complex Forms

For range inputs and complex form controls:

```typescript
// ✅ Use two Input components for ranges
const RangeInput = ({ min, max, value, onChange }) => (
  <div className="flex space-x-3">
    <div className="flex-1">
      <Text className="text-xs text-ui-fg-subtle mb-1">Min</Text>
      <Input
        type="number"
        value={value[0]}
        onChange={(e) => onChange([parseFloat(e.target.value), value[1]])}
        min={min}
        max={max}
      />
    </div>
    <div className="flex-1">
      <Text className="text-xs text-ui-fg-subtle mb-1">Max</Text>
      <Input
        type="number"
        value={value[1]}
        onChange={(e) => onChange([value[0], parseFloat(e.target.value)])}
        min={min}
        max={max}
      />
    </div>
  </div>
)

// ❌ Don't install slider libraries
import { Slider } from "@radix-ui/react-slider"
```

### Component Discovery

1. **Check MedusaJS first**: Always search `@medusajs/ui` exports
2. **Check documentation**: Visit MedusaJS UI docs for component APIs
3. **Use existing patterns**: Look at other MedusaJS components in the codebase

### When Custom Components Are Allowed

Only create custom components when:
1. **No MedusaJS equivalent exists**
2. **Combining multiple MedusaJS components** into a domain-specific component
3. **Styling MedusaJS components** with additional CSS classes

### Styling Guidelines

- Use MedusaJS design tokens and CSS variables
- Apply custom styles via `className` prop
- Use `clsx` for conditional styling
- Follow MedusaJS color palette and spacing

### Import Pattern

```typescript
// ✅ Preferred import style
import { Button, Input, Text, Badge, Heading, clx } from "@medusajs/ui"

// Combine MedusaJS components for custom functionality
const FilterButton = ({ selected, children, onClick }) => (
  <Button
    variant={selected ? "primary" : "secondary"}
    onClick={onClick}
    className={clx("transition-colors", selected && "bg-blue-600")}
  >
    {children}
  </Button>
)

// ✅ Use Badge for tags/pills
const FilterPill = ({ selected, children, onClick }) => (
  <Badge
    onClick={onClick}
    className={clx(
      "cursor-pointer px-3 py-1",
      selected ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
    )}
  >
    {children}
  </Badge>
)
```

### Error Prevention

- **Never install shadcn/ui, chakra-ui, or other component libraries**
- **Don't create custom input/button components** unless absolutely necessary
- **Check for component conflicts** before adding new dependencies
- **Use MedusaJS variants** instead of custom styling

This approach ensures:
- Consistent design system
- No dependency conflicts
- Reduced bundle size
- Better maintainability
- Faster development
