// ==========================================
// SAFE CALCULATOR TOOL
// ==========================================

function calculator(expression) {
    try {
        if (typeof expression !== "string" || !expression.trim()) {
            throw new Error("Please provide a mathematical expression.");
        }

        if (expression.length > 200) {
            throw new Error("Expression is too long.");
        }

        const tokens = expression.match(
            /\d*\.?\d+|[+\-*/%()]|\s+/g
        );

        if (!tokens || tokens.join("").replace(/\s/g, "") !== expression.replace(/\s/g, "")) {
            throw new Error("Invalid mathematical expression.");
        }

        const cleanTokens = tokens.filter(token => !/^\s+$/.test(token));

        let position = 0;

        function parseExpression() {
            let value = parseTerm();

            while (position < cleanTokens.length) {
                const operator = cleanTokens[position];

                if (operator !== "+" && operator !== "-") break;

                position++;
                const right = parseTerm();

                value = operator === "+"
                    ? value + right
                    : value - right;
            }

            return value;
        }

        function parseTerm() {
            let value = parseFactor();

            while (position < cleanTokens.length) {
                const operator = cleanTokens[position];

                if (!["*", "/", "%"].includes(operator)) break;

                position++;
                const right = parseFactor();

                if (operator === "/" && right === 0) {
                    throw new Error("Division by zero is not allowed.");
                }

                if (operator === "%" && right === 0) {
                    throw new Error("Modulus by zero is not allowed.");
                }

                if (operator === "*") value *= right;
                if (operator === "/") value /= right;
                if (operator === "%") value %= right;
            }

            return value;
        }

        function parseFactor() {
            const token = cleanTokens[position];

            if (token === "+" || token === "-") {
                position++;
                const value = parseFactor();

                return token === "-" ? -value : value;
            }

            if (token === "(") {
                position++;

                const value = parseExpression();

                if (cleanTokens[position] !== ")") {
                    throw new Error("Missing closing parenthesis.");
                }

                position++;
                return value;
            }

            if (!token || !/^\d*\.?\d+$/.test(token)) {
                throw new Error("Invalid mathematical expression.");
            }

            position++;
            return Number(token);
        }

        const result = parseExpression();

        if (position !== cleanTokens.length) {
            throw new Error("Invalid mathematical expression.");
        }

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation result.");
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