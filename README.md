# 🚀 create-nitro-project

> The fastest way to scaffold production-grade React Native Nitro Modules.

Welcome to **create-nitro-project**! This CLI automates the setup of high-performance, type-safe native modules using [Nitro](https://nitro.margelo.com), so you can skip the boilerplate and focus on building features. ⚡️

## ⚡️ Why Nitro?

Nitro Modules represent the next evolution in React Native native modules:
- **Zero Overhead**: Built on JSI for synchronous, bridge-less communication.
- **Type-Safe**: End-to-end type safety from TypeScript to C++, Swift, and Kotlin.
- **Modern**: No old-school bridge, no unecessary complexity.

## ✨ Features

- **🚀 Instant Setup**: scaffolding a fully configured monorepo in seconds.
- **🌐 Cross-Platform**: First-class support for **Android**, **iOS**, **macOS**, and **Windows**.
- **🛠️ Multi-Language**:
  - **Android**: Kotlin (default) or C++.
  - **iOS**: Swift (default) or C++.
- **📐 Smart Templates**:
  - **Minimal**: A lightweight starting point.
  - **Full**: Includes a test suite, benchmarks, and navigation.
- **💎 Premium DX**:
  - **Monorepo**: Built with Bun/NPM workspaces.
  - **Linting**: Pre-configured **ESLint** and **Prettier**.
  - **Git Hooks**: **Husky** set up for pre-commit checks.
  - **Autolinking**: Automatic Podspec generation with PascalCase naming.

## 📦 Prerequisites

Before you start, make sure you have:
- **Node.js 18+** or **Bun 1.0+**
- **Xcode** (for iOS/macOS)
- **Android Studio** (for Android)

## 🛠 Usage

Run the CLI directly with `npx` or `bun`:

```bash
npx create-nitro-project@latest
# or
bun create nitro-project
```

### Interactive Mode
The CLI will guide you through the setup:
1. **Project Name**: Name your module.
2. **Languages**: Choose Kotlin/C++ and Swift/C++.
3. **Addons**: Select extra platforms like macOS or Windows.
4. **Example App**: Choose between a minimal or full example app.

### Command Line Arguments
Skip the prompts by passing arguments directly:

```bash
npx create-nitro-project MyFastModule \
  --android kotlin \
  --ios swift \
  --addon macos windows
```

**Options:**
- `-n, --name <name>`: Project name
- `--android <lang>`: `kotlin` or `cpp`
- `--ios <lang>`: `swift` or `cpp`
- `--addon <list>`: Space-separated list of addons (e.g., `macos windows`)

## 📂 Project Structure

Your project is set up as a scalable monorepo:

```
MyFastModule/
├── packages/
│   └── my-fast-module/       # 📦 Your Nitro Module code
│       ├── src/              # TypeScript / C++ source
│       ├── android/          # Native Android code
│       ├── ios/              # Native iOS code
│       └── nitro.json        # Generator config
├── example/                  # 📱 Runnable React Native app
├── node_modules/             # Shared dependencies
└── package.json              # Workspace root
```

## 🚀 Workflow

1. **Define your API** in `src/specs/MyModule.nitro.ts`.
2. **Generate bindings** by running:
   ```bash
   bun run build
   ```
3. **Implement the native logic** in `android/` and `ios/`.
4. **Test it** in the example app:
   ```bash
   bun run example start
   ```

## 👏 Acknowledgements

Fully inspired by the [react-native-quick-crypto](https://github.com/margelo/react-native-quick-crypto) structure which is maintained by [boorad](https://github.com/boorad).

## 📄 License

MIT © [Athex Web3](https://github.com/athexweb3)

---
*Built with ❤️ for the React Native community.*
