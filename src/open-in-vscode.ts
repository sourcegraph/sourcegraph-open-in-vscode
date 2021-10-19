import * as sourcegraph from 'sourcegraph'
import path from './path'

function getOpenUrl(textDocumentUri: URL): URL {
    const rawRepoName = decodeURIComponent(textDocumentUri.hostname + textDocumentUri.pathname)
    // TODO support different folder layouts, e.g. repo nested under owner name
    const repoBaseName = rawRepoName.split('/').pop()!
    const basePath: unknown = sourcegraph.configuration.get().value['vscode.open.basePath']
    const isUNC: boolean = sourcegraph.configuration.get().value['vscode.open.uncPath']
    const insidersMode: boolean = sourcegraph.configuration.get().value['vscode.open.insidersMode']
    const replacements: Record<string, string> = sourcegraph.configuration.get().value['vscode.open.replacements']
    console.log(replacements)
    if (typeof basePath !== 'string') {
        throw new Error(
            `Setting \`vscode.open.basePath\` must be set in your [user settings](${new URL('/user/settings', sourcegraph.internal.sourcegraphURL.href).href}) to open files in VS Code.`
        )
    }
    if (!path.isAbsolute(basePath)) {
        throw new Error(
            `\`vscode.open.basePath\` value \`${basePath}\` is not an absolute path. Please correct the error in your [user settings](${new URL('/user/settings', sourcegraph.internal.sourcegraphURL.href).href}).`
        )
    }
    const relativePath = decodeURIComponent(textDocumentUri.hash.slice('#'.length))
    const absolutePath = path.join(basePath, repoBaseName, relativePath)

    // if windows or enabled UNC path, add an extra slash in the beginning
    const uncPath = /^[a-zA-Z]:\\/.test(basePath) || isUNC ? '/' : '';
    // check if vscode-insiders mode is enabled
    const mode = insidersMode ? 'vscode-insiders' : 'vscode';
    // construct uri
    let uri = mode + '://file' + uncPath + absolutePath;

    if (sourcegraph.app.activeWindow?.activeViewComponent?.type === 'CodeEditor') {
        const selection = sourcegraph.app.activeWindow?.activeViewComponent?.selection
        if (selection) {
            uri += `:${selection.start.line + 1}`
            if (selection.start.character !== 0) {
                uri += `:${selection.start.character + 1}`
            }
        }
    }
    // Run replacements if any
    if(replacements) {
        for (const replacement in replacements) {
            if (typeof replacement === 'string') {
                const POST_REGEX = new RegExp(replacement);
                uri = uri.replace(POST_REGEX, replacements[replacement])
            }
        }
    }

    return new URL(uri)
}

export function activate(ctx: sourcegraph.ExtensionContext): void {
    ctx.subscriptions.add(
        sourcegraph.commands.registerCommand('vscode.open.file', async (uri?: string) => {
            if (!uri) {
                const viewer = sourcegraph.app.activeWindow?.activeViewComponent
                uri = viewerUri(viewer)
            }
            if (!uri) {
                throw new Error('No file currently open')
            }
            const openUrl = getOpenUrl(new URL(uri))
            await sourcegraph.commands.executeCommand('open', openUrl.href)
        })
    )
}

function viewerUri(viewer: sourcegraph.ViewComponent | undefined): string | undefined {
    switch (viewer?.type) {
        case 'CodeEditor':
            return viewer.document.uri
        case 'DirectoryViewer':
            return viewer.directory.uri.href
        default:
            return undefined
    }
}
