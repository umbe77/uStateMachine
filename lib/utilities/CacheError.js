class CacheError extends Error {
    constructor(code, message) {
        super(message)
        this.code = code
    }

    get code() {
        return this.code
    }
}

module.exports = CacheError