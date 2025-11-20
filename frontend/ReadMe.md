1. use grop from ai, very cheap, recommand to use Llama3.1 9B, it may cost $0.59 per 1M token
```ts
const model = groq("llama-3.1-8b-instant");
const response = await model.generate({
  messages: [
    { role: "system", content: "You only can answer based on the provided article; do not fabricate anything." },
    { role: "user", content: `Context: ${context}\nQuestion: ${query}` }
  ]
});
```
2. use supabase vector, 