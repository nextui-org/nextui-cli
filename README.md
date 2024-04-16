# NextUI CLI

The CLI offers a comprehensive suite of commands to initialize, manage, and improve your NextUI projects. It enables you to `add`, `remove`, or `upgrade` individual components, assess the health of your project, and more.

## Quick Start

> **Note**: The NextUI CLI requires [Node.js](https://nodejs.org/en) _18.17.x+_ or later

You can choose the following ways to start the NextUI CLI.

### Npx

```bash
npx nextui-cli@latest
```

### Global Installation

```bash
npm install -g @nextui-cli
```

## Usage

```bash
Usage: nextui [command]

Options:
  -v, --version                      Output the current version
  -h, --help                         Display help information for commands

Commands:
  init [options] [projectName]       Initializes a new project
  add [options] [components...]      Adds components to your project
  upgrade [options] [components...]  Upgrades project components to the latest versions
  remove [options] [components...]   Removes components from the project
  list [options]                     Lists all components, showing status, descriptions, and versions
  env [options]                      Displays debugging information for the local environment
  doctor [options]                   Checks for issues in the project
  help [command]                     display help for command
```

## Commands

### Init

Initialize a new NextUI project with official templates.

```bash
nextui init [projectName] [options]
```

#### Init Options

- `-t --template [string]` The template to use for the new project e.g. app, pages

##### Example

```bash
# Initialize a new NextUI project with the app template, named my-nextui-app
nextui init my-nextui-app -t app
```

### Add

Add NextUI components to your project.

#### Features

> 1. Auto add the missing required `dependencies` to your project
> 2. Auto add the required `tailwindcss.config.js` configuration to your project
> 3. Detect whether using pnpm, if so, add the required configuration to your `.npmrc` file

```bash
nextui add [components...] [options]
```

#### Add Options

- `-a --all` [boolean] Add all the NextUI components (default: `false`)
- `-p --packagePath` [string] The path to the package.json file
- `-tw --tailwindPath` [string] The path to the tailwind.config file file
- `-app --appPath` [string] The path to the App.tsx file
- `--prettier` [boolean] Add prettier format in the add content which required installed prettier - (default: false)
- `--addApp` [boolean] Add App.tsx file content which required provider (default: `false`)

##### Example

Without setting a specific component, the `add` command will show a list of available components.

```bash
nextui add
```

Output:

```bash
NextUI CLI v0.1.2

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
nextui add button
```

Output:

```bash
NextUI CLI v0.1.2

Adding the required dependencies: @nextui-org/button

pnpm add @nextui-org/button
Packages: +1
+
Progress: resolved 470, reused 462, downloaded 0, added 0, done

dependencies:
+ @nextui-org/button 2.0.24

Done in 3.4s

Tailwind CSS settings have been updated in: /project-path/tailwind.config.js

✅ Components added successfully
```

### Upgrade

Upgrade the NextUI components to the latest version.

```bash
nextui upgrade [components...] [options]
```

#### Upgrade Options

- `-p --packagePath` [string] The path to the package.json file
- `-a --all` [boolean] Upgrade all the NextUI components (default: `false`)
- `-h, --help` Display help for command

##### Example

Upgrade the **Button** component to the latest version.

```bash
nextui upgrade button
```

Output:

```bash
NextUI CLI v0.1.2

╭───────────────────────────────────────────────────────────╮
│  @nextui-org/button              2.0.24  ->  2.0.27       │
╰───────────────────────────────────────────────────────────╯
? Would you like to proceed with the upgrade? › - Use arrow-keys. Return to submit.
❯   Yes
    No

pnpm add  @nextui-org/button@2.0.27
Already up to date
Progress: resolved 474, reused 465, downloaded 0, added 0, done
Done in 2.9s

✅ Upgrade complete. All components are up to date.
```

### Remove

Remove NextUI components from your project.

> **Note**: If there are no NextUI components after removing, the required content will also be removed

```bash
nextui remove [components...] [options]
```

#### Remove Options

- `-p --packagePath` [string] The path to the package.json file
- `-a --all` [boolean] Remove all the NextUI components (default: `false`)
- `-tw --tailwindPath` [string] The path to the tailwind.config file file
- `--prettier` [boolean] Add prettier format in the add content which required installed prettier - (default: false)

##### Example

Remove the **Button** component from your project.

```bash
nextui remove button
```

Output:

```bash
NextUI CLI v0.1.2

❗️ Components slated for removal:
╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│   Package              │   Version              │   Status   │   Docs                                        │
│──────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│   @nextui-org/button   │   2.0.27 🚀latest      │   stable   │   https://nextui.org/docs/components/button   │
╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
? Confirm removal of these components: › - Use arrow-keys. Return to submit.
❯   Yes
    No

pnpm remove  @nextui-org/button
Already up to date
Progress: resolved 474, reused 465, downloaded 0, added 0, done

dependencies:
- @nextui-org/button 2.0.27

Done in 2.1s

Remove the removed components tailwind content in file:/project-path/tailwind.config.js

✅ Successfully removed the specified NextUI components: @nextui-org/button
```

### List

List all the NextUI components.

```bash
nextui list [options]
```

#### List Options

- `-p --packagePath` [string] The path to the package.json file
- `-c --current` List the current installed components

##### Example

```bash
nextui list
```

Output:

```bash
NextUI CLI v0.1.2

Current installed components:

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│   Package                    │   Version              │   Status    │   Docs                                              │
│───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│   @nextui-org/autocomplete   │   2.0.10 🚀latest      │   newPost   │   https://nextui.org/docs/components/autocomplete   │
│   @nextui-org/badge          │   2.0.24 🚀latest      │   stable    │   https://nextui.org/docs/components/badge          │
│   @nextui-org/button         │   2.0.27 🚀latest      │   stable    │   https://nextui.org/docs/components/button         │
│   @nextui-org/chip           │   2.0.25 🚀latest      │   stable    │   https://nextui.org/docs/components/chip           │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

### Doctor

Check whether exist problem in your project by using the `doctor` command.

```bash
nextui doctor [options]
```

### Features

> 1. Check whether have `redundant dependencies` in the project
> 2. Check whether the NextUI components `required dependencies are installed` in the project
> 3. Check the required `tailwind.config.js` file and the content is correct
> 4. Check `.npmrc` is correct when using `pnpm`

#### Doctor Options

- `-p` `--packagePath` [string] The path to the package.json file
- `-tw` `--tailwindPath` [string] The path to the tailwind.config file file
- `-app` `--appPath` [string] The path to the App.tsx file
- `-ca` `--checkApp` [boolean] Open check App (default: `true`)
- `-ct` `--checkTailwind` [boolean] Open check tailwind.config file (default: `true`)
- `-cp` `--checkPnpm` [boolean] Open check Pnpm (default: `true`)

#### Example

```bash
nextui doctor
```

Output:

If there is a problem in your project, the `doctor` command will display the problem information.

```bash
NextUI CLI v0.1.2

NextUI CLI: ❌ Your project has 1 issue that require attention

❗️Issue 1: missingTailwind

Missing tailwind.config.(j|t)s file. To set up, visit: https://nextui.org/docs/guide/installation#tailwind-css-setup
```

Otherwise, the `doctor` command will display the following message.

```bash
NextUI CLI v0.1.2

✅ Your project has no detected issues.
```

### Env

Display debug information about the local environment.

```bash
nextui env [options]
```

#### Env Options

- `-p --packagePath` [string] The path to the package.json file

#### Example

Display the local environment Information by using the `env` command.

```bash
nextui env
```

Output:

```bash
NextUI CLI v0.1.2

Current installed components:

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│   Package                    │   Version              │   Status    │   Docs                                              │
│───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│   @nextui-org/autocomplete   │   2.0.10 🚀latest      │   newPost   │   https://nextui.org/docs/components/autocomplete   │
│   @nextui-org/badge          │   2.0.24 🚀latest      │   stable    │   https://nextui.org/docs/components/badge          │
│   @nextui-org/button         │   2.0.27 🚀latest      │   stable    │   https://nextui.org/docs/components/button         │
│   @nextui-org/chip           │   2.0.25 🚀latest      │   stable    │   https://nextui.org/docs/components/chip           │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯

Environment Info:
  System:
    OS: darwin
    CPU: arm64
  Binaries:
    Node: v18.18.2
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
