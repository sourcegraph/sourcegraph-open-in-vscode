# VS Code Sourcegraph extension

Adds a button to the Sourcegraph's extension panel and at the top of files in code hosts like GitHub (when the Sourcegraph browser extension is installed) that will open the current file in VS Code.

![image](https://user-images.githubusercontent.com/10532611/79975469-550e0180-849b-11ea-83cb-54e9e25225d6.png)

## Configuration

- Set `vscode.open.basePath` in your user settings to a local folder that contains your Git repositories.
The extension will try to open the file in a clone named by the last segment of the repository name in that folder.

- Set `vscode.open.uncPath` to true in your user settings to enable support for UNC (Universal Naming Convention) paths.

- Set `vscode.open.insidersMode` to true in your user settings to open files in VS Code Insiders instead of regular VS Code.

- Set `vscode.open.replacements` to an object with pairs of strings, where each key will be replaced by its value in the final url. The key can be a string or a RegExp, and the value must be a string. For example, using `"openineditor.replacements": {"sourcegraph-": ""}` will remove `sourcegraph-` from the final URL.

- Set `vscode.open.remoteHost` to `USER@HOSTNAME` to work with remote repositories. **This requires VS Code extension [Remote Development by Microsoft](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) to work.** Example: `"vscode.open.remoteHost": "USER@HOSTNAME"`.

## Examples

### Mac

To open repository files in your Documents directory:

```json
{
  "extensions": {
    "sourcegraph/open-in-vscode": true
  },
  "vscode.open.basePath": "/Users/USERNAME/Documents/"
}
```

### Windows

To open repository files in your Documents directory:

```json
{
  "extensions": {
    "sourcegraph/open-in-vscode": true
  },
  "vscode.open.basePath": "/Users/USERNAME/Documents/"
}
```

You may also use an absolute file path from the root of drive C: with the following setting:

```json
{
  "extensions": {
    "sourcegraph/open-in-vscode": true,
  },
  "vscode.open.basePath": "/C:/Users/USERNAME/Documents/"
}
```

### WSL

To open repository files in your Home directory:

```json
{
  "extensions": {
    "sourcegraph/open-in-vscode": true
  },
  "vscode.open.basePath": "//wsl$/Ubuntu-18.04/home",
  "vscode.open.uncPath": true
}
```

### Replacements

Adds `sourcegraph-` in front of the string that matches the `(?<=Documents\/)(.*[\\\/])` RegExp pattern, which is the string after `Documents/` and before the final slash. This turns the final url from `vscode://file//Users/USERNAME/Documents/REPO-NAME/package.json` to `vscode://file//Users/USERNAME/Documents/sourcegraph-REPO-NAME/package.json`

```json
{
  "extensions": {
    "sourcegraph/open-in-vscode": true
  },
  "vscode.open.basePath": "/Users/USERNAME/Documents/",
  "vscode.open.replacements": {"(?<=Documents\/)(.*[\\\/])": "sourcegraph-$1"},
}
```

### Remote Server

**This requires VS Code extension [Remote Development by Microsoft](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) to work.**

To open directory where the repository files reside in a remote server:

```json
{
  "extensions": {
    "sourcegraph/open-in-vscode": true
  },
  // file base for where the repositories reside in the remote server
  "vscode.open.basePath": "/Users/USERNAME/Documents/",
  // Replaces USER and HOSTNAME as appropriate
  "vscode.open.remoteHost": "USER@HOSTNAME",
  // removes file name as the vscode-remote protocol handler only supports directory-opening
  "vscode.open.replacements": {"\/[^\/]*$": ""}, 
}
```

## Development

1. Run `yarn && yarn run serve` and keep the Parcel bundler process running.
1. [Sideload the extension](https://docs.sourcegraph.com/extensions/authoring/local_development) (at the URL http://localhost:1234 by default) on your Sourcegraph instance or Sourcegraph.com.

When you edit a source file in your editor, Parcel will recompile the extension. Reload the Sourcegraph web page to use the updated extension.