async function testAPI() {
    try {
        const response = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Hello, GemReact backend!"
            })
        });

        const data = await response.json();

        console.log("Response from backend:");
        console.log(data);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testAPI();