const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Server Error";

    // Handle Mongoose CastError (Invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid format for field ${err.path}`;
    }

    // Handle Mongoose ValidationError
    if (err.name === "ValidationError") {
        statusCode = 400;
        const errors = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message
        }));
        return res.status(statusCode).json({
            success: false,
            message: "Validation Error",
            errors
        });
    }

    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        message = "Already registered";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;