# VS Code Debugging Guide for Next.js

This guide explains how to debug your Next.js application step-by-step in VS Code, similar to Python debugging.

## Prerequisites

1. **VS Code Extensions** (usually auto-installed):
   - JavaScript Debugger (built-in)
   - TypeScript support (built-in)

2. **Install if needed**:
   ```bash
   # No additional packages needed! VS Code has built-in support.
   ```

## Quick Start

### Method 1: Debug Server-Side Code (API Routes, Server Components)

1. **Set a breakpoint** in your code:
   - Open any file (e.g., `app/api/chat/route.ts`)
   - Click in the gutter (left of line numbers) to set a breakpoint (red dot)

2. **Start debugging**:
   - Press `F5` or click the "Run and Debug" icon in the sidebar
   - Select **"Next.js: debug server-side"**
   - Click the green play button

3. **Trigger the code**:
   - The dev server will start automatically
   - Visit `http://localhost:3000` in your browser
   - When your API route is hit, execution will pause at your breakpoint

4. **Debug controls**:
   - **F10** - Step Over (execute current line)
   - **F11** - Step Into (enter function)
   - **Shift+F11** - Step Out (exit function)
   - **F5** - Continue
   - **Shift+F5** - Stop debugging

### Method 2: Debug Client-Side Code (React Components)

1. **Set a breakpoint** in a client component:
   - Open a file like `app/customs/chat-interface/chat-input-window-main.tsx`
   - Set breakpoints in event handlers or useEffect

2. **Start debugging**:
   - Select **"Next.js: debug client-side"** from debug dropdown
   - Press `F5`

3. **Debug in browser**:
   - Chrome will open automatically
   - Execution will pause at breakpoints in your React code

### Method 3: Debug Full Stack (Recommended)

1. **Select "Next.js: debug full stack (server + client)"**
2. **Press F5**
3. Both server and client debugging will start
4. Set breakpoints in both API routes and React components

## Debug Configurations Explained

### Available Configurations

| Configuration | What It Does | When to Use |
|--------------|--------------|-------------|
| **Next.js: debug server-side** | Debugs API routes, server components | When debugging backend logic |
| **Next.js: debug client-side** | Debugs React components in browser | When debugging UI/frontend |
| **Next.js: debug full stack** | Both server and client | Most common - debug everything |
| **Next.js: attach to server** | Attach to running dev server | When server is already running |
| **Debug API Route (Current File)** | Debug specific API route | Focused API debugging |

## Step-by-Step Debugging Example

### Example: Debug API Route

1. **Open the file**:
   ```
   app/api/chat/route.ts
   ```

2. **Set breakpoint** at line 27 (or any line):
   ```typescript
   const messages = body.messages as UIMessage[]; // ← Click here to set breakpoint
   ```

3. **Start debugging**:
   - Press `F5`
   - Select "Next.js: debug server-side"

4. **Trigger the endpoint**:
   - Go to `http://localhost:3000/chat`
   - Send a message
   - VS Code will pause at your breakpoint

5. **Inspect variables**:
   - Hover over `messages` to see its value
   - Check the "Variables" panel on the left
   - Use "Watch" panel to add expressions

6. **Step through code**:
   - Press `F10` to step over each line
   - Press `F11` to step into functions
   - Press `F5` to continue

### Example: Debug React Component

1. **Open**:
   ```
   app/customs/chat-interface/chat-input-window-main.tsx
   ```

2. **Set breakpoint** in `handleSubmit`:
   ```typescript
   const handleSubmit = (message: PromptInputMessage) => {
     const hasText = Boolean(message.text); // ← Set breakpoint here
     // ...
   }
   ```

3. **Start debugging**:
   - Select "Next.js: debug client-side"
   - Press `F5`

4. **Trigger the code**:
   - Chrome opens automatically
   - Submit a message in the chat
   - Execution pauses at your breakpoint

## Advanced Debugging Features

### 1. Conditional Breakpoints

Right-click on a breakpoint → "Edit Breakpoint" → Add condition:
```javascript
messages.length > 0 && messages[0].role === 'user'
```

### 2. Logpoints (No Break, Just Log)

Right-click on line → "Add Logpoint":
```javascript
Message received: {message.text}, Count: {messages.length}
```

### 3. Watch Expressions

In the "Watch" panel, add expressions:
```typescript
selectedModel
messages.filter(m => m.role === 'user').length
body.webSearch
```

### 4. Call Stack

See the execution path:
- View → Call Stack
- Click any frame to navigate to that code

### 5. Debug Console

Type JavaScript expressions:
```javascript
console.log(messages)
messages.length
selectedModel
```

## Debugging Tips

### 1. Debug MCP Client

Set breakpoint in `app/utils/mcp-client.ts`:
```typescript
export async function callMCPTool(name: string, args: Record<string, any>) {
  await ensureInitialized(); // ← Set breakpoint here
  // ...
}
```

### 2. Debug File Uploads

Set breakpoint in `app/api/mcp/upload/route.ts`:
```typescript
export async function POST(req: NextRequest) {
  const file = formData.get('file') as File; // ← Debug here
  // ...
}
```

### 3. Debug Chat Route

Set breakpoint in `app/api/chat/route.ts`:
```typescript
const mcpToolSelection = await selectMCPToolsForQuery(userQuery); // ← Debug here
```

## Troubleshooting

### Breakpoints Not Hitting

1. **Check source maps are enabled**:
   - `next.config.mjs` should have webpack config (already added)
   
2. **Verify file path**:
   - Breakpoints only work in actual source files
   - Not in `.next` build folder

3. **Restart debugger**:
   - Stop debugging (Shift+F5)
   - Restart (F5)

4. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

### "Cannot connect to runtime process"

1. **Check port 3000 is free**:
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Check dev server is running**:
   - The debugger should start it automatically
   - Or start manually: `npm run dev`

### Client-side breakpoints not working

1. **Check Chrome DevTools**:
   - Open DevTools (F12)
   - Go to Sources tab
   - Verify source maps are loaded

2. **Verify webpack source maps**:
   - Check `next.config.mjs` has webpack config

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F5` | Start/Continue debugging |
| `Shift+F5` | Stop debugging |
| `Ctrl+Shift+F5` | Restart debugging |
| `F9` | Toggle breakpoint |
| `F10` | Step Over |
| `F11` | Step Into |
| `Shift+F11` | Step Out |
| `Ctrl+Shift+F9` | Remove all breakpoints |

## Debugging with Environment Variables

Create `.env.local`:
```env
NODE_ENV=development
MCP_SERVER_URL=http://localhost:8080/mcp
DATABASE_URL=your_database_url
```

VS Code will automatically load these when debugging.

## Example Debug Session

1. **Set breakpoint** in `app/api/chat/route.ts` line 27
2. **Press F5** → Select "Next.js: debug server-side"
3. **Open browser** → `http://localhost:3000/chat`
4. **Send a message** → Execution pauses
5. **Inspect** `messages` variable
6. **Step through** with F10
7. **Watch** `selectedModel` value change
8. **Continue** with F5

## Additional Resources

- [VS Code Debugging Documentation](https://code.visualstudio.com/docs/editor/debugging)
- [Next.js Debugging Guide](https://nextjs.org/docs/advanced-features/debugging)
- [TypeScript Debugging](https://code.visualstudio.com/docs/typescript/typescript-debugging)

Happy debugging! 🐛🔍

