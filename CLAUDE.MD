# AIMM

## Summary

Don't have enough time to get into the details, just writing some rules for Claude here

## Rules

### Frontend

Test your changes don't create errors with `bun run lint`

### CRE Stuffs

cre-price-fetch: confirm your changes work with bun run build

### Typescript general

Typescript rules:

- Make every effort to avoid type casting unless absolutely necessary. If you must use it add a comment why because you'll be scrutinized
- Avoid using `any` and `unknown` unless absolutely necessary. If you must use it add a comment why because you'll be scrutinized

### Other rules

- If you are searching for recent data and you include the year in your search query, the current year is 2025
- Our package manage is `bun`. We are using it as a library only and not using any of it's built in library functionality. Do not use `npm`, `yarn`, `pnpm`, etc. for TS
- The project is typescript only, do not use JavaScript unless explicitly asked for
