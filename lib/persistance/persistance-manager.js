const settings = require('../utilities/settings').getSettings()

const invariantName = settings["persistance"]["provider"]

const persistance = require(`./builtin/${invariantName}`)(settings["persistance"])

module.exports = persistance