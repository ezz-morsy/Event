const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");

const registerAttendee = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const eventId = req.params.id;
        const { name, email } = req.body;

        const event = await Event.findById(eventId).session(session);
        if (!event) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (event.date && new Date(event.date) < new Date()) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Cannot register for an event that has already passed" });
        }

        const currentRegistrations = await Registration.countDocuments({ eventId }).session(session);
        if (currentRegistrations >= event.capacity) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Event is at capacity" });
        }

        const existingRegistration = await Registration.findOne({ eventId, email }).session(session);
        if (existingRegistration) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Already registered" });
        }

        // Using findOneAndUpdate to force a write lock on the event document under this transaction
        await Event.findOneAndUpdate(
            { _id: eventId },
            { $set: { updatedAt: new Date() } }
        ).session(session);

        const registrations = await Registration.create([{
            eventId,
            name,
            email
        }], { session });

        await session.commitTransaction();
        res.status(200).json({ success: true, data: registrations[0] });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
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
        const eventId = req.params.id;
        const { registrationId } = req.params;
        const registration = await Registration.findOneAndDelete({ _id: registrationId, eventId });
        
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
