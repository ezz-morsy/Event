const Event = require("../models/Event");
const Registration = require("../models/Registration");

const getDashboardStats = async (req, res, next) => {
    try {
        const totalEvents = await Event.countDocuments();
        
        const upcomingEvents = await Event.countDocuments({ date: { $gt: new Date() } });
        
        const totalRegistrations = await Registration.countDocuments();
        
        let mostPopularEvent = null;
        
        if (totalRegistrations > 0) {
            const popular = await Registration.aggregate([
                { $group: { _id: "$eventId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]);
            
            if (popular.length > 0) {
                mostPopularEvent = await Event.findById(popular[0]._id);
            }
        }

        res.status(200).json({
            success: true,
            data: {
                totalEvents,
                upcomingEvents,
                totalRegistrations,
                mostPopularEvent
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
