/* eslint-disable max-classes-per-file */
/**
 * The abstract class for all handled error
 * @param  {string} message Error message
 */
class ExtendableError extends Error {
    constructor(message) {
        if (new.target === ExtendableError) {
            throw new TypeError('Abstract class "ExtendableError" cannot be instantiated directly.');
        }
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        Error.captureStackTrace(this, this.contructor);
    }
}

/**
 * Error class for 400: Bad Request
 * @param  {string} m Error message
 */
class BadRequest extends ExtendableError {
    constructor(m) {
        if (arguments.length === 0) {
            super('bad request');
        } else {
            super(m);
        }
    }
}

/**
 * Error class for 401: Unauthorized
 * @param  {string} m Error message
 */
class Unauthorized extends ExtendableError {
    constructor(m) {
        if (arguments.length === 0) {
            super('unauthorized');
        } else {
            super(m);
        }
    }
}

/**
 * Error class for 500: Internal Server Error
 * @param  {string} m Error message
 */
class InternalServerError extends ExtendableError {
    constructor(m) {
        if (arguments.length === 0) {
            super('internal server error');
        } else {
            super(m);
        }
    }
}

module.exports.BadRequest = BadRequest;
module.exports.Unauthorized = Unauthorized;
module.exports.InternalServerError = InternalServerError;
