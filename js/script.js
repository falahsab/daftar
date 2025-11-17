const API = "https://script.google.com/macros/s/AKfycbwalL1AfqLL2B3gOyrjz_FAKywJG7rbKdpT7wNQ8DEvinGT23VXPATS4CwcGjOhuFb9/exec";


let res = await fetch(API, {
method: "POST",
body: JSON.stringify({
action: "login",
username,
password
})
});


let data = await res.json();


if (!data.success) {
document.getElementById("msg").innerText = "خطأ في تسجيل الدخول";
return;
}


localStorage.setItem("client_id", data.client_id);
localStorage.setItem("client_name", data.name);


window.location = "client.html";
}


// صفحة العميل
if (location.pathname.includes("client.html")) loadClient();


async function loadClient() {
document.getElementById("clientName").innerText = localStorage.getItem("client_name");


let res = await fetch(API, {
method: "POST",
body: JSON.stringify({
action: "getClientData",
client_id: localStorage.getItem("client_id")
})
});


let data = await res.json();


document.getElementById("total").innerText = data.total + " ريال";


let html = `
<tr><th>التاريخ</th><th>النوع</th><th>المبلغ</th><th>البيان</th></tr>
`;


data.list.forEach(r => {
html += `<tr>
<td>${new Date(r.date).toLocaleDateString()}</td>
<td>${r.type === 'in' ? 'له' : 'عليه'}</td>
<td>${r.amount}</td>
<td>${r.note}</td>
</tr>`;
});


document.getElementById("table").innerHTML = html;
}


// لوحة التحكم
async function addTrans() {
let client_id = document.getElementById("client_id").value;
let amount = document.getElementById("amount").value;
let type = document.getElementById("type").value;
let note = document.getElementById("note").value;


let res = await fetch(API, {
method: "POST",
body: JSON.stringify({
action: "addTransaction",
client_id,
amount,
type,
note
})
});


let data = await res.json();


document.getElementById("msg").innerText = data.success ? "تمت الإضافة" : "فشل الإضافة";
}