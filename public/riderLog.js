function renderHtmlContent(htmlContent) {
    // Create a new HTML document
    const newDoc = document.open("text/html", "replace");
    newDoc.write(htmlContent);
    newDoc.close();
}

async function submitForm() {
    try {
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        // Assuming you have an API endpoint on localhost:3000
        var apiUrl = "http://localhost:3000/riderLogin";

        // You can use fetch to send data to the server
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email, password: password }),
        });

        if (!response.ok) {
            // Check if the response status is a redirect (3xx)
            if (response.redirected) {
                // Redirect the page
                window.location.href = response.url;
                return;
            } else {
                // Handle other non-okay status codes
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }

        // Check if the response content type is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            // Parse HTML content and render it
            const htmlContent = await response.text();
            renderHtmlContent(htmlContent);
        } else if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log("Server response:", data);
            // Handle the server response as needed
        } else {
            // If the content type is not JSON, handle it accordingly
            const text = await response.text();
            console.log("Non-JSON response:", text);
            // Handle non-JSON response
        }
    } catch (error) {
        console.error("Error:", error);
        // Handle other errors
    }
}
