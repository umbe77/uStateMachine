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

function getResponse(data) {
    return {
        body: JSON.stringify(data),
        headers: {
            'Content-Type': "application/json"
        }
    }
}

module.exports = {
    versionComparer,
    getResponse
}