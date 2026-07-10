const validateEvent = (eventData) => {
    const errors = [];

    if (!eventData.title) {
        errors.push({
            field: "title",
            message: "Title is required"
    
        });
    }
    if (!eventData.category) {
         errors.push({
           field: "category",
           message: "Category is required"
        });
    }
    if (!eventData.location) {
         errors.push({
           field: "location",
           message: "Location is required"
        });
    }
    if (!eventData.date) {
         errors.push({
           field: "date",
           message: "Date is required"
    });
}   
    if (eventData.capacity <= 0) {
    errors.push({
           field: "capacity",
           message: "Capacity must be greater than 0"
    });
}
    return errors;
};

module.exports = validateEvent;