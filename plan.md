# Frontend

SSR and SPA with [AlephJS](https://alephjs.org/) because:
- Nice SSR
- Really nice SPA link stuff
- Easy framework overall
- Easy locale translating stuff
- It can export to static pages, for use with possibly [tauri](https://tauri.studio/en/)

## Style

Options are:
- Tailwind css
- Material UI 
- Bootstrap

## Aditional notes

- [Fresh](https://github.com/lucacasonato/fresh)
  - (good) Uses preact
  - (good) Doesn't even ship JS by default to the browser
  - (bad) Needs a server, so no static hosting
  - (bad) Not as fancy as alephjs, more "do yourself" stuff.

# Backend

Requirements:
- JWT
- SQL (sqlite?)

## Possible libraries?

- [Fresh](https://github.com/lucacasonato/fresh)
  - (good) Has a pretty nice way to handle requests with the web `Request` and `Response` APIs.
  - (good) Very close to the Native API.
  - (bad) No middleware support.
- [Oak](https://oakserver.github.io/oak/)
  - Kinda similar to ExpressJS
  - A big community with middlewares for many things.
- [TinyHTTP](https://deno.land/x/tinyhttp@0.1.24)/[Opine](https://deno.land/x/opine@1.9.0)
  - Very much like ExpressJS

# Database

- [MongoDB is Web Scale](https://www.youtube.com/watch?v=b2F-DItXtZs)
- sqlite
  - Easy to host 
- PostgreSQL
  - Actual production database 
  - Array support omg
