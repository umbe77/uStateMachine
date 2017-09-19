class CacheError extends Error {
    constructor(code, message) {
        super(message)
        super.Error = "CacheError"
        this.code = code
    }
}

module.exports = CacheError