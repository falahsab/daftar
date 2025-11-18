const API = "https://script.google.com/macros/s/AKfycbyVpJCk3vbby4L9Pl3U2UwRz8S_NeD3kwpLWqGcDHOkxR2xj2A2S3KG94mXHHoRWuKi/exec";

function logout(){ localStorage.clear(); window.location.href="index.html"; }

function showAddClientModal(){ document.getElementById("addClientModal").style.display="block"; }
function closeAddClientModal(){ document.getElementById("addClientModal").style.display="none"; }
function closeTransModal(){ document.getElementById("transModal").style.display="none"; currentTransId=null; }



let allClients = [];
async function loadClients(){
    document.getElementById("loading").textContent = "جاري تحميل العملاء...";
    const res = await fetch(API, { method:"POST", body: JSON.stringify({action:"getClients"})});
    const data = await res.json();
    allClients = data;
    const select = document.getElementById("client_select");
    select.innerHTML = `<option value="">اختر العميل</option>`;
    data.forEach(c=>{
        let opt = document.createElement("option");
        opt.value = c.client_id;
        opt.textContent = `${c.name} (${c.mobile})`;
        select.appendChild(opt);
    });
    document.getElementById("loading").textContent = "";
}

async function addClient(){
    const name = document.getElementById("new_name").value.trim();
    const mobile = document.getElementById("new_mobile").value.trim();
    const username = document.getElementById("new_username").value.trim();
    const password = document.getElementById("new_password").value.trim();
    const msg = document.getElementById("clientMsg");
    if(!name || !mobile || !username || !password){ msg.textContent="يرجى تعبئة كل الحقول"; msg.style.color="red"; return; }
    const res = await fetch(API, { method:"POST", body: JSON.stringify({action:"addClient",name,mobile,username,password})});
    const data = await res.json();
    if(data.status==="success"){ msg.textContent="تمت الإضافة بنجاح"; msg.style.color="green"; closeAddClientModal(); loadClients(); }
    else{ msg.textContent="حدث خطأ أثناء الإضافة"; msg.style.color="red"; }
}

async function addTrans(){
    const client_id = document.getElementById("client_select").value;
    let amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const note = document.getElementById("note").value;
    const msg = document.getElementById("msg");
    if(!client_id || !amount || !note){ msg.textContent="يرجى تعبئة كل الحقول"; msg.style.color="red"; return; }
    amount = type==="credit" ? -Math.abs(amount) : Math.abs(amount);
    const res = await fetch(API,{ method:"POST", body: JSON.stringify({action:"addTransaction",client_id,amount,type,note})});
    const data = await res.json();
    if(data.status==="success"){ msg.textContent="تمت الإضافة بنجاح"; msg.style.color="green"; document.getElementById("amount").value=""; document.getElementById("note").value=""; loadTransactions(); }
    else{ msg.textContent="حدث خطأ أثناء الإضافة"; msg.style.color="red"; }
}

let currentClientId=""; let clientTransactions=[]; let currentTransId=null;

async function loadTransactions(){
    currentClientId=document.getElementById("client_select").value;
    if(!currentClientId) return;
    document.getElementById("loading").textContent = "جاري تحميل العمليات...";
    const res = await fetch(API,{ method:"POST", body: JSON.stringify({action:"getClientData", client_id: currentClientId}) });
    const data = await res.json();
    document.getElementById("loading").textContent = "";
    if(data.status!=="success") return;
    clientTransactions = data.list.sort((a,b)=>new Date(b.date)-new Date(a.date));
    const total = data.total;
    document.getElementById("total_info").textContent = `إجمالي الرصيد: ${total>=0?"عليه "+total:"له "+Math.abs(total)} ريال`;
    renderTransactions(clientTransactions.slice(0,3));
}

function showAllTransactions(){ renderTransactions(clientTransactions); }

function openTransModal(trans_id){
    currentTransId=trans_id;
    const t=clientTransactions.find(tr=>tr.trans_id==trans_id);
    if(!t) return;
    document.getElementById("modal_amount").value=Math.abs(t.amount);
    document.getElementById("modal_type").value=t.type;
    document.getElementById("modal_note").value=t.note;
    document.getElementById("transModal").style.display="block";
}

async function saveTransModal(){
    if(!currentTransId) return;
    let amount=Number(document.getElementById("modal_amount").value);
    const type=document.getElementById("modal_type").value;
    const note=document.getElementById("modal_note").value;
    if(!amount||!note){ alert("يرجى تعبئة كل الحقول"); return; }
    amount = type==="credit" ? -Math.abs(amount) : Math.abs(amount);
    const res=await fetch(API,{ method:"POST", body: JSON.stringify({ action:"updateTransaction", trans_id:currentTransId, amount, type, note }) });
    const data=await res.json();
    if(data.success||data.status==="success"){ alert("تم الحفظ بنجاح"); closeTransModal(); loadTransactions(); }
    else alert("حدث خطأ أثناء الحفظ");
}

