# ASDM Bootstrapper

The ASDM Bootstrapper is a command-line interface (CLI) tool designed to help developers quickly set up their development environment for ASDM (AI First System Development Methodology & Platform) projects. It automates the process of downloading and configuring the necessary library resources required for ASDM development, including toolsets, contexts and specs.

There is also a [INSTALL.md](https://platform.asdm.ai/_artifacts/cli/INSTALL.md) file hosted on ASDM platform to instruct AI Agent to follow and use terminal to go through the installation process automatically. 

# Main Features

- List available ASDM library resources by reading from registry APIs
- Download ASDM resources into workspace
  - use `asdm toolset install {toolset-id}` command to save to `.asdm/toolsets/{toolset-id}` folder for toolsets
  - use `asdm context install {context-id}` command to save to `.asdm/contexts/{context-id}` folder for contexts
  - use `asdm spec install {spec-id}` command to save to `.asdm/specs/{spec-id}` folder for specs
- Update 

# Resource Hosting

All resoruces are hosted on [ASDM platform](https://platform.asdm.ai) using the [_artifacts](https://platform.asdm.ai/_artifacts) endpoint.

# Usage

To use the ASDM Bootstrapper CLI, follow these steps:

1. Install the CLI using npm or yarn:

   ```bash
   npm install -g @leansoftx/asdm-bootstrapper-cli
   ```

2. Run the CLI List command to see available ASDM library resources:

   ```bash
   asdm toolset list
   asdm context list
   asdm spec list
   ```

3. Run the CLI install command to download a specific library resource into your workspace:

   ```bash
   asdm toolset install <toolset-id>
   asdm context install <context-id>
   asdm spec install <spec-id>
   ```

4. Run the CLI update command to update a specific library resource in your workspace:

   ```bash
   asdm toolset update <toolset-id>
   asdm context update <context-id>
   asdm spec update <spec-id>
   ```

# Contributing

Contributions are welcome! If you have any ideas for improvements or new features, please feel free to open an issue or submit a pull request.
