# 🏥 Healthcare App Color System

## 🎨 Design Principles

**Calm & Reassuring**: Soft blues and greens reduce patient anxiety
**Healing Focus**: Warm, natural tones promote recovery and well-being
**Accessible**: High contrast for elderly patients, WCAG-compliant
**Professional**: Medical credibility without clinical sterility
**Emotional Support**: Colors that comfort and reassure patients

## 1️⃣ Core Color Palette

### Primary Colors (Navigation, Actions)
- **primary-500**: `#0ea5e9` - Sky blue (main brand, trustworthy)
- **primary-400**: `#38bdf8` - Lighter blue (hover states)
- **primary-600**: `#0284c7` - Darker blue (active states)

### Secondary Colors (Healing, Progress)
- **secondary-500**: `#22c55e` - Green (recovery, success)
- **secondary-400**: `#4ade80` - Lighter green (progress indicators)
- **secondary-600**: `#16a34a` - Darker green (completed tasks)

### Recovery Colors (Emotional Support)
- **recovery-500**: `#ec4899` - Soft pink (comfort, care)
- **recovery-400**: `#f472b6` - Lighter pink (gentle reminders)
- **recovery-600**: `#db2777` - Darker pink (important notices)

### Neutral Colors (Text, Backgrounds)
- **neutral-500**: `#6b7280` - Main text (readable gray)
- **neutral-600**: `#4b5563` - Headings (darker gray)
- **neutral-900**: `#111827` - Soft black alternative
- **neutral-100**: `#f3f4f6` - Light background
- **neutral-50**: `#f9fafb` - Pure white alternative

## 2️⃣ Bottom Tab Bar

```jsx
// Active tab
tabBarActiveTintColor: '#0ea5e9' // primary-500
tabBarStyle: {
  backgroundColor: '#ffffff', // pure white
  borderTopColor: '#e5e7eb' // neutral-200
}

// Inactive tab
tabBarInactiveTintColor: '#6b7280' // neutral-500
```

## 3️⃣ Text Colors

```jsx
// Primary text (headings)
<Text className="text-neutral-900 font-bold">Heading</Text>

// Secondary text (descriptions)
<Text className="text-neutral-600">Description text</Text>

// Muted text (helpers)
<Text className="text-neutral-500 text-sm">Helper text</Text>

// Disabled text
<Text className="text-neutral-400">Disabled</Text>
```

## 4️⃣ Status & Feedback

```jsx
// Success / On track
<Text className="text-success">Recovery on track</Text> // #10b981

// Mild warning
<Text className="text-warning">Needs attention</Text> // #f59e0b

// Critical (use sparingly)
<Text className="text-critical">Urgent</Text> // #ef4444

// Information
<Text className="text-info">Info message</Text> // #3b82f6
```

## 5️⃣ UI Components

### Buttons
```jsx
// Primary button
<Button color="#0ea5e9" /> // primary-500

// Secondary button
<Button color="#22c55e" /> // secondary-500

// Disabled button
<Button disabled color="#9ca3af" /> // neutral-400
```

### Cards
```jsx
// Card container
<View className="bg-white border border-neutral-200 rounded-xl shadow-sm">
  {/* Content */}
</View>

// Quote banner
<View className="bg-recovery-50 border-l-4 border-recovery-500">
  <Text className="text-recovery-800">Positive message</Text>
</View>
```

### Progress Indicators
```jsx
// Progress bar
<View className="bg-neutral-200 h-2 rounded-full">
  <View className="bg-secondary-500 h-2 rounded-full" style={{width: '75%'}} />
</View>

// Status pill
<View className="bg-secondary-100 px-3 py-1 rounded-full">
  <Text className="text-secondary-800 text-xs">On Track</Text>
</View>
```

## 6️⃣ NativeWind Integration

### tailwind.config.js
```js
extend: {
  colors: {
    primary: { 50: '#f0f9ff', 100: '#e0f2fe', ..., 900: '#0c4a6e' },
    secondary: { 50: '#f0fdf4', 100: '#dcfce7', ..., 900: '#14532d' },
    recovery: { 50: '#fdf2f8', 100: '#fce7f3', ..., 900: '#831843' },
    neutral: { 50: '#f9fafb', 100: '#f3f4f6', ..., 900: '#111827' },
    success: '#10b981',
    warning: '#f59e0b',
    critical: '#ef4444',
    info: '#3b82f6'
  }
}
```

### Example Usage
```jsx
// Tabs
<Tabs.Screen
  options={{
    tabBarActiveTintColor: '#0ea5e9', // primary-500
    tabBarInactiveTintColor: '#6b7280' // neutral-500
  }}
/>

// Cards
<View className="bg-white border border-neutral-200 rounded-xl p-4">
  <Text className="text-neutral-900 font-semibold">{medicine.name}</Text>
  <Text className="text-secondary-600 mt-2">Next dose: {nextTime}</Text>
</View>

// Buttons
<Button
  title="Save"
  color="#22c55e" // secondary-500
  className="bg-secondary-500"
/>

// Status indicators
<View className="flex-row items-center">
  <View className="w-3 h-3 rounded-full bg-success mr-2" />
  <Text className="text-success">Recovery on track</Text>
</View>
```

## 7️⃣ Accessibility

- **No Pure Black**: Uses `#111827` (neutral-900) instead of `#000000`
- **Readable Contrast**: Text colors tested for WCAG AA compliance
- **Elderly-Friendly**: Larger text sizes, high contrast ratios
- **Low-Light Friendly**: Soft colors suitable for hospital environments

## 8️⃣ Emotional Support

**Color Psychology**:
- **Sky Blue (primary)**: Trust, calmness, professionalism
- **Green (secondary)**: Healing, growth, progress
- **Soft Pink (recovery)**: Comfort, care, emotional support
- **Warm Grays (neutral)**: Stability, reliability

**Usage Guidelines**:
- Use primary colors for main actions and navigation
- Use secondary colors for positive feedback and progress
- Use recovery colors for emotional support messages
- Avoid harsh reds - use critical color sparingly
- Maintain consistent contrast for readability

## 🌙 Dark Mode (Optional)

```js
// tailwind.config.js dark mode extension
darkMode: 'class',
theme: {
  extend: {
    colors: {
      dark: {
        background: '#0f172a', // slate-950
        surface: '#1e293b', // slate-800
        text: '#f1f5f9', // slate-50
        primary: '#60a5fa', // blue-400
        secondary: '#4ade80', // green-400
      }
    }
  }
}
```

## 🎯 Implementation Notes

- **Consistency**: Use semantic color names (`primary-500` not hex codes)
- **Contrast**: Always test text contrast ratios
- **Hierarchy**: Use color to guide attention (primary > secondary > neutral)
- **Feedback**: Use status colors appropriately (green=success, amber=warning)
- **Accessibility**: Ensure all interactive elements have sufficient contrast
