const healthCheck = (req, res) => {

    res.json({
        success: true
    });

};

module.exports = {
    healthCheck
};