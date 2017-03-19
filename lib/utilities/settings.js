const currentSettings = require('../../settings.json')
const defaultSettings = require('./default-settings.json')

let settings = undefined

function initSettings(defaultSettings, currentSettings) {
    let sett = Object.assign({}, defaultSettings, currentSettings)

    settings = sett
    return sett
}

function resetDef() {
    initSettings(defaultSettings, currentSettings)
}

function getSettings() {
    if (!settings) {
        resetDef()
    }
    return settings
}

module.exports = {
    getSettings,
    initSettings,
    resetDef
}