const currentSettings = require('../../settings.json')
const defaultSettings = require('./default-settings.json')
const path = require('path')

let settings = undefined

function initSettings(defaultSettings, currentSettings) {
    let sett = Object.assign({}, defaultSettings, currentSettings)
    // if (global.appRootDir) {
    //     sett.providerLocation = sett.providerLocation.replace(/^~/, global.appRootDir)

    //     const providers = {}
    //     //load all custom providers
    //     require("fs").readdirSync(sett.providerLocation).forEach((file) => {
    //         const ext = path.extname(file)
    //         const providername = file.replace(new RegExp(`${ext}$`), '')
    //         providers[providername] = require(path.join(sett.providerLocation, file))
    //     })

    //     sett.providers = providers
    // }

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