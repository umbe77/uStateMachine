const mocha = require('mocha')
const assert = require('assert')

const defaultSettings = require('../lib/utilities/default-settings.json')
const customSettings = {
    cache: {
        provider: "redis"
    }
}

describe('Settings', function(){
    let initSettings = undefined

    //mock global.appRootDir
    before(() => {
        initSettings = require('../lib/utilities/settings').initSettings
        global.appRootDir = require('path').resolve('./')
    })

    after(() => {
        global.appRootDir = undefined
    })

    it('should init settings with default values', function(){
        const settings = initSettings(defaultSettings, {})
        assert.equal(settings["cache"]["provider"], "memory", "default cache provider is memory")
        // assert.deepEqual(settings.providers, {}, "custom providers aren't present")
    })

    it('should init settings with custom values', function(){
        const settings = initSettings(defaultSettings, customSettings)
        assert.equal(settings["cache"]["provider"], "redis", "default cache provider is memory")
        // assert.deepEqual(settings.providers, {}, "custom providers aren't present")
    })
})