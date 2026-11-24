
const API_URL = "https://pds-tracker.onrender.com";

const token = localStorage.getItem("token");

const shopList = document.getElementById("beneficiaryShopList");
const searchInput = document.getElementById("beneficiarySearch");

const complaintForm = document.getElementById("complaintForm");
const complaintSubject = document.getElementById("complaintSubject");
const complaintDescription = document.getElementById("complaintDescription");
const complaintMessage = document.getElementById("complaintMessage");
const myComplaints = document.getElementById("myComplaints");

let allShops = [];

if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
}

// Handle API requests
async function authorizedRequest(url, options = {}) {

    const response = await fetch(url, {
        ...options,
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const responseText = await response.text();

    let data = {};

    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch {
        data = {};
    }

    if (response.status === 401 || response.status === 403) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");

        alert("Session expired or access denied. Please login again.");
        window.location.href = "login.html";

        throw new Error("Session expired.");
    }

    if (!response.ok) {
        throw new Error(data.message || "Unable to process request.");
    }

    return data;
}


// 1. Fetch GET data
async function fetchAPI(url) {
    return await authorizedRequest(url, {
        method: "GET"
    });
}


// 2. Fetch stock for a particular shop
async function getShopStock(shopId) {

    return await fetchAPI(
        `${API_URL}/beneficiary/shops/${shopId}/stock`
    );
}


// 3. Display ration shops
function displayShops(shops) {

    if (!shopList) return;

    shopList.innerHTML = "";

    if (shops.length === 0) {
        shopList.textContent = "No matching ration shops found.";
        return;
    }

    shops.forEach(shop => {

        const card = document.createElement("div");
        card.className = "shop-card";

        const title = document.createElement("h3");
        title.textContent = shop.shopName || "Ration Shop";

        const location = document.createElement("p");
        location.textContent =
            "Location: " + (shop.location || shop.address || "Not available");

        const address = document.createElement("p");
        address.textContent =
            "Address: " + (shop.address || "Not available");

        const status = document.createElement("p");
        status.textContent = "Status: " + shop.status;
        status.className =
            shop.status === "OPEN" ? "open" : "closed";

        const stockHeading = document.createElement("h4");
        stockHeading.textContent = "Available Stock";

        const stockContainer = document.createElement("div");
        stockContainer.textContent = "Loading stock...";

        const updated = document.createElement("small");
        updated.textContent = "Last updated: Loading...";

        card.append(
            title,
            location,
            address,
            status,
            stockHeading,
            stockContainer,
            updated
        );

        shopList.appendChild(card);

        getShopStock(shop.shopId)
            .then(stockData => {

                stockContainer.innerHTML = "";

                if (!Array.isArray(stockData) || stockData.length === 0) {
                    stockContainer.textContent =
                        "No stock information available.";

                    updated.textContent = "Last updated: Not available";
                    return;
                }

                let latestUpdate = null;

                stockData.forEach(item => {

                    const stockItem = document.createElement("p");

                    stockItem.textContent =
                        `${item.commodityName}: ${item.quantity} ${item.unit}`;

                    stockContainer.appendChild(stockItem);

                    if (item.lastUpdated) {

                        const itemDate = new Date(item.lastUpdated);

                        if (!isNaN(itemDate.getTime()) &&
                            (!latestUpdate || itemDate > latestUpdate)) {

                            latestUpdate = itemDate;
                        }
                    }
                });

                updated.textContent = latestUpdate
                    ? "Last updated: " + latestUpdate.toLocaleString()
                    : "Last updated: Not available";

            })
            .catch(error => {

                stockContainer.textContent = "Unable to load stock.";

                console.error(
                    "Stock loading error for shop " + shop.shopId,
                    error
                );
            });
    });
}


// 4. Fetch all shops
async function loadShops() {

    if (!shopList) return;

    shopList.textContent = "Loading ration shops...";

    try {

        const data = await fetchAPI(
            `${API_URL}/beneficiary/shops`
        );

        allShops = Array.isArray(data) ? data : [];

        displayShops(allShops);

    } catch (error) {

        console.error("Shop loading error:", error);

        shopList.textContent = error.message;
    }
}


// 5. Search ration shops
function searchShops() {

    const query = searchInput.value.trim().toLowerCase();

    const filtered = allShops.filter(shop => {

        const name = (shop.shopName || "").toLowerCase();

        const location = (
            shop.location || shop.address || ""
        ).toLowerCase();

        return name.includes(query) || location.includes(query);
    });

    displayShops(filtered);
}


// 6. Show all shops
function showAllShops() {

    searchInput.value = "";

    displayShops(allShops);
}


// 7. Search button
const searchButton = document.getElementById("searchButton");

if (searchButton) {
    searchButton.addEventListener("click", searchShops);
}


// 8. Show all button
const showAllButton = document.getElementById("showAllButton");

if (showAllButton) {
    showAllButton.addEventListener("click", showAllShops);
}


// 9. Search while typing
if (searchInput) {
    searchInput.addEventListener("input", searchShops);
}


// 10. Submit a complaint
if (complaintForm) {

    complaintForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const subject = complaintSubject.value.trim();
        const description = complaintDescription.value.trim();

        if (!subject || !description) {
            complaintMessage.textContent =
                "Please fill in all complaint details.";

            return;
        }

        const submitButton = complaintForm.querySelector(
            'button[type="submit"]'
        );

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        complaintMessage.textContent = "";

        try {

            const result = await authorizedRequest(
                `${API_URL}/beneficiary/complaints`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        subject: subject,
                        description: description
                    })
                }
            );

            complaintMessage.textContent =
                "Complaint submitted successfully! Complaint ID: " +
                result.complaintId;

            complaintMessage.style.color = "green";

            complaintForm.reset();

            await loadMyComplaints();

        } catch (error) {

            complaintMessage.textContent = error.message;
            complaintMessage.style.color = "red";

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Submit Complaint";
        }
    });
}


// 11. Load beneficiary complaints
async function loadMyComplaints() {

    if (!myComplaints) return;

    myComplaints.textContent = "Loading complaints...";

    try {

        const complaints = await fetchAPI(
            `${API_URL}/beneficiary/complaints`
        );

        displayMyComplaints(complaints);

    } catch (error) {

        console.error("Complaint loading error:", error);

        myComplaints.textContent = error.message;
    }
}


// 12. Display beneficiary complaints
function displayMyComplaints(complaints) {

    myComplaints.innerHTML = "";

    if (!Array.isArray(complaints) || complaints.length === 0) {

        myComplaints.textContent = "You have not submitted any complaints yet.";

        return;
    }

    complaints.forEach(complaint => {

        const card = document.createElement("div");
        card.className = "complaint-card";

        const heading = document.createElement("h3");
        heading.textContent = complaint.subject;

        const description = document.createElement("p");
        description.textContent = complaint.description;

        const status = document.createElement("p");
        status.textContent = "Status: " + complaint.status;
        status.className = "complaint-status";

        const date = document.createElement("small");

        date.textContent = complaint.createdAt
            ? "Submitted: " +
              new Date(complaint.createdAt).toLocaleString()
            : "Submission date not available";

        const id = document.createElement("p");
        id.textContent = "Complaint ID: " + complaint.complaintId;

        card.append(heading, description, status, date, id);

        myComplaints.appendChild(card);
    });
}


// 13. Logout
const logoutButton = document.getElementById("logout");

if (logoutButton) {

    logoutButton.addEventListener("click", function() {

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
    });
}


// 14. Load dashboard data when page opens
loadShops();
loadMyComplaints();
