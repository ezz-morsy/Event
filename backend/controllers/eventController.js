const Event = require("../models/Event");
const Registration = require("../models/Registration");
const validateEvent = require("../utilities/eventValidator");

const getEvents = async (req, res, next) => {
    try {
        const query = {};

        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: "i" };
        }

        if (req.query.category) {
            query.category = req.query.category;
        }

        if (req.query.location) {
            query.location = req.query.location;
        }

        if (req.query.date) {
            const startOfDay = new Date(req.query.date);
            if (!isNaN(startOfDay.getTime())) {
                const endOfDay = new Date(req.query.date);
                startOfDay.setUTCHours(0, 0, 0, 0);
                endOfDay.setUTCHours(23, 59, 59, 999);
                query.date = { $gte: startOfDay, $lte: endOfDay };
            }
        }

        const events = await Event.find(query);
        res.status(200).json({
            success: true,
            data: events,
        });
    } catch (error) {
        next(error);
    }
};

const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }
        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }
        next(error);
    }
};

const createEvent = async (req, res, next) => {
    try {
        const errors = validateEvent(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors,
            });
        }

        const newEvent = await Event.create(req.body);
        res.status(200).json({
            success: true,
            data: newEvent,
        });
    } catch (error) {
        next(error);
    }
};

const updateEvent = async (req, res, next) => {
    try {
        const errors = validateEvent(req.body);
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors,
            });
        }

        const currentRegistrations = await Registration.countDocuments({ eventId: req.params.id });
        if (req.body.capacity !== undefined && req.body.capacity < currentRegistrations) {
            return res.status(400).json({
                success: false,
                errors: [{
                    field: "capacity",
                    message: `Capacity cannot be reduced below the number of registered attendees (${currentRegistrations})`
                }]
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.status(200).json({
            success: true,
            data: updatedEvent,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }
        next(error);
    }
};

const deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        // Cascade delete registrations for this event
        await Registration.deleteMany({ eventId: req.params.id });

        res.status(200).json({
            success: true,
            message: "Event deleted",
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }
        next(error);
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};