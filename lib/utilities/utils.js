const semver = require('semver')

function versionComparer(va, vb) {
    if (semver.gt(va, vb)) {
        return -1
    }
    if (semver.lt(va, vb)) {
        return 1
    }
    return 0
}

module.exports = {
    versionComparer
}