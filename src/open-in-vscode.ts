import * as sourcegraph from 'sourcegraph'
import path from './path'

function getOpenUrl(textDocumentUri: URL): URL {
    const rawRepoName = decodeURIComponent(textDocumentUri.hostname + textDocumentUri.pathname)
    // TODO support different folder layouts, e.g. repo nested under owner name
    const repoBaseName = rawRepoName.split('/').pop()!
    let basePath: string = sourcegraph.configuration.get().value['vscode.open.basePath']
    const osPaths: Record<string, string> = sourcegraph.configuration.get().value['vscode.open.osPaths']
    const isUNC: boolean = sourcegraph.configuration.get().value['vscode.open.uncPath']
    const useMode: string = sourcegraph.configuration.get().value['vscode.open.useMode']
    const replacements: Record<string, string> = sourcegraph.configuration.get().value['vscode.open.replacements']
    const remoteHost: string = sourcegraph.configuration.get().value['vscode.open.remoteHost']

    // check platform and use assigned path if osPaths is configured;
    if(osPaths){
        if (navigator.userAgent.includes('Win') && osPaths.windows) {
            basePath = osPaths.windows;
        } else if (navigator.userAgent.includes('Mac') && osPaths.mac) {
            basePath = osPaths.mac;
        } else if (navigator.userAgent.includes('Linux') && osPaths.linux) {
            basePath = osPaths.linux;
        }
    }
    
    if (typeof basePath !== 'string') {
        throw new Error(
            `Setting \`vscode.open.basePath\` must be included in your [user settings](${new URL('/user/settings', sourcegraph.internal.sourcegraphURL.href).href}) to open files in VS Code.`
        )
    }
    if (!path.isAbsolute(basePath)) {
        throw new Error(
            `\`${basePath}\` is not an absolute path. Please correct the error in your [user settings](${new URL('/user/settings', sourcegraph.internal.sourcegraphURL.href).href}).`
        )
    }
    const relativePath = decodeURIComponent(textDocumentUri.hash.slice('#'.length))
    const absolutePath = path.join(basePath, repoBaseName, relativePath)
    // if windows or enabled UNC path, add an extra slash in the beginning
    const uncPath = /^[a-zA-Z]:\\/.test(basePath) || isUNC ? '/' : '';

    // check for configured mode then construct uri. uses 'vscode://' by default.
    let uri = '';
    switch(useMode) {
        case 'insiders':
            uri = 'vscode-insiders://file' + uncPath + absolutePath;
            break;
        case 'github':
            if(textDocumentUri.hostname !== 'github.com'){
                throw new Error(
                    'VS Code only supports opening repositories from GitHub remotely.'
                )
            }
            uri = 'vscode://GitHub.remotehub/open?url=https://' + rawRepoName + '/blob/' + decodeURIComponent(textDocumentUri.search.slice('?'.length)) + '/' + relativePath;
            break;
        case 'ssh':
            if(!remoteHost){
                throw new Error(
                    `Setting \`vscode.open.remoteHost\` must be included in your [user settings](${new URL('/user/settings', sourcegraph.internal.sourcegraphURL.href).href}) to run VS Code in ssh mode.`
                )
            }
            uri = 'vscode://vscode-remote/ssh-remote+' + remoteHost + uncPath + absolutePath;
            break;
        default:
            uri = 'vscode://file' + uncPath + absolutePath;
    }

    if (sourcegraph.app.activeWindow?.activeViewComponent?.type === 'CodeEditor') {
        const selection = sourcegraph.app.activeWindow?.activeViewComponent?.selection
        if (selection && useMode !== 'github') {
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
