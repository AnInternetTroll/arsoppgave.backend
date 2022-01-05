Routes are super simple. With the magic of regex and a pinch of recursion we can auto generate paths on the go.

# How to add a new path
In `src/routes/mod.ts` there's a helper function called `readDir`. This function will look into the given folder and find routes. A route is a js or ts file that exports a default object like this one 

```js
export default {
    GET(ctx) {
        ctx.response.body = "Hello, world";
    }
}
```
The keys of the object are the HTTP verb it will use. Available verbs are "GET", "POST", "PATCH", and "DELETE"

If a file's name is `hello.ts` the `readDir` function will make it into a `/hello`

If a file's name is `[id].ts` the `readDir` function will make it into a `/:id` path, where `id` is anything and it will appear in the code under `ctx.params.id`.

If a file's name is `index.ts` the `readDir` function will make it into a `/` path.

