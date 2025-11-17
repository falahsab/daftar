const API = "https://script.google.com/macros/s/AKfycbyTBztcQHgbaYmtle4dPg0ZWIchR48lnhBZz5Z1fM1qb0RNqYMJSd-ptRcx8u58gaPF/exec";

if (!localStorage.getItem("client_id")) {
    alert("يرجى تسجيل الدخول أولاً");
    window.location = "index.html";
}

document.getElementById("clientName").innerText = localStorage.getItem("client_name");

/* تحميل البيانات */
loadTotal();

async function loadTotal() {
    let res = await fetch(API, {
        method: "POST",
        body: JSON.stringify({
            action: "getClientData",
            client_id: localStorage.getItem("client_id")
        })
    });

    let data = await res.json();
    let total = Number(data.total);

    const balanceText = document.getElementById("balanceText");
    const balanceValue = document.getElementById("balanceValue");

    if (total < 0) {
        balanceText.innerText = "لكم:";
        balanceValue.innerText = Math.abs(total) + " ريال";
        balanceValue.style.color = "#0FA958";
    } else {
        balanceText.innerText = "عليكم:";
        balanceValue.innerText = total + " ريال";
        balanceValue.style.color = "#D13A3A";
    }

    showLast5(data.list);
}

/* زر التحديث */
document.getElementById("refreshBtn").addEventListener("click", loadTotal);

/* ===== ترتيب أحدث 5 عمليات ===== */
function showLast5(list) {
    let box = document.getElementById("lastOpsList");
    box.innerHTML = "";

    list
        .sort((a, b) => new Date(b.date) - new Date(a.date))  /* ← الترتيب الجديد */
        .slice(0, 5)
        .forEach(r => {
            const typeClass = r.type === 'credit' ? 'credit' : 'debit';
            box.innerHTML += `
            <div class="op-card">
                <div class="op-details">
                    <div class="op-date">${new Date(r.date).toLocaleDateString()}</div>
                    <div class="op-note">${r.note}</div>
                </div>
                <div class="op-amount ${typeClass}">
                    ${r.type === 'credit' ? '+' : '-'}${Math.abs(r.amount)}
                </div>
            </div>
            `;
        });
}

/* عرض كشف الحساب */
document.getElementById("showStatementBtn").addEventListener("click", async () => {
    document.getElementById("statementModal").style.display = "block";

    let res = await fetch(API, {
        method: "POST",
        body: JSON.stringify({
            action: "getClientData",
            client_id: localStorage.getItem("client_id")
        })
    });

    let data = await res.json();
    const statementList = document.getElementById("statementList");

    function renderOperations(list) {
        statementList.innerHTML = "";
        list.forEach(r => {
            const typeClass = r.amount >= 0 ? 'debit' : 'credit';
            statementList.innerHTML += `
            <div class="op-card">
                <div class="op-details">
                    <div class="op-date">${new Date(r.date).toLocaleDateString()}</div>
                    <div class="op-note">${r.note}</div>
                </div>
                <div class="op-amount ${typeClass}">
                    ${r.amount >= 0 ? '-' : '+'}${Math.abs(r.amount)}
                </div>
            </div>
            `;
        });
    }

    /* ← ترتيب كامل العمليات من الأحدث إلى الأقدم */
    renderOperations(
        data.list.sort((a, b) => new Date(b.date) - new Date(a.date))
    );

    /* فلترة التاريخ */
    document.getElementById("fromDate").addEventListener("change", filterOps);
    document.getElementById("toDate").addEventListener("change", filterOps);

    function filterOps() {
        const from = document.getElementById("fromDate").value;
        const to = document.getElementById("toDate").value;

        const fromDate = from ? new Date(from + "T00:00:00") : null;
        const toDate = to ? new Date(to + "T23:59:59") : null;

        const filtered = data.list.filter(r => {
            const date = new Date(r.date);
            if (fromDate && date < fromDate) return false;
            if (toDate && date > toDate) return false;
            return true;
        });

        /* ← ترتيب نتائج الفلترة أيضاً */
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        renderOperations(filtered);
    }
});

/* إغلاق كشف الحساب */
document.getElementById("closeStatement").addEventListener("click", () => {
    document.getElementById("statementModal").style.display = "none";
});

/* تسجيل الخروج */
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("client_id");
    localStorage.removeItem("client_name");
    window.location = "index.html";
});
