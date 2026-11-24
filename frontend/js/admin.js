
const API_URL = "https://pds-tracker.onrender.com/api";

const token = localStorage.getItem("token");

// Check admin login
if (!token) {
    alert("Please login as administrator.");
    window.location.href = "login.html";
}


// Common API request function
async function sendRequest(url, options = {}) {

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
        throw new Error(
            "Access denied. Please login with your administrator account."
        );
    }

    if (!response.ok) {
        throw new Error(
            data.message || data.error || "Unable to complete request."
        );
    }

    return data;
}


// Display all shops
function displayShops(shops) {

    const container = document.getElementById("adminShop");
    container.innerHTML = "";

    if (!shops.length) {
        container.textContent = "No shops registered.";
        return;
    }

    shops.forEach(shop => {

        const card = document.createElement("div");

        card.innerHTML = `
            <hr>
            <p><b>Shop Name:</b> ${shop.shopName}</p>
            <p><b>Location:</b> ${shop.location || shop.address || "Not available"}</p>
            <p><b>Status:</b> ${shop.status}</p>
            <p><b>Shop ID:</b> ${shop.shopId}</p>
        `;

        container.appendChild(card);
    });
}


// Display all commodity stock
function displayStock(stocks) {

    const container = document.getElementById("adminStock");
    container.innerHTML = "";

    if (!stocks.length) {
        container.textContent = "No stock information available.";
        return;
    }

    stocks.forEach(stock => {

        const item = document.createElement("p");

        item.textContent =
            stock.shopName + " - " +
            stock.commodityName + ": " +
            stock.quantity + " " + stock.unit;

        container.appendChild(item);
    });
}


// Display registered users
function displayUsers(users) {

    const container = document.getElementById("adminUsers");
    container.innerHTML = "";

    if (!users.length) {
        container.textContent = "No registered users found.";
        return;
    }

    users.forEach(user => {

        const item = document.createElement("div");

        item.innerHTML = `
            <hr>
            <p><b>Name:</b> ${user.name}</p>
            <p><b>Email:</b> ${user.email}</p>
            <p><b>Phone:</b> ${user.phone || "Not available"}</p>
            <p><b>Role:</b> ${user.role}</p>
        `;

        container.appendChild(item);
    });
}


// Display activity logs
function displayLogs(logs) {

    const container = document.getElementById("adminLogs");
    container.innerHTML = "";

    if (!logs.length) {
        container.textContent = "No activity logs found.";
        return;
    }

    logs.slice().reverse().forEach(log => {

        const item = document.createElement("div");

        item.innerHTML = `
            <hr>
            <p><b>User:</b> ${log.userName}</p>
            <p><b>Action:</b> ${log.action}</p>
            <p><b>Description:</b> ${log.description}</p>
            <p><b>Date:</b> ${
                log.activityTimestamp
                    ? new Date(log.activityTimestamp).toLocaleString()
                    : "Not available"
            }</p>
        `;

        container.appendChild(item);
    });
}


// Display all beneficiary complaints
function displayComplaints(complaints) {

    const container = document.getElementById("adminComplaints");
    container.innerHTML = "";

    if (!complaints.length) {
        container.textContent = "No complaints submitted yet.";
        return;
    }

    complaints.forEach(complaint => {

        const card = document.createElement("div");
        card.className = "complaint-card";

        const heading = document.createElement("h3");
        heading.textContent = "Complaint #" + complaint.complaintId;

        const user = document.createElement("p");
        user.textContent = "Beneficiary User ID: " + complaint.userId;

        const subject = document.createElement("p");
        subject.textContent = "Subject: " + complaint.subject;

        const description = document.createElement("p");
        description.textContent = "Description: " + complaint.description;

        const date = document.createElement("p");
        date.textContent = "Submitted: " +
            (complaint.createdAt
                ? new Date(complaint.createdAt).toLocaleString()
                : "Not available");

        const statusLabel = document.createElement("label");
        statusLabel.textContent = "Complaint Status: ";

        const statusSelect = document.createElement("select");

        const statuses = [
            { value: "PENDING", label: "Pending" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "REJECTED", label: "Rejected" }
        ];

        statuses.forEach(status => {

            const option = document.createElement("option");
            option.value = status.value;
            option.textContent = status.label;

            if (complaint.status === status.value) {
                option.selected = true;
            }

            statusSelect.appendChild(option);
        });

        statusLabel.appendChild(statusSelect);

        const updateButton = document.createElement("button");
        updateButton.type = "button";
        updateButton.textContent = "Update Status";

        const message = document.createElement("p");

        updateButton.addEventListener("click", async function () {

            updateButton.disabled = true;
            message.textContent = "Updating status...";

            try {

                await sendRequest(
                    `${API_URL}/admin/complaints/${complaint.complaintId}/status`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            status: statusSelect.value
                        })
                    }
                );

                message.textContent = "Complaint status updated successfully.";

                await loadComplaints();

            } catch (error) {

                message.textContent = error.message;
                updateButton.disabled = false;
            }
        });

        card.appendChild(heading);
        card.appendChild(user);
        card.appendChild(subject);
        card.appendChild(description);
        card.appendChild(date);
        card.appendChild(statusLabel);
        card.appendChild(document.createElement("br"));
        card.appendChild(updateButton);
        card.appendChild(message);
        card.appendChild(document.createElement("hr"));

        container.appendChild(card);
    });
}


// Load complaints separately
async function loadComplaints() {

    const container = document.getElementById("adminComplaints");

    container.textContent = "Loading complaints...";

    try {

        const complaints = await sendRequest(
            `${API_URL}/admin/complaints`
        );

        displayComplaints(complaints);

    } catch (error) {

        console.error("Complaint loading error:", error);
        container.textContent = error.message;
    }
}


// Load all dashboard information
async function loadAdminDashboard() {

    document.getElementById("lastChecked").textContent =
        "Loading dashboard information...";

    try {

        const [shops, stocks, users, logs] = await Promise.all([

            sendRequest(`${API_URL}/admin/shops`),

            sendRequest(`${API_URL}/admin/stock`),

            sendRequest(`${API_URL}/admin/users`),

            sendRequest(`${API_URL}/admin/logs`)

        ]);

        displayShops(shops);
        displayStock(stocks);
        displayUsers(users);
        displayLogs(logs);

        document.getElementById("lastChecked").textContent =
            "Last checked: " + new Date().toLocaleString();

    } catch (error) {

        console.error("Admin dashboard error:", error);

        document.getElementById("lastChecked").textContent =
            error.message;

        if (error.message.includes("administrator account")) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userRole");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }
    }

    // Load complaints independently
    await loadComplaints();
}


// Logout
document.getElementById("logout").addEventListener("click", function () {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");

});


// Load dashboard automatically
loadAdminDashboard();
