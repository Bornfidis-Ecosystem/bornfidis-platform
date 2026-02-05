# Admin API

All admin routes are **dynamic by design** (auth + cookies). Each route file declares:

```ts
export const dynamic = "force-dynamic";
```

Do not remove this—it tells Next.js not to prerender these routes and avoids "Dynamic server usage" build warnings while keeping behavior correct.
