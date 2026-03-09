// Get the login form from the webpage
const form = document.getElementById("loginForm");

// When someone submits the login form, do this function
form.addEventListener("submit", async function (e) {
    // Stop the form from reloading the page
    e.preventDefault();

    // Get the email address the person typed
    const email = document.getElementById("username").value.trim();
    // Get the password the person typed
    const password = document.getElementById("password").value.trim();

    // Get the error message boxes from the webpage
    const userError = document.getElementById("userError");
    const passError = document.getElementById("passError");
    const message = document.getElementById("formMessage");

    // Clear any old error messages
    userError.textContent = "";
    passError.textContent = "";
    message.textContent = "";

    // Assume the form is correct by default
    let valid = true;

    // Check if the email is valid (at least 3 characters)
    if (!email || email.length < 3) {
        // Show an error message under the email field
        userError.textContent = "Email must be valid";
        valid = false;
    }

    // Check if the password is at least 6 characters long
    if (password.length < 6) {
        // Show an error message under the password field
        passError.textContent = "Password must be at least 6 characters";
        valid = false;
    }

    // If there are errors, don't proceed
    if (!valid) return;

    try {
        // Show a blue message that we're logging in
        message.style.color = "blue";
        message.textContent = "Logging in...";

        // Send the email and password to the server to check if they're correct
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        // Get the response from the server
        const data = await response.json();

        // If the login didn't work, show a red error message
        if (!response.ok) {
            message.style.color = "red";
            message.textContent = data.message || "Login failed";
            return;
        }

        // Save the login token and user information in the browser's memory
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Show a green success message
        message.style.color = "green";
        message.textContent = "Login successful... Redirecting";

        // After 1.5 seconds, redirect them to their dashboard based on their job role
        setTimeout(() => {
            const role = data.role;
            if (role === "manager") {
                // If they're a manager, send them to the manager dashboard
                window.location.href = "./manager.html";
            } else if (role === "sales") {
                // If they're a sales agent, send them to the sales dashboard
                window.location.href = "./sales.html";
            } else if (role === "director") {
                // If they're a director, send them to the director dashboard
                window.location.href = "./director.html";
            } else {
                // If something is wrong, send them back to login
                window.location.href = "./sign-in.html";
            }
        }, 1500);
    } catch (error) {
        // If there's a network error, show a red error message
        message.style.color = "red";
        message.textContent = "Network error: " + error.message;
    }
});