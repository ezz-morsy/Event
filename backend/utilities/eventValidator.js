const validateEvent = (eventData, isEdit = false) => {
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
} else if (!isEdit && new Date(eventData.date) < new Date()) {
         errors.push({
           field: "date",
           message: "Event date must be in the future"
         });
    }   
    if (eventData.capacity === undefined || eventData.capacity === null || eventData.capacity === "") {
        errors.push({
            field: "capacity",
            message: "Capacity is required"
        });
    } else if (isNaN(Number(eventData.capacity)) || Number(eventData.capacity) <= 0) {
        errors.push({
            field: "capacity",
            message: "Capacity must be greater than 0"
        });
    }
    if (!eventData.description) {
        errors.push({
            field: "description",
            message: "Description is required"
        });
    }
    return errors;
};

module.exports = validateEvent;