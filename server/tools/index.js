const getDateTime = require("./datetime");
const calculator = require("./calculator");

// ==========================================
// TOOL REGISTRY
// ==========================================

const tools = {
    calculator: (args) => {
        return calculator(args.expression);
    },

    datetime: (args) => {
        return getDateTime(args.timeZone || "Asia/Kolkata");
    }
};

// ==========================================
// AUTOMATIC TOOL DETECTION
// ==========================================

function detectToolCall(message) {
    const lowerMessage = message.toLowerCase();

    // DATE AND TIME DETECTION
    const dateTimePatterns = [
        /current date/,
        /current time/,
        /today'?s date/,
        /what time is it/,
        /what is the date/,
        /date and time/,
        /current date and time/
    ];

    const isDateTimeRequest = dateTimePatterns.some(
        (pattern) => pattern.test(lowerMessage)
    );

    if (isDateTimeRequest) {
        return {
            toolName: "datetime",
            args: {
                timeZone: "Asia/Kolkata"
            }
        };
    }

    // CALCULATOR DETECTION
    const calculationPattern =
        /(?:calculate|compute|solve|what is)\s+(.+)/i;

    const match = message.match(calculationPattern);

    if (!match) {
        return null;
    }

    const expression = match[1]
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/[?]/g, "")
        .trim();

    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
        return null;
    }

    return {
        toolName: "calculator",
        args: { expression }
    };
}

// ==========================================
// TOOL EXECUTION
// ==========================================

function executeTool(toolName, args) {

    const tool = tools[toolName];

    if (!tool) {
        return {
            success: false,
            error: `Tool '${toolName}' not found`
        };
    }

    return tool(args);
}

module.exports = {
    tools,
    executeTool,
    detectToolCall
};