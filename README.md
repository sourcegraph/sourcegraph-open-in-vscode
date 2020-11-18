# VS Code Sourcegraph extension

Adds a button at the top of files in both Sourcegraph app and code hosts like GitHub (when the Sourcegraph browser extension is installed) that will open the current file in VS Code.

![image](https://user-images.githubusercontent.com/10532611/79975469-550e0180-849b-11ea-83cb-54e9e25225d6.png)

## Configuration

Set `vscode.open.basePath` in your user settings to a local folder that contains your Git repositories.
The extension will try to open the file in a clone named by the last segment of the repository name in that folder.
