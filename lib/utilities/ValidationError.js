class ValidationError extends Error {
    constructor(errors) {
        super('Validation errors')
        this.errors = errors
    }
}

module.exports = ValidationError