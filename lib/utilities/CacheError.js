class CacheError extends Error {
    constructor(code, message) {
        super(message)
        this._code = code
    }

    get code() {
        return this._code
    }
}

module.exports = CacheError