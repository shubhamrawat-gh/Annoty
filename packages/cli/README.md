# Annoty CLI

The command line companion for **Annoty**, a developer tool that lets you select elements on your local website, write styling/functional instructions, and compile them into structured prompts for your AI coding assistant (like Claude Code, Cursor, ChatGPT, etc.).

This CLI handles project initialization (injecting the overlay), checking status, running diagnostic checks, and cleaning up injection tags before commits or production builds.

---

## Installation

You can run the CLI directly using `npx`, or install it globally on your machine:

### Running on the fly:
```bash
npx annoty <command>
```

### Global Installation:
```bash
npm install -g annoty
```

---

## Workflow Commands

> [!NOTE]
> If you are using the on-demand `npx` runner instead of a global installation, replace the `annoty` command prefix with `npx annoty` for all commands below (e.g., `npx annoty init` instead of `annoty init`).

### Authentication
* **`annoty login`**
  Starts the authentication handshake. It opens a browser tab pointing to the Annoty Cloud dashboard. Once authenticated, the browser redirects back to a temporary local loopback server (`http://localhost:9876`) to securely save your sync credentials.
* **`annoty logout`**
  Safely signs out of your active session and completely clears local credential files.

### Setup & Project Integration
* **`annoty init`**
  Checks your project for standard asset directories (e.g. `public/`), copies the compiled `overlay.js` script there, and automatically injects the script tag into your `index.html`.

### Diagnostics & Status
* **`annoty status`**
  Scans the current working directory to check if Annoty is injected, verifies the state of `overlay.js` in public assets, and displays the currently logged-in user email.
* **`annoty doctor`**
  Runs system checks including Node.js version compatibility (requires >= v18), loopback port checks, and local configuration validations.
* **`annoty groups`**
  Queries and lists all your synced cloud annotation groups from the database.

### Cleanup & Updates
* **`annoty clean`**
  *Crucial codebase hygiene utility.* Scans your workspace, removes all injected `<script>` tags from your HTML entry points, and deletes the local `public/overlay.js` asset. Run this before staging code in Git or building for production.
* **`annoty uninstall`**
  Permanently deletes all global Annoty configurations, tokens, and temporary files from your computer.
* **`annoty update`**
  Checks npm for the latest version of the CLI and runs a global update.

---

## How It Works Under the Hood

### Local Credential Storage
Credentials retrieved during login are written locally to your home directory:
* **Path**: `~/.annoty/credentials`
* **Security**: On POSIX/Unix systems, the file is saved with strict `0600` permissions (Owner Read/Write only) to prevent unauthorized token extraction.

### Port Selection Range
For the login callback server, the CLI attempts to listen on port `9876`. If that port is occupied, it automatically increments and tests ports up to `9885` sequentially.

---

## License

MIT (c) [Annoty](https://annoty.dev)
