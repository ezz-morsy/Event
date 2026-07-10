const express = require("express");
const router = express.Router();

const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} = require("../controllers/eventController");

const {
    registerAttendee,
    getAttendees,
    deleteRegistration
} = require("../controllers/registrationController");

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

router.post("/:id/register", registerAttendee);
router.get("/:id/attendees", getAttendees);
router.delete("/:id/registrations/:registrationId", deleteRegistration);

module.exports = router;