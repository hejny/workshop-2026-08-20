[x] by OpenAI Codex `gpt-5.6-luna` thinking `low` (ChatGPT account) - Implementation ~$0.0864 a minute; Testing a few seconds

[✨🏛] Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
> promptbook-starter@0.1.0 test
> npm run lint && npm run typecheck


> promptbook-starter@0.1.0 lint
> eslint .


> promptbook-starter@0.1.0 typecheck
> tsc --noEmit

.next/types/validator.ts(62,39): error TS2307: Cannot find module '../../app/api/assistant/route.js' or its corresponding type declarations.
[1]-  Exit 2                  bash "$1"
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

