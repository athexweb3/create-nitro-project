# create-nitro-project

[![Test CLI](https://github.com/athexweb3/create-nitro-project/actions/workflows/test-cli.yml/badge.svg)](https://github.com/athexweb3/create-nitro-project/actions/workflows/test-cli.yml)

> The fastest way to scaffold production-grade React Native Nitro Modules.

Hey there! Welcome to **create-nitro-project**. 

If you're looking to build high-performance native modules for React Native without the headache, you're in the right place. This CLI handles all the boring setup so you can focus on the fun part—writing C++, Swift, or Kotlin code that runs blazing fast.

## Why Nitro?

Nitro Modules are the next big thing. Seriously.
- **Zero Overhead**: No bridge. Just direct, synchronous calls via JSI.
- **Type-Safe**: We generate bindings for you. TypeScript <-> Native. No guesswork.
- **Modern**: Built for the future of React Native (Bridge-less).

## Features

- **Instant Scaffolding**: One command, and you have a full monorepo ready to go.
- **Cross-Platform**: Android, iOS, macOS, Windows? We got you.
- **Your Language, Your Choice**:
  - **Android**: Love Kotlin? Go for it. Need raw C++ power? We support that too.
  - **iOS**: Swift by default, but fully C++ compatible.
- **Premium DX**:
  - **Monorepo**: Smart setup with Bun/NPM workspaces.
  - **Linting**: Pre-configured ESLint & Prettier. No bike-shedding.
  - **Example App**: Comes with a working app to test your module immediately.

## Prerequisites

Just make sure you have the basics:
- **Node.js 18+** or **Bun 1.0+**
- **Xcode** (for iOS/macOS dev)
- **Android Studio** (for Android dev)

## Usage

We made this super easy. Just run:

```bash
npx create-nitro-project@latest
# or if you prefer Bun (we do!)
bun create nitro-project
```

### Interactive Mode
The CLI is friendly! It will ask you a few questions:
1. **Name**: What do you want to call your cool module?
2. **Languages**: Kotlin or C++? Swift or C++?
3. **Addons**: Need macOS support? Just check the box.

### For CI / Robots
Want to skip the chat? You can pass arguments directly:

```bash
npx create-nitro-project MyFastModule \
  --android kotlin \
  --ios swift \
  --addon macos windows \
  --author "Your Name" \
  --author-url "https://github.com/you" \
  --repo-url "https://github.com/you/repo"
```

## What Do You Get?

A clean, modern monorepo structure:

```
MyFastModule/
├── packages/
│   └── my-fast-module/       # Here is your code!
│       ├── src/              # TypeScript specs
│       ├── android/          # Native Android implementation
│       ├── ios/              # Native iOS implementation
│       └── nitro.json        # Generator config
├── example/                  # Run this to test your changes
├── node_modules/             # Dependencies
└── package.json              # Workspace root
```

## How to Develop

1. **Define your API** in `src/specs/MyModule.nitro.ts`.
2. **Generate bindings**:
   ```bash
   bun run build
   ```
3. **Write Native Code**: Implement the interface in `android/` and `ios/`.
4. **Run the Example**:
   ```bash
   bun run example start
   ```

## Acknowledgements

Huge shoutout to [margelo/react-native-quick-crypto](https://github.com/margelo/react-native-quick-crypto) for the inspiration and [boorad](https://github.com/boorad) for the groundwork.

## License

MIT © [Athex Web3](https://github.com/athexweb3)

---
*Built with love for the React Native community.*
