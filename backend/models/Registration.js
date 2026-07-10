const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    registeredAt: {
        type: Date,
        default: Date.now
    }
});

registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);