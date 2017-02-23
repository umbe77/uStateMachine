const mocha = require('mocha')
const assert = require('assert')

const defaultSettings = require('../lib/utilities/default-settings.json')
const customSettings = {
    cache: {
        provider: "redis"
    }
}

//mock global.appRootDir
global.appRootDir = require('path').resolve('./')

const {initSettings} = require('../lib/utilities/settings')

describe('Settings', function(){
    it('should init settings with default values', function(){
        const settings = initSettings(defaultSettings, {})
        assert.equal(settings["cache"]["provider"], "memory", "default cache provider is memory")
        assert.deepEqual(settings.providers, {}, "custom providers aren't present")
    })

    it('should init settings with custom values', function(){
        const settings = initSettings(defaultSettings, customSettings)
        assert.equal(settings["cache"]["provider"], "redis", "default cache provider is memory")
        assert.deepEqual(settings.providers, {}, "custom providers aren't present")
    })
})