
// ==========================================
// PDS TRACKER - MAIN JAVASCRIPT
// Home Page, Shop Search and User Login
// ==========================================


// 1. SAMPLE RATION SHOP DATA

const shops = [
    {
        name: "Shiv Ration Shop",
        location: "Indore",
        status: "OPEN",
        rice: 120,
        wheat: 80,
        sugar: 35
    },
    {
        name: "Government Fair Price Shop",
        location: "Bhopal",
        status: "OPEN",
        rice: 75,
        wheat: 50,
        sugar: 20
    },
    {
        name: "Jan Seva Ration Shop",
        location: "Ujjain",
        status: "CLOSED",
        rice: 0,
        wheat: 30,
        sugar: 10
    }
];


// 2. DISPLAY RATION SHOPS

function displayShops(shopData) {

    const shopList = document.getElementById("shopList");

    if (!shopList) return;

    shopList.innerHTML = "";

    if (shopData.length === 0) {
        shopList.innerHTML = "<p>No ration shops found.</p>";
        return;
    }

    shopData.forEach(function (shop) {

        const statusClass =
            shop.status === "OPEN" ? "open" : "closed";

        const shopCard = document.createElement("div");

        shopCard.className = "shop-card";

        shopCard.innerHTML = `
            <h3>${shop.name}</h3>

            <p><strong>Location:</strong> ${shop.location}</p>

            <p>
                <strong>Status:</strong>
                <span class="${statusClass}">
                    ${shop.status}
                </span>
            </p>

            <h4>Available Stock</h4>

            <p>Rice: ${shop.rice} kg</p>
            <p>Wheat: ${shop.wheat} kg</p>
            <p>Sugar: ${shop.sugar} kg</p>
        `;

        shopList.appendChild(shopCard);
    });
}


// 3. SEARCH RATION SHOPS

function searchShops() {

    const searchInput = document.getElementById("searchInput");

    if (!searchInput) return;

    const searchValue = searchInput.value.toLowerCase().trim();

    const filteredShops = shops.filter(function (shop) {

        return (
            shop.name.toLowerCase().includes(searchValue) ||
            shop.location.toLowerCase().includes(searchValue)
        );

    });

    displayShops(filteredShops);
}


// 4. SHOW ALL RATION SHOPS

function showAllShops() {

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.value = "";
    }

    displayShops(shops);
}


// Make functions available to HTML onclick attributes

window.searchShops = searchShops;
window.showAllShops = showAllShops;


// 5. LOGIN SYSTEM - CONNECTED TO SPRING BOOT BACKEND

const API_URL = "http://localhost:8080/api";

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;

        const message = document.getElementById("loginMessage");

        if (!email || !password) {

            message.textContent = "Please enter email and password.";
            message.style.color = "red";

            return;
        }

        message.textContent = "Please wait...";
        message.style.color = "blue";

        try {

            const response = await fetch(`${API_URL}/auth/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message || data.error || "Invalid email or password."
                );

            }

            if (!data.token || !data.role) {

                throw new Error("Login response is missing the token or user role.");

            }

            // Save login information

            localStorage.setItem("token", data.token);

            localStorage.setItem("user", JSON.stringify({
                name: data.name,
                email: data.email,
                role: data.role
            }));

            localStorage.setItem("userRole", data.role);

            message.textContent = "Login successful! Redirecting...";
            message.style.color = "green";


            // Redirect according to the role returned by backend

            setTimeout(function () {

                if (data.role === "BENEFICIARY") {

                    window.location.href = "beneficiary.html";

                }

                else if (data.role === "SHOP_DEALER") {

                    window.location.href = "dealer.html";

                }

                else if (data.role === "ADMIN") {

                    window.location.href = "admin.html";

                }

                else {

                    message.textContent = "Invalid user role.";
                    message.style.color = "red";

                }

            }, 1000);

        }

        catch (error) {

            console.error("Login error:", error);

            message.textContent = error.message ||
                "Unable to connect to the server.";

            message.style.color = "red";

        }

    });

}


// 6. LOAD SHOPS WHEN HOME PAGE OPENS

displayShops(shops);
