# Installed Lib

AI-SDK provides many components we can use for Chat. [here](https://ai-sdk.dev/elements/examples/chatbot) is an example I am using for.

## How to install [ai-sdk elements](https://ai-sdk.dev/elements)
```sh
npx shadcn@latest add @ai-elements/all
```

## Issues
the above command cannot install the ai-elements to ./app/components folder, instead of to ./components folder.

even I changed the components.json config file
```json
"aliases": {
    "components": "@/app/components",
    "utils": "@/app/utils",
    "ai-elements": "@app/components/ai-elements",
    "ui": "@app/components/ui",
    "hooks": "@/app/hooks"
  }
```
### solution
if wnat to deploy to cloud, we can create one more move_compoents.tsx file to do `postinstall`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "postinstall": "node scripts/move-components.js"
  }
}
```