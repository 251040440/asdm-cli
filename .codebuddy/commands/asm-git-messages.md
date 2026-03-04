Execute 'git status' and 'git diff' commands to collect information about the current state of the repository and recent changes. Based on the collected context, generate a concise and descriptive commit message that accurately reflects the modifications made to the codebase. Ensure that the commit message follows best practices, including clarity, conciseness, and relevance. The commit message should be written in the following format:

```markdown
feat: Add application management script and corresponding npm commands
- Added app-management.sh script providing application start, stop, restart, status check, and log viewing functions
- Script supports automatic port management, process management, dependency checking, and log management
- Added npm commands such as start, stop, restart, status, and logs in package.json
- Updated README.md documentation, adding usage instructions for the application management script and project structure updates
```

Where "feat" is the change type (e.g., feat, fix, docs, style, refactor, test, chore), followed by a brief summary of the changes in English. The body section of the commit message should provide more details about the changes made, using a list format.
