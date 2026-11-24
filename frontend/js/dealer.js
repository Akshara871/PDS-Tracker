
const API_URL = "https://pds-tracker.onrender.com";

let SHOP_ID = null;

const commodityIds = {
    rice: 1,
    wheat: 2,
    sugar: 3
};

const token = localStorage.getItem("token");

const statusSelect = document.getElementById("shopStatus");
const commoditySelect = document.getElementById("commodity");
const quantityInput = document.getElementById("quantity");
const message = document.getElementById("message");
const stockDisplay = document.getElementById("stockDisplay");

let currentStock = {};
let currentStatus = null;


// Check dealer login
if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}


// Common API request function
async function sendRequest(url, method = "GET", body = null) {

    const response = await fetch(url, {
        method: method,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : undefined
    });

    const responseText = await response.text();

    let data = {};

    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch {
        data = {};
    }

    if (response.status === 401 || response.status === 403) {
        throw new Error(
            "Session expired or access denied. Please login with your dealer account."
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message || data.error || responseText ||
            "Something went wrong."
        );
    }

    return data;
}


// Display shop and saved stock
function displayStock() {

    if (!stockDisplay) return;

    stockDisplay.innerHTML = "";

    const shopHeading = document.createElement("h3");
    shopHeading.textContent = "Shop ID: " + SHOP_ID;
    stockDisplay.appendChild(shopHeading);

    const status = document.createElement("p");
    status.textContent = "Shop Status: " + (currentStatus || "Unknown");
    stockDisplay.appendChild(status);

    const heading = document.createElement("h3");
    heading.textContent = "Available Commodity Stock";
    stockDisplay.appendChild(heading);

    ["rice", "wheat", "sugar"].forEach(commodity => {

        const item = document.createElement("p");

        const quantity = currentStock[commodity];

        item.textContent =
            commodity.charAt(0).toUpperCase() +
            commodity.slice(1) +
            ": " +
            (quantity !== undefined ? quantity + " Kg" : "Not updated");

        stockDisplay.appendChild(item);
    });
}


// Load shop details and stock from database
async function loadDealerData() {

    message.textContent = "Loading saved shop information...";
    message.style.color = "blue";

    try {

        // Get dealer's shop
        const shop = await sendRequest(
            `${API_URL}/dealer/shop`
        );

        SHOP_ID = shop.shopId;

        currentStatus = shop.status;

        // Update shop information in dashboard
        const shopInfo = document.querySelector(".dashboard-card");

        if (shopInfo) {

            const paragraphs = shopInfo.querySelectorAll("p");

            if (paragraphs[0]) {
                paragraphs[0].innerHTML =
                    "<b>Shop Name:</b> " + shop.shopName;
            }

            if (paragraphs[1]) {
                paragraphs[1].innerHTML =
                    "<b>Location:</b> " +
                    (shop.location || shop.address || "Not available");
            }
        }
        // Dealer Logout
document.getElementById("logoutBtn")?.addEventListener("click", function (e) {
    e.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

    window.location.href = "login.html";
});

        // Set current shop status in dropdown
        statusSelect.value = currentStatus;

        // Get saved stock
        const stocks = await sendRequest(
            `${API_URL}/dealer/shop/${SHOP_ID}/stock`
        );

        currentStock = {};

        stocks.forEach(stock => {

            const commodityName =
                stock.commodityName.toLowerCase();

            if (commodityName === "rice") {
                currentStock.rice = stock.quantity;
            }

            else if (commodityName === "wheat") {
                currentStock.wheat = stock.quantity;
            }

            else if (commodityName === "sugar") {
                currentStock.sugar = stock.quantity;
            }
        });

        displayStock();

        message.textContent =
            "Shop information and saved stock loaded successfully.";

        message.style.color = "green";

    }

    catch (error) {

        console.error("Loading dealer data error:", error);

        message.textContent = error.message;
        message.style.color = "red";

        if (error.message.includes("login with your dealer account")) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userRole");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
    }
}


// 1. UPDATE SHOP STATUS
document.getElementById("saveStatus").addEventListener("click", async () => {

    if (!SHOP_ID) {
        message.textContent = "Shop information is still loading.";
        message.style.color = "red";
        return;
    }

    const status = statusSelect.value;

    message.textContent = "Updating shop status...";
    message.style.color = "blue";

    try {

        await sendRequest(
            `${API_URL}/dealer/shop/status`,
            "PUT",
            {
                shopId: SHOP_ID,
                status: status
            }
        );

        currentStatus = status;

        displayStock();

        message.textContent =
            "Shop status updated successfully in database.";

        message.style.color = "green";

    }

    catch (error) {

        console.error("Status update error:", error);

        message.textContent = error.message;
        message.style.color = "red";
    }

});


// 2. UPDATE COMMODITY STOCK
document.getElementById("updateStock").addEventListener("click", async () => {

    if (!SHOP_ID) {
        message.textContent = "Shop information is still loading.";
        message.style.color = "red";
        return;
    }

    const commodity = commoditySelect.value;
    const quantity = Number(quantityInput.value);

    if (
        quantityInput.value.trim() === "" ||
        !Number.isFinite(quantity) ||
        quantity < 0
    ) {

        message.textContent =
            "Please enter a valid non-negative quantity.";

        message.style.color = "red";
        return;
    }

    const commodityId = commodityIds[commodity];

    if (!commodityId) {

        message.textContent = "Invalid commodity selected.";
        message.style.color = "red";
        return;
    }

    message.textContent = "Updating stock...";
    message.style.color = "blue";

    try {

        await sendRequest(
            `${API_URL}/dealer/stock`,
            "POST",
            {
                shopId: SHOP_ID,
                commodityId: commodityId,
                quantity: quantity
            }
        );

        currentStock[commodity] = quantity;

        displayStock();

        message.textContent =
            commodity.toUpperCase() +
            " stock updated successfully in database.";

        message.style.color = "green";

        quantityInput.value = "";

    }

    catch (error) {

        console.error("Stock update error:", error);

        message.textContent = error.message;
        message.style.color = "red";
    }

});


// 3. LOAD DATA AUTOMATICALLY WHEN PAGE OPENS
loadDealerData();
