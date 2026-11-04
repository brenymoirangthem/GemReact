const calculator = require("./calculator");

// ==========================================
// TOOL REGISTRY
// ==========================================

const tools = {
    calculator: (args) => {
        return calculator(args.expression);
    }
};

// ==========================================
// AUTOMATIC TOOL DETECTION
// ==========================================

function detectToolCall(message) {

    const calculationPattern =
        /(?:calculate|compute|solve|what is)\s+(.+)/i;

    const match = message.match(calculationPattern);

    if (!match) {
        return null;
    }

    // Normalize mathematical operators
    const expression = match[1]
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/[?]/g, "")
        .trim();

    // Check whether the expression contains only
    // permitted mathematical characters
    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
        return null;
    }

    return {
        toolName: "calculator",
        args: {
            expression
        }
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