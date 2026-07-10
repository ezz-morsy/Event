const getEvents = (req, res) => {
    res.json({
        success: true,
        data: [],
    });
};

const getEventById = (req, res) => {
    res.json({
        success: true,
        data: {},
    });
};

const createEvent = (req, res) => {
    res.json({
        success: true,
        message: "Event created",
    });
};

const updateEvent = (req, res) => {
    res.json({
        success: true,
        message: "Event updated",
    });
};

const deleteEvent = (req, res) => {
    res.json({
        success: true,
        message: "Event deleted",
    });
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};