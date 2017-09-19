class ValidationError extends Error {
    constructor(errors) {
        super('Validation errors')
        super.name = "ValidationError"
        this.errors = errors
    }
}

module.exports = ValidationError