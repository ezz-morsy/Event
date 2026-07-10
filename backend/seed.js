const mongoose = require("mongoose");
require("dotenv").config();
const Event = require("./models/Event");

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    await Event.deleteMany({});
    await Event.insertMany([
        {
            title: "Tech Summit 2025",
            category: "Technology",
            location: "Cairo",
            date: new Date("2025-12-01T10:00:00"),
            capacity: 100,
            description: "A summit for tech enthusiasts."
        },
        {
            title: "Art Expo",
            category: "Art",
            location: "Alexandria",
            date: new Date("2025-11-15T14:00:00"),
            capacity: 50,
            description: "Annual art exhibition."
        },
        {
            title: "Past Event",
            category: "Other",
            location: "Giza",
            date: new Date("2024-01-01T10:00:00"),
            capacity: 30,
            description: "This event has already passed."
        }
    ]);
    console.log("Seeded.");
    process.exit();
}

seed();