async function deleteTransModal(){
    if(!currentTransId) return;
    if(!confirm("هل أنت متأكد من حذف العملية؟")) return;
    const res=await fetch(API,{ method:"POST", body: JSON.stringify({action:"deleteTransaction",trans_id:currentTransId}) });
    const data=await res.json();
    if(data.success||data.status==="success"){ alert("تم الحذف بنجاح"); closeTransModal(); loadTransactions(); }
    else alert("حدث خطأ أثناء الحذف");
}

function renderTransactions(transactions){
    const table=document.getElementById("transTable");
    table.innerHTML='';
    const header = ["ID","العميل","المبلغ","النوع","البيان","التاريخ"];
    const trHeader = document.createElement("tr");
    header.forEach(h=>{ const th = document.createElement("th"); th.textContent=h; trHeader.appendChild(th); });
    table.appendChild(trHeader);

    const clientName = allClients.find(c=>c.client_id==currentClientId)?.name || "غير معروف";
    transactions.forEach(t=>{
        const row = table.insertRow();
        row.onclick = ()=>openTransModal(t.trans_id);
        const cells = [
            t.trans_id,
            clientName,
            Math.abs(t.amount),
            t.type==='debit'?'عليه':'له',
            t.note,
            new Date(t.date).toLocaleDateString()
        ];
        cells.forEach((c,i)=>{
            const cell = row.insertCell();
            cell.textContent = c;
            if(i===2){ cell.className = t.type==='debit'?'debit':'credit'; }
        });
    });
}

loadClients();
document.getElementById("client_select").addEventListener("change",loadTransactions);

// إغلاق النوافذ عند الضغط خارجها
window.onclick = function(event){
    const addModal = document.getElementById("addClientModal");
    const transModal = document.getElementById("transModal");
    if(event.target===addModal) addModal.style.display="none";
    if(event.target===transModal) transModal.style.display="none";
};

// ===================== إضافات: جلب وعرض صافي حسابات العملاء =====================

// جلب صافي الحسابات وعرضها في مودال
async function showClientsBalances() {
    document.getElementById("loading").textContent = "جاري تحميل أرصدة العملاء...";
    try {
        const res = await fetch(API, { method: "POST", body: JSON.stringify({ action: "getClientsBalance" }) });
        const data = await res.json();
        document.getElementById("loading").textContent = "";

        if (!Array.isArray(data)) {
            alert("حدث خطأ أثناء جلب البيانات");
            return;
        }

        // تعبئة الجدول
        const tbody = document.querySelector("#clientsBalanceTable tbody");
        tbody.innerHTML = "";
        data.forEach(c => {
            const tr = document.createElement("tr");
            const idTd = document.createElement("td");
            idTd.textContent = c.client_id;
            const nameTd = document.createElement("td");
            nameTd.textContent = c.name;
            const mobileTd = document.createElement("td");
            mobileTd.textContent = c.mobile;
            const totalTd = document.createElement("td");
            const totalVal = Number(c.total);
            totalTd.textContent = totalVal >= 0 ? `عليه ${totalVal}` : `له ${Math.abs(totalVal)}`;
            totalTd.style.fontWeight = "bold";
            totalTd.style.color = totalVal >= 0 ? "red" : "green";

            tr.appendChild(idTd);
            tr.appendChild(nameTd);
            tr.appendChild(mobileTd);
            tr.appendChild(totalTd);
            tbody.appendChild(tr);
        });

        // فتح المودال
        openClientsModal();
    } catch (err) {
        document.getElementById("loading").textContent = "";
        alert("فشل جلب أرصدة العملاء");
        console.error(err);
    }
}

function openClientsModal() {
    const m = document.getElementById("clientsModal");
    m.style.display = "flex";
    m.style.alignItems = "center";
}

function closeClientsModal() {
    document.getElementById("clientsModal").style.display = "none";
}

// فلترة بسيطة لجدول العملاء
function filterClientsTable() {
    const q = document.getElementById("search_client").value.trim().toLowerCase();
    const rows = document.querySelectorAll("#clientsBalanceTable tbody tr");
    rows.forEach(r => {
        const name = r.children[1].textContent.toLowerCase();
        const mobile = r.children[2].textContent.toLowerCase();
        if (name.includes(q) || mobile.includes(q) || q === "") r.style.display = "";
        else r.style.display = "none";
    });
}

// ==============================================================================
