const Event = require("../models/Event");
const Registration = require("../models/Registration");

const registerAttendee = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const { name, email } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        const currentRegistrations = await Registration.countDocuments({ eventId });
        if (currentRegistrations >= event.capacity) {
            return res.status(400).json({ success: false, message: "Event is at capacity" });
        }

        const existingRegistration = await Registration.findOne({ eventId, email });
        if (existingRegistration) {
            return res.status(400).json({ success: false, message: "Already registered" });
        }

        const registration = await Registration.create({
            eventId,
            name,
            email
        });

        res.status(200).json({ success: true, data: registration });
    } catch (error) {
        next(error);
    }
};

const getAttendees = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const attendees = await Registration.find({ eventId }).select("name email");
        res.status(200).json({ success: true, data: attendees });
    } catch (error) {
        next(error);
    }
};

const deleteRegistration = async (req, res, next) => {
    try {
        const { registrationId } = req.params;
        const registration = await Registration.findByIdAndDelete(registrationId);
        
        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        res.status(200).json({ success: true, message: "Registration deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerAttendee,
    getAttendees,
    deleteRegistration
};
