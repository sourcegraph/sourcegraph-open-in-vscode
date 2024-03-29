# VS Code Sourcegraph extension

## ⚠️ Deprecation notice

**Sourcegraph extensions have been deprecated with the September 2022 Sourcegraph
release. [Learn more](https://docs.sourcegraph.com/extensions/deprecation).**

The repo and the docs below are kept to support older Sourcegraph versions.

## Description

Adds a button to the Sourcegraph's extension panel and at the top of files in code hosts like GitHub (when the Sourcegraph browser extension is installed) that will open the current file in VS Code.

**This extension requires all git repos to be cloned and available on your local machine.**

![image](https://user-images.githubusercontent.com/10532611/79975469-550e0180-849b-11ea-83cb-54e9e25225d6.png)

## Configuration

Please add the following options in your Sourcegraph's User Settings to configure the extension:

- `vscode.open.basePath`: [REQUIRED] String. The absolute path on your local machine that contains your Git repositories.
The extension will try to open the file in a clone named by the last segment of the repository name in that folder. This extension requires all git repos to be already cloned under the provided path with their original names, which can then be altered using the `vscode.open.replacements` option.

- `vscode.open.uncPath`: [OPTIONAL] Boolean. Set option to `true` in your user settings to enable support for UNC (Universal Naming Convention) paths.

- `vscode.open.useMode`: [OPTIONAL] String. Specifies the mode you would like to use with VS Code. Currently support opening VS Code in the following modes:
  - `"insiders"`: Open files in VS Code Insiders instead of regular VS Code.
  - `"ssh"`: Open files from a remote server via ssh. This requires `vscode.open.remoteHost` configured in your User Setting and VS Code extension [Remote Development by Microsoft](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) installed in your VS Code to work.

- `vscode.open.replacements`: [OPTIONAL] Object. Take object with pairs of strings, where each key will be replaced by its value in the final url. The key can be a string or a RegExp, and the value must be a string. For example, using `"vscode.open.replacements": {"sourcegraph-": ""}` will remove `sourcegraph-` from the final URL.

- `vscode.open.remoteHost`: [OPTIONAL] String. Set option to your desired `USER@HOSTNAME` to work with remote repositories. This requires VS Code extension [Remote Development by Microsoft](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) with `"vscode.open.useMode": "ssh"` configured in your Sourcegraph's User Setting to work.

- `vscode.open.osPaths`: [OPTIONAL] Object. We will use the assigned path for the detected Operating System when available. If no platform is detected then we will keep using the path provided with `vscode.open.basePath`. Currently support `"windows"`, `"mac"`, and `"linux"` as keys.

## Examples

### Configured base paths for different platforms

```json
{
  "extensions": {
    "sourcegraph/open-in-vscode": true
  },
  "vscode.open.osPaths": {
    "windows": "/C:/Users/USERNAME/folder/",
    "mac": "/Users/USERNAME/folder/",
    "linux": "/home/USERNAME/folder/"
  },
  // set basePath as fallback path when no operating system is detected
  "vscode.open.basePath": "/Users/USERNAME/Documents/",
}
```

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

### Remote SSH Server

**This requires VS Code extension [Remote Development by Microsoft](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) to work.**

To open repository files reside in a remote server:

```json
{
  "extensions": {
    "sourcegraph/open-in-vscode": true
  },
  // File path for where the repositories reside in the remote server
  "vscode.open.basePath": "/Users/USERNAME/Documents/",
  // Specifies extension to run VS Code with a SSH server
  "vscode.open.useMode": "ssh",
  // Replaces USER and HOSTNAME as appropriate
  "vscode.open.remoteHost": "USER@HOSTNAME",
}
```

### Open folders instead of files

To open directory where the repository files reside:

```json
{
  "extensions": {
    "sourcegraph/open-in-vscode": true
  },
  "vscode.open.basePath": "/Users/USERNAME/Documents/",
  // Use RegExp to remove file names
  "vscode.open.replacements": {"\/[^\/]*$": ""}, 
}
```

## Development

1. Run `yarn && yarn run serve` and keep the Parcel bundler process running.
1. [Sideload the extension](https://docs.sourcegraph.com/extensions/authoring/local_development) (at the URL http://localhost:1234 by default) on your Sourcegraph instance or Sourcegraph.com.

When you edit a source file in your editor, Parcel will recompile the extension. Reload the Sourcegraph web page to use the updated extension.
