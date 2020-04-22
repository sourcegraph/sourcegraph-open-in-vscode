import * as sourcegraph from 'sourcegraph'
import * as path from 'path'

function getOpenUrl(textDocumentUri: URL): URL {
    const rawRepoName = decodeURIComponent(textDocumentUri.hostname + textDocumentUri.pathname)
    // TODO support different folder layouts, e.g. repo nested under owner name
    const repoBaseName = rawRepoName.split('/').pop()!
    const basePath: unknown = sourcegraph.configuration.get().value['vscode.open.basePath']
    if (typeof basePath !== 'string') {
        throw new Error(
            'Setting `vscode.open.basePath` must be set in your [user settings](/user/settings) to open files in VS Code.'
        )
    }
    if (!path.isAbsolute(basePath)) {
        throw new Error(
            `\`vscode.open.basePath\` value \`${basePath}\` is not an absolute path. Please correct the error in your [user settings](/user/settings).`
        )
    }
    const relativePath = decodeURIComponent(textDocumentUri.hash.slice('#'.length))
    const absolutePath = path.join(basePath, repoBaseName, relativePath)
    const openUrl = new URL('vscode://file' + absolutePath)
    const selection = sourcegraph.app.activeWindow?.activeViewComponent?.selection
    if (selection) {
        openUrl.pathname += `:${selection.start.line + 1}`
        if (selection.start.character !== 0) {
            openUrl.pathname += `:${selection.start.character + 1}`
        }
    }
    return openUrl
}

export function activate(ctx: sourcegraph.ExtensionContext): void {
    ctx.subscriptions.add(
        sourcegraph.commands.registerCommand('vscode.open.file', async (uri: string) => {
            const openUrl = getOpenUrl(new URL(uri))
            await sourcegraph.commands.executeCommand('open', openUrl)
        })
    )
}
