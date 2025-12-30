# RedM Resource Factory 🏭

A powerful monorepo boilerplate for rapidly creating high-quality RedM resources with C# backends and React frontends.

## 🌟 Features

- **🚀 One-Command Generation**: Scaffold complete resources with `pnpm run gen "resourcename"`
- **🎨 Shared UI Kit**: Reusable React components with TailwindCSS styling
- **⚙️ Automated Builds**: C# DLLs automatically copy to the correct location
- **🔄 Hot Reload**: Vite dev server for rapid UI development
- **📦 Monorepo Structure**: Organized workspace with pnpm
- **🎯 Type Safety**: Full TypeScript support across the frontend
- **🔗 NUI Integration**: Pre-built hooks for C# ↔ React communication

## 📁 Project Structure

```
RedM-Projects/
├── packages/
│   └── ui-kit/                    # Shared React components
│       ├── src/
│       │   ├── RedButton.tsx
│       │   └── index.ts
│       └── tailwind.config.js
│
├── apps/                          # Generated UI applications
│   └── [resource-name]-ui/        # React + Vite frontend
│
├── resources/                     # Complete RedM resources
│   └── [resource-name]-core/      # C# backend + compiled UI
│       ├── bin/                   # Compiled DLLs (auto-generated)
│       ├── web/                   # Built UI (auto-generated)
│       ├── Client/
│       ├── Server/
│       └── fxmanifest.lua
│
├── _templates/                    # Base templates for generation
│   ├── ui/                        # React template
│   └── core/                      # C# template
│
└── scripts/
    └── generate.js                # Resource generator script
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **.NET Framework 4.8 SDK** or **Visual Studio 2022**
- **RedM Server** (for testing)

### Initial Setup

1. **Clone or use this repository**

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **You're ready to generate resources!**

## 🎯 Usage

### Generating a New Resource

```bash
pnpm run gen "blacksmith"
```

This command will:
- ✅ Create `apps/blacksmith-ui` (React frontend)
- ✅ Create `resources/blacksmith-core` (C# backend)
- ✅ Rename all files and classes to match "Blacksmith"
- ✅ Configure Vite to build UI into the resource folder
- ✅ Set up C# projects to output DLLs to `bin/`
- ✅ Install dependencies automatically

### Building the UI

```bash
# Navigate to the UI app
cd apps/blacksmith-ui

# Development mode (hot reload)
pnpm run dev

# Production build (outputs to resources/blacksmith-core/web)
pnpm run build
```

### Building the C# Backend

**Option 1: Visual Studio**
```bash
cd resources/blacksmith-core
# Open Blacksmith.sln in Visual Studio
# Press F6 or Build → Build Solution
```

**Option 2: Command Line**
```bash
cd resources/blacksmith-core
dotnet build
```

The compiled DLLs will automatically be copied to `resources/blacksmith-core/bin/` with the correct names:
- `Blacksmith.Client.net.dll`
- `Blacksmith.Server.net.dll`

### Deploying to RedM

1. **Build both UI and C# backend** (see above)
2. **Copy the complete resource folder:**
   ```bash
   cp -r resources/blacksmith-core /path/to/redm/resources/
   ```
3. **Add to server.cfg:**
   ```cfg
   ensure blacksmith-core
   ```
4. **Start your server!**

## 🏗️ Architecture

### Frontend → Backend Communication

**React (Frontend) calls C#:**

```typescript
// In your React component
import { fetchNui } from './utils/fetchNui';

const response = await fetchNui('myAction', { 
  data: 'hello' 
});
```

**C# (Backend) receives:**

```csharp
// In ClientMain.cs
API.RegisterNuiCallbackType("myAction");

