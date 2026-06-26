# ttnplugins

ttncode's Claude Code marketplace. One plugin:

- **unioss-pipeline** — the UNIOSS A→Z ticket pipeline (gated investigator → planner → coder → reviewer → tester, with PHPUnit + Playwright verification). Bundles the Playwright MCP and a setup doctor.

## Install (Windows / macOS / Linux)

```text
/plugin marketplace add <git-url-of-this-repo>
/plugin install unioss-pipeline
/unioss-doctor
```

`/unioss-doctor` checks dependencies, offers to install the light ones (node, jq), and guides you through Docker, the unioss containers, and the `GITLAB_TOKEN` secret.

## Run a ticket

```text
/unioss-pipeline https://gitlab.unioss.jp/unioss/AdminPage/-/work_items/1834
```

The pipeline prints its plan and stops for your approval at each gate.

## Requirements

- Node.js, jq, Docker + the `mysql-unioss3` / `php-unioss3` containers, and a `GITLAB_TOKEN` env var. Run `/unioss-doctor` to check.
