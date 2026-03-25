# ASDM Bootstrapper

The ASDM Bootstrapper is a command-line interface (CLI) tool designed to help developers quickly set up their development environment for ASDM (AI First System Development Methodology & Platform) projects. It automates the process of downloading and configuring the necessary library resources required for ASDM development, including toolsets, contexts and specs.

There is also a [INSTALL.md](https://platform.asdm.ai/_artifacts/cli/INSTALL.md) file hosted on ASDM platform to instruct AI Agent to follow and use terminal to go through the installation process automatically. 

# Main Features

- List available ASDM library resources by reading from registry APIs
- Download ASDM resources into workspace
  - use `asdm toolset install {toolset-id}` command to save to `.asdm/toolsets/{toolset-id}` folder for toolsets
  - use `asdm context install {context-id}` command to save to `.asdm/contexts/{context-id}` folder for contexts
  - use `asdm spec install {spec-id}` command to save to `.asdm/specs/{spec-id}` folder for specs
  - use `asdm skill install {skill-id}` command to save to `.asdm/skills/{skill-id}` folder for skills
- Update ASDM resources in your workspace

# Resource Hosting

All resources are hosted on [ASDM platform](https://platform.asdm.ai) using the [_artifacts](https://platform.asdm.ai/_artifacts) endpoint.

# Usage

To use the ASDM Bootstrapper CLI, follow these steps:

1. Install the CLI using npm or yarn:

   ```bash
   npm install -g @leansoftx/asdm-bootstrapper-cli
   ```

2. Available commands:

| Command | Description |
|---------|-------------|
| `asdm toolset list` | List all available ASDM toolsets |
| `asdm toolset install <toolset-id>` | Download and install a specific ASDM toolset |
| `asdm toolset update <toolset-id>` | Update a specific ASDM toolset to the latest version |
| `asdm toolset uninstall <toolset-id>` | Uninstall a specific ASDM toolset |
| `asdm spec list` | List all available ASDM specs |
| `asdm spec install <spec-id>` | Download and install a specific ASDM spec |
| `asdm spec update <spec-id>` | Update a specific ASDM spec to the latest version |
| `asdm spec uninstall <spec-id>` | Uninstall a specific ASDM spec |
| `asdm context list` | List all available ASDM contexts |
| `asdm context install <context-id>` | Download and install a specific ASDM context |
| `asdm context update <context-id>` | Update a specific ASDM context to the latest version |
| `asdm context uninstall <context-id>` | Uninstall a specific ASDM context |
| `asdm skill list` | List all available ASDM skills |
| `asdm skill install <skill-id>` | Download and install a specific ASDM skill |
| `asdm skill update <skill-id>` | Update a specific ASDM skill to the latest version |
| `asdm skill uninstall <skill-id>` | Uninstall a specific ASDM skill |

# Folder Structure

When you use the ASDM CLI to install resources, they are stored in the `.asdm` directory within your workspace. The folder structure is as follows:

```
.asdm/
├── toolsets/
│   └── {toolset-id}/
│       └── (toolset files)
├── contexts/
│   └── {context-id}/
│       └── (context files)
├── specs/
│   └── {spec-id}/
│       └── (spec files)
└── skills/
    └── {skill-id}/
        └── (skill files)
```

- **`.asdm/toolsets/`** - Contains installed ASDM toolsets (e.g., `.asdm/toolsets/{toolset-id}`)
- **`.asdm/contexts/`** - Contains installed ASDM contexts (e.g., `.asdm/contexts/{context-id}`)
- **`.asdm/specs/`** - Contains installed ASDM specs (e.g., `.asdm/specs/{spec-id}`)
- **`.asdm/skills/`** - Contains installed ASDM skills (e.g., `.asdm/skills/{skill-id}`)

# Contributing

Contributions are welcome! If you have any ideas for improvements or new features, please feel free to open an issue or submit a pull request.