EventHandlers["__cfx_nui:myAction"] += new Action<IDictionary<string, object>, CallbackDelegate>((data, callback) => {
    // Process the action
    callback(new { status = "success" });
});
```

### Backend → Frontend Communication

**C# (Backend) sends to React:**

```csharp
// In ClientMain.cs
API.SendNuiMessage(Newtonsoft.Json.JsonConvert.SerializeObject(new {
    action = "updateData",
    data = new { message = "Hello from C#!" }
}));
```

**React (Frontend) receives:**

```typescript
// In your React component
import { useNuiEvent } from './hooks/useNuiEvent';

useNuiEvent<{ message: string }>('updateData', (data) => {
  console.log(data.message); // "Hello from C#!"
});
```

## 📦 Shared UI Kit

All generated resources automatically include the shared UI kit with pre-built components:

```typescript
import { RedButton } from '@project/ui-kit';

<RedButton variant="primary" onClick={handleClick}>
  Click Me
</RedButton>
```

Available variants:
- `primary` - Red accent color
- `secondary` - Gray color
- `danger` - Dark red color

### Extending the UI Kit

Add new components to `packages/ui-kit/src/`:

```typescript
// packages/ui-kit/src/RedInput.tsx
export const RedInput = ({ ... }) => {
  // Your component
};

// packages/ui-kit/src/index.ts
export { RedInput } from './RedInput';
```

All generated resources will have access to the new component after running `pnpm install`.

## 🎨 Styling

The boilerplate uses **TailwindCSS** with a custom RedM color palette:

```typescript
// Available Tailwind classes
className="bg-redm-red-600 text-white hover:bg-redm-red-700"
```

Custom colors: `redm-red-50` through `redm-red-900`

## 🔧 Advanced Configuration

### Customizing the Templates

Edit the base templates in `_templates/`:

- **C# Template**: `_templates/core/`
- **React Template**: `_templates/ui/`

All future generated resources will use your customized templates.

### Adding NuGet Packages

Edit the `.csproj` files in your generated resource:

```xml
<ItemGroup>
  <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
</ItemGroup>
```

### Adding npm Packages

```bash
cd apps/blacksmith-ui
pnpm add package-name
```

## 🐛 Troubleshooting

### DLLs not found in RedM

**Problem**: `fxmanifest.lua` can't find the DLLs

**Solution**: 
1. Ensure you've built the C# projects
2. Check that `bin/` folder exists in the resource root
3. Verify DLL names match what's in `fxmanifest.lua`

### UI not loading

**Problem**: Blank screen or 404 errors

**Solution**:
1. Build the UI: `cd apps/resource-ui && pnpm run build`
2. Check that `web/` folder exists in the resource
3. Verify `ui_page` path in `fxmanifest.lua`

### Shared UI Kit not found

**Problem**: `Cannot find module '@project/ui-kit'`

**Solution**:
```bash
# From the root directory
pnpm install
```

### Build errors in Visual Studio

**Problem**: CitizenFX.Core not found

**Solution**:
1. Right-click solution → "Restore NuGet Packages"
2. Or install manually: `dotnet restore`

## 📝 Example Resources

### Example 1: Simple Notification System

**Generate:**
```bash
pnpm run gen "notify"
```

**Use:**
- Trigger from server: `TriggerClientEvent("notify", player, "Hello!")`
- Display in React UI with animations

### Example 2: Inventory System

**Generate:**
```bash
pnpm run gen "inventory"
```

**Features:**
- C# backend manages item data
- React displays drag-and-drop interface
- Real-time updates via NUI events

## 🤝 Contributing

This is a boilerplate for your projects! Customize it to fit your needs:

1. Modify templates in `_templates/`
2. Extend the shared UI kit in `packages/ui-kit/`
3. Add helper utilities to the generator script

## 📄 License

MIT - Use this however you want!

## 🙏 Credits

Built for the RedM development community using:
- [CitizenFX.Core](https://github.com/citizenfx/fivem)
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [pnpm](https://pnpm.io)

---

**Happy coding! 🎉**

Need help? Check the `_templates/` folder for examples of working code.

