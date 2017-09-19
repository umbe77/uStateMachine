const semver = require('semver')

const versionComparer = (va, vb) => {
    if (semver.gt(va, vb)) {
        return -1
    }
    if (semver.lt(va, vb)) {
        return 1
    }
    return 0
}

const getResponse = (data, status) => {
    return {
        status: (status >= 200 && status < 500) ? status : 0 || 200,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': "application/json"
        }
    }
}

const formatErrorResponse = (err, status) => {

    return {
        status: (status >= 400 && status < 600) ? status : 0 || 500,
        body: JSON.stringify(err),
        headers: {
            'Content-Type': 'application/json'
        }
    }
}

module.exports = {
    versionComparer,
    getResponse,
    formatErrorResponse
}