const settings = require('../utilities/settings').getSettings()

const invariantName = settings["cache"]["provider"]

const cache = require(`./builtin/${invariantName}`)(settings["cache"]["options"])
cache.setTimeout = settings["cache"]["timeout"] || 120

module.exports = cache