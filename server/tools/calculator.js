// ==========================================
// CALCULATOR TOOL
// ==========================================

function calculator(expression) {

    try {

        // Allow only basic mathematical expressions
        if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
            throw new Error("Invalid mathematical expression");
        }

        // Evaluate the expression
        const result = Function(
            `"use strict"; return (${expression})`
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation result");
        }

        return {
            success: true,
            expression,
            result
        };

    } catch (error) {

        return {
            success: false,
            error: error.message
        };

    }
}

module.exports = calculator;