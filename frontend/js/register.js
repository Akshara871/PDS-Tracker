
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const message = document.getElementById("registerMessage");
    const registerButton = registerForm.querySelector("button[type='submit']");

    if (password.length < 8) {
        message.textContent =
            "Password must contain at least 8 characters.";
        message.style.color = "red";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.style.color = "red";
        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Registering...";

    try {
        const response = await fetch(
             "https://pds-tracker.onrender.com/api/auth/register",            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || data.error ||
                "Registration failed. Please try again."
            );
        }

        message.textContent =
            "Registration successful! You can now log in.";
        message.style.color = "green";

        registerForm.reset();

    } catch (error) {
        console.error("Registration error:", error);

        message.textContent =
            error.message === "Failed to fetch"
            ? "Cannot connect to the server. Please start the backend."
            : error.message;

        message.style.color = "red";

    } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Register";
    }
});
