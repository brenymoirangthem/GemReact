function getDateTime(timeZone = "Asia/Kolkata") {
    try {
        const now = new Date();

        const result = new Intl.DateTimeFormat("en-IN", {
            dateStyle: "full",
            timeStyle: "long",
            timeZone,
        }).format(now);

        return {
            success: true,
            timeZone,
            dateTime: result,
        };

    } catch (error) {
        return {
            success: false,
            error: "Invalid timezone provided.",
        };
    }
}

module.exports = getDateTime;