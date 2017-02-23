const settings = require('../utilities/settings')

const invariantName = settings["cache"]["provider"]

const cache = settings.providers[invariantName]

if (!cache) {
    cache = require('./builtin/memory')
}

module.exports = cache