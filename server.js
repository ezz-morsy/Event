const express = require("express");
const cors = require("cors");
require("dotenv").config();
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/healthRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN
}));

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Event Platform API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
