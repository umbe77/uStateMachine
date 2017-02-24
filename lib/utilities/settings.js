const currentSettings = require('../../settings.json')
const defaultSettings = require('./default-settings.json')
const path = require('path')

function initSettings(defaultSettings, currentSettings) {
    let settings = Object.assign({}, defaultSettings, currentSettings)
    settings.providerLocation = settings.providerLocation.replace(/^~/, global.appRootDir)

    const providers = {}
    //load all custom providers
    require("fs").readdirSync(settings.providerLocation).forEach((file) => {
        const ext = path.extname(file)
        const providername = file.replace(new RegExp(`${ext}$`), '')
        providers[providername] = require(path.join(settings.providerLocation, file))
    })

    settings.providers = providers

    return settings
}

const settings = initSettings(defaultSettings, currentSettings)

module.exports = {
    settings,
    initSettings
}