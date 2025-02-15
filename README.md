<p align="center">
  <a href="https://heroui.com">
      <img width="20%" src="https://raw.githubusercontent.com/heroui-inc/heroui/main/apps/docs/public/isotipo.png" alt="heroui (previously nextui)" />
      <h1 align="center">HeroUI CLI (Previously NextUI CLI)</h1>
  </a>
</p>
</br>
<p align="center">
  <a href="https://github.com/heroui-inc/heroui-cli/blob/main/license">
    <img src="https://img.shields.io/npm/l/@heroui-inc/heroui?style=flat" alt="License">
  </a>
  <a href="https://www.npmjs.com/package/heroui-cli">
    <img src="https://img.shields.io/npm/dm/heroui-cli.svg?style=flat-round" alt="npm downloads">
  </a>
</p>

The CLI offers a comprehensive suite of commands to initialize, manage, and improve your HeroUI projects. It enables you to `add`, `remove`, or `upgrade` individual components, assess the health of your project, and more.

## Quick Start

> **Note**: The HeroUI CLI requires [Node.js](https://nodejs.org/en) _18.17.x+_ or later

You can choose the following ways to start the HeroUI CLI.

### Npx

```bash
npx heroui-cli@latest
```

### Global Installation

```bash
npm install -g heroui-cli
```

## Usage

```bash
Usage: heroui [command]

Options:
  -v, --version                      Output the current version
  --no-cache                         Disable cache, by default data will be cached for 30m after the first request
  -d, --debug                        Debug mode will not install dependencies
  -h --help                          Display help information for commands

Commands:
  init [options] [projectName]       Initializes a new project
  add [options] [targets...]         1. Adds components to your project
                                     2. Adds hero chat codebase to your project
  upgrade [options] [components...]  Upgrades project components to the latest versions
  remove [options] [components...]   Removes components from the project
  list [options]                     Lists all components, showing status, descriptions, and versions
  env [options]                      Displays debugging information for the local environment
  doctor [options]                   Checks for issues in the project
  help [command]                     Display help for command
```

## Commands

### Init

Initialize a new HeroUI project with official templates.

```bash
heroui init [projectName] [options]
```

#### Init Options

- `-t --template [string]` The template to use for the new project e.g. app, pages, vite
- `-p --package [string]` The package manager to use for the new project (default: `npm`)

##### Example

```bash
# Initialize a new HeroUI project with the app template, named my-heroui-app
heroui init my-heroui-app -t app
```

output:

```bash
HeroUI CLI v0.2.1

┌  Create a new project
│
◇  Select a template (Enter to select)
│  ● App (A Next.js 14 with app directory template pre-configured with HeroUI (v2) and Tailwind CSS.)
│  ○ Pages (A Next.js 14 with pages directory template pre-configured with HeroUI (v2) and Tailwind CSS.)
│  ○ Vite (A Vite template pre-configured with HeroUI (v2) and Tailwind CSS.)
│
◇  New project name (Enter to skip with default name)
│  my-heroui-app
│
◇  Select a package manager (Enter to select)
│  ● npm
│  ○ yarn
│  ○ pnpm
│  ○ bun
│
◇  Template created successfully!
│
◇  Next steps ───────╮
│                    │
│  cd my-heroui-app  │
│  npm install       │
│                    │
├────────────────────╯
│
└  🚀 Get started with npm run dev
```

### Add

1. Add HeroUI components to your project.
2. Add Hero Chat codebase to your project.

#### Features

> 1. Auto add the missing required `dependencies` to your project
> 2. Auto add the required `tailwindcss.config.js` configuration to your project
> 3. Detect whether using pnpm, if so, add the required configuration to your `.npmrc` file
> 4. Add Hero Chat codebase to your project

```bash
heroui add [targets...] [options]
```

#### Add Options

- `-a --all` [boolean] Add all components (default: `false`)
- `-p --packagePath` [string] The path to the package.json file
- `-tw --tailwindPath` [string] The path to the tailwind.config file file
- `-app --appPath` [string] The path to the App.tsx file
- `--prettier` [boolean] Add prettier format in the add content which required installed prettier - (default: `false`)
- `--addApp` [boolean] Add App.tsx file content which required provider (default: `false`)
- `-b --beta` [boolean] Add beta components (default: `false`)
- `--directory` [string] Add hero chat codebase to a specific directory

##### Example

Without setting a specific component, the `add` command will show a list of available components.

```bash
heroui add
```

Output:

```bash
HeroUI CLI v0.2.1

? Which components would you like to add? › - Space to select. Return to submit
Instructions:
    ↑/↓: Highlight option
    ←/→/[space]: Toggle selection
    [a,b,c]/delete: Filter choices
    enter/return: Complete answer

Filtered results for: Enter something to filter

◉  accordion
◯  autocomplete
◯  avatar
◯  badge
◯  breadcrumbs
◯  button
◯  card
◯  checkbox
◯  chip
◯  code
```

If you want to add a specific component, you can specify the component name.

```bash
heroui add button
```

Output:

```bash
HeroUI CLI v0.2.1

Adding the required dependencies: @heroui/button

pnpm add @heroui/button
Packages: +1
+
Progress: resolved 470, reused 462, downloaded 0, added 0, done

dependencies:
+ @heroui/button 2.0.24

Done in 3.4s

Tailwind CSS settings have been updated in: /project-path/tailwind.config.js

✅ Components added successfully
```

### Upgrade

Upgrade the HeroUI components to the latest version.

```bash
heroui upgrade [components...] [options]
```

#### Upgrade Options

- `-p --packagePath` [string] The path to the package.json file
- `-a --all` [boolean] Upgrade all the HeroUI components (default: `false`)
- `-w --write` [boolean] Write the upgrade version to package.json file (default: `false`)
- `-b --beta` [boolean] Upgrade beta components (default: `false`)
- `-h --help` Display help for command

##### Example

Upgrade the **Button** component to the latest version.

```bash
heroui upgrade button
```

Output:

```bash
HeroUI CLI v0.2.1

╭───────────────────────── Component ─────────────────────────╮
│  @heroui/button              ^2.0.11  ->  ^2.0.31       │
╰─────────────────────────────────────────────────────────────╯

Required min version: @heroui/theme>=2.1.0, tailwindcss>=3.4.0, react>=18.3.1, react-dom>=18.3.1
╭───────────────────── PeerDependencies ─────────────────────╮
│  @heroui/theme               2.0.1    ->  2.1.0        │
│  tailwindcss                     ^3.2.3   ->  ^3.4.0       │
│  react                           Missing  ->  18.3.1       │
│  react-dom                       Missing  ->  18.3.1       │
╰────────────────────────────────────────────────────────────╯
2 major, 2 minor, 1 patch

? Would you like to proceed with the upgrade? › - Use arrow-keys. Return to submit.
❯   Yes
    No

pnpm add @heroui/button@2.0.31 @heroui/theme@2.1.0 tailwindcss@3.4.0 react@18.3.1 react-dom@18.3.1

dependencies:
- @heroui/theme 2.0.1
+ @heroui/theme 2.1.0 (2.2.3 is available)
+ react 18.3.1
+ react-dom 18.3.1

Done in 1.8s

✅ Upgrade complete. All components are up to date.
```

### Remove

Remove HeroUI components from your project.

> **Note**: If there are no HeroUI components after removing, the required content will also be removed

```bash
heroui remove [components...] [options]
```

#### Remove Options

- `-p --packagePath` [string] The path to the package.json file
- `-a --all` [boolean] Remove all the HeroUI components (default: `false`)
- `-tw --tailwindPath` [string] The path to the tailwind.config file file
- `--prettier` [boolean] Add prettier format in the add content which required installed prettier - (default: `false`)

##### Example

Remove the **Button** component from your project.

```bash
heroui remove button
```

Output:

```bash
HeroUI CLI v0.2.1

❗️ Components slated for removal:
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│   Package              │   Version              │   Status   │   Docs                                        │
│──────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│   @heroui/button   │   2.0.27 🚀latest      │   stable   │   https://heroui.com/docs/components/button   │
╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
? Confirm removal of these components: › - Use arrow-keys. Return to submit.
❯   Yes
    No

pnpm remove  @heroui/button
Already up to date
Progress: resolved 474, reused 465, downloaded 0, added 0, done

dependencies:
- @heroui/button 2.0.27

Done in 2.1s

Remove the removed components tailwind content in file:/project-path/tailwind.config.js

✅ Successfully removed the specified HeroUI components: @heroui/button
```

### List

List all the current installed components.

```bash
heroui list [options]
```

#### List Options

- `-p --packagePath` [string] The path to the package.json file
- `-r --remote` List all components available remotely

##### Example

```bash
heroui list
```

Output:

```bash
HeroUI CLI v0.2.1

Current installed components:

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│   Package                    │   Version              │   Status    │   Docs                                              │
│───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│   @heroui/autocomplete   │   2.0.10 🚀latest      │   stable    │   https://heroui.com/docs/components/autocomplete   │
│   @heroui/badge          │   2.0.24 🚀latest      │   stable    │   https://heroui.com/docs/components/badge          │
│   @heroui/button         │   2.0.27 🚀latest      │   stable    │   https://heroui.com/docs/components/button         │
│   @heroui/chip           │   2.0.25 🚀latest      │   stable    │   https://heroui.com/docs/components/chip           │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

### Doctor

Check whether exist problem in your project by using the `doctor` command.

```bash
heroui doctor [options]
```

### Features

> 1. Check whether have `redundant dependencies` in the project
> 2. Check whether the HeroUI components `required dependencies are installed` in the project
> 3. Check the required `tailwind.config.js` file and the content is correct
> 4. Check `.npmrc` is correct when using `pnpm`
> 5. Check `peerDependencies with required version` are installed in the project

#### Doctor Options

- `-p` `--packagePath` [string] The path to the package.json file
- `-tw` `--tailwindPath` [string] The path to the tailwind.config file file
- `-app` `--appPath` [string] The path to the App.tsx file
- `-ca` `--checkApp` [boolean] Open check App (default: `true`)
- `-ct` `--checkTailwind` [boolean] Open check tailwind.config file (default: `true`)
- `-cp` `--checkPnpm` [boolean] Open check Pnpm (default: `true`)

#### Example

```bash
heroui doctor
```

Output:

If there is a problem in your project, the `doctor` command will display the problem information.

```bash
HeroUI CLI v0.2.1

HeroUI CLI: ❌ Your project has 1 issue that require attention

❗️Issue 1: missingTailwind

Missing tailwind.config.(j|t)s file. To set up, visit: https://heroui.com/docs/guide/installation#tailwind-css-setup
```

Otherwise, the `doctor` command will display the following message.

```bash
HeroUI CLI v0.2.1

✅ Your project has no detected issues.
```

### Env

Display debug information about the local environment.

```bash
heroui env [options]
```

#### Env Options

- `-p --packagePath` [string] The path to the package.json file

#### Example

Display the local environment Information by using the `env` command.

```bash
heroui env
```

Output:

```bash
HeroUI CLI v0.2.1

Current installed components:

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│   Package                    │   Version              │   Status    │   Docs                                              │
│───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│   @heroui/autocomplete   │   2.0.10 🚀latest      │   stable    │   https://heroui.com/docs/components/autocomplete   │
│   @heroui/badge          │   2.0.24 🚀latest      │   stable    │   https://heroui.com/docs/components/badge          │
│   @heroui/button         │   2.0.27 🚀latest      │   stable    │   https://heroui.com/docs/components/button         │
│   @heroui/chip           │   2.0.25 🚀latest      │   stable    │   https://heroui.com/docs/components/chip           │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯

Environment Info:
  System:
    OS: darwin
    CPU: arm64
  Binaries:
    Node: v18.18.2
```

## Documentation

Visit [https://heroui.com/docs/guide/cli](https://heroui.com/docs/guide/cli) to view the full documentation.

### Community

We're excited to see the community adopt HeroUI CLI, raise issues, and provide feedback.
Whether it's a feature request, bug report, or a project to showcase, please get involved!

- [Discord](https://discord.gg/9b6yyZKmH4)
- [Twitter](https://twitter.com/hero_ui)
- [GitHub Discussions](https://github.com/heroui-inc/heroui-cli/discussions)

## Contributing

Contributions are always welcome!

See [CONTRIBUTING.md](https://github.com/heroui-inc/heroui-cli/blob/main/CONTRIBUTING.md) for ways to get started.

Please adhere to this project's [CODE_OF_CONDUCT](https://github.com/heroui-inc/heroui-cli/blob/main/CODE_OF_CONDUCT.md).

## License

[MIT](https://choosealicense.com/licenses/mit/)
