[x] by OpenAI Codex `gpt-5.6-luna` thinking `medium` (ChatGPT account) - Implementation ~$0.1281 2 minutes; Testing a few seconds

[✨🪣] Fix the existing test failures before implementing any queued coding tasks.

The verification command `npm run test` failed before coding started. Fix the underlying failure without weakening or removing the tests, and leave the project ready for the remaining coding prompts.

## Verification output

```
> promptbook-starter@0.1.0 test
> npm run lint && npm run typecheck


> promptbook-starter@0.1.0 lint
> eslint .


Oops! Something went wrong! :(

ESLint: 9.39.5

TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    |     property 'configs' -> object with constructor 'Object'
    |     property 'flat' -> object with constructor 'Object'
    |     ...
    |     property 'plugins' -> object with constructor 'Object'
    --- property 'react' closes the circle
Referenced from: 
    at JSON.stringify (<anonymous>)
    at file:///Users/hejny/work/tmp/workshop-2026-08-20/node_modules/@eslint/eslintrc/lib/shared/config-validator.js:308:45
    at Array.map (<anonymous>)
    at ConfigValidator.formatErrors (file:///Users/hejny/work/tmp/workshop-2026-08-20/node_modules/@eslint/eslintrc/lib/shared/config-validator.js:299:23)
    at ConfigValidator.validateConfigSchema (file:///Users/hejny/work/tmp/workshop-2026-08-20/node_modules/@eslint/eslintrc/lib/shared/config-validator.js:330:84)
    at ConfigArrayFactory._normalizeConfigData (file:///Users/hejny/work/tmp/workshop-2026-08-20/node_modules/@eslint/eslintrc/lib/config-array-factory.js:676:19)
    at ConfigArrayFactory._loadConfigData (file:///Users/hejny/work/tmp/workshop-2026-08-20/node_modules/@eslint/eslintrc/lib/config-array-factory.js:641:21)
    at ConfigArrayFactory._loadExtendedShareableConfig (file:///Users/hejny/work/tmp/workshop-2026-08-20/node_modules/@eslint/eslintrc/lib/config-array-factory.js:946:21)
    at ConfigArrayFactory._loadExtends (file:///Users/hejny/work/tmp/workshop-2026-08-20/node_modules/@eslint/eslintrc/lib/config-array-factory.js:814:25)
    at ConfigArrayFactory._normalizeObjectConfigDataBody (file:///Users/hejny/work/tmp/workshop-2026-08-20/node_modules/@eslint/eslintrc/lib/config-array-factory.js:752:25)
[1]-  Exit 2                  bash "$1"
```

-   Keep in mind the DRY _(don't repeat yourself)_ principle.
-   Do a proper analysis of the current functionality before you start implementing.
-   Add the changes into the [changelog](CHANGELOG.md)
-   Update the [README](README.md) if needed.
-   Update the [AGENTS.md](AGENTS.md) for the next job to be done if it makes sense.

