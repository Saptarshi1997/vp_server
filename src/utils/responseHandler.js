class responseHandler {
    constructor(
        statusCode,
        response,
        message = "Success",
    ) {
        this.statusCode = statusCode;
        this.response = response;
        this.message = message;
        this.success = statusCode < 400;
    }
}

module.exports = responseHandler;
