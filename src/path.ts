// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel, some manual changes

function assertPath(path: string): void {
    if (typeof path !== 'string') {
        throw new TypeError('Path must be a string. Received ' + JSON.stringify(path))
    }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path: string, allowAboveRoot: boolean): string {
    let res = ''
    let lastSegmentLength = 0
    let lastSlash = -1
    let dots = 0
    let code
    for (let i = 0; i <= path.length; ++i) {
        if (i < path.length) {
            code = path.charCodeAt(i)
        } else if (code === 47) {
            break
        } else {
            code = 47
        }
        if (code === 47) {
            if (lastSlash === i - 1 || dots === 1) {
                // NOOP
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (
                    res.length < 2 ||
                    lastSegmentLength !== 2 ||
                    res.charCodeAt(res.length - 1) !== 46 ||
                    res.charCodeAt(res.length - 2) !== 46
                ) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf('/')
                        if (lastSlashIndex !== res.length - 1) {
                            if (lastSlashIndex === -1) {
                                res = ''
                                lastSegmentLength = 0
                            } else {
                                res = res.slice(0, lastSlashIndex)
                                lastSegmentLength = res.length - 1 - res.lastIndexOf('/')
                            }
                            lastSlash = i
                            dots = 0
                            continue
                        }
                    } else if (res.length === 2 || res.length === 1) {
                        res = ''
                        lastSegmentLength = 0
                        lastSlash = i
                        dots = 0
                        continue
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) {
                        res += '/..'
                    } else {
                        res = '..'
                    }
                    lastSegmentLength = 2
                }
            } else {
                if (res.length > 0) {
                    res += '/' + path.slice(lastSlash + 1, i)
                } else {
                    res = path.slice(lastSlash + 1, i)
                }
                lastSegmentLength = i - lastSlash - 1
            }
            lastSlash = i
            dots = 0
        } else if (code === 46 && dots !== -1) {
            ++dots
        } else {
            dots = -1
        }
    }
    return res
}

const posix = {
    /**
     * Making sure the paths are correctly formatted is beyond the scope of this pollyfill
     */
    normalize: (path: string) => {
        assertPath(path)

        if (path.length === 0) {
            return '.'
        }

        // If windows-path replace slashes
        if (/^[a-zA-Z]:\\/.test(path)) {
            path = path.replace(/\\/g, '/')
        }

        const isAbsolute = posix.isAbsolute(path)
        const trailingSeparator = path.charCodeAt(path.length - 1) === 47

        // Normalize the path
        path = normalizeStringPosix(path, !isAbsolute)

        if (path.length === 0 && !isAbsolute) {
            path = '.'
        }
        if (path.length > 0 && trailingSeparator) {
            path += '/'
        }

        if (isAbsolute) {
            return '/' + path
        }
        return path
    },
    isAbsolute: (path: string) => {
        assertPath(path)
        if (path.length === 0) {
            return false
        }
        let isAbsolute = true

        if (path.charCodeAt(0) === 47) {
            isAbsolute = true
        } else if (/^[a-zA-Z]:\\/.test(path)) {
            isAbsolute = true
        } else {
            isAbsolute = false
        }

        return isAbsolute
    },
    join: (...args: string[]) => {
        if (args.length === 0) {
            return '.'
        }
        let joined
        for (const arg of args) {
            assertPath(arg)
            if (arg.length > 0) {
                if (joined === undefined) {
                    joined = arg
                } else {
                    joined += '/' + arg
                }
            }
        }
        if (joined === undefined) {
            return '.'
        }
        return posix.normalize(joined)
    },
}

export default posix
