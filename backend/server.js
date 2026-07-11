const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/healthRoutes");
const eventRoutes = require("./routes/eventRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const Category = require("./models/Category");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5500"
}));

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Modern Reservation System API is running"
    });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const seedDefaultCategories = async () => {
    try {
        const count = await Category.countDocuments();
        if (count === 0) {
            const defaults = [
                { name: "Technology", description: "Tech talks, hackathons, and coding events" },
                { name: "Art", description: "Exhibitions, galleries, and workshops" },
                { name: "Business", description: "Seminars, networking, and pitches" },
                { name: "Social", description: "Parties, meetups, and gatherings" },
                { name: "Sports", description: "Tournaments, games, and outdoor activities" },
                { name: "Education", description: "Lectures, classes, and study sessions" },
                { name: "Music", description: "Concerts, gigs, and festivals" },
                { name: "Other", description: "Misc events" }
            ];
            await Category.insertMany(defaults);
            console.log("Database seeded with default categories.");
        }
    } catch (err) {
        console.error("Error seeding default categories:", err);
    }
};

connectDB().then(() => {
    seedDefaultCategories();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
