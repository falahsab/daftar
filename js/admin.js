// API الخاص بك
const API = "https://script.google.com/macros/s/AKfycbzoGjNE5FYkiU8Jt2nMsv9Mpekk8W82ND717dX5oPuyFNWRjM54TmnnEMt-VW-PboXF/exec";

// تسجيل الخروج
function logout(){ localStorage.clear(); window.location.href="index.html"; }

// نافذة إضافة عميل
function showAddClientModal(){ document.getElementById("addClientModal").style.display="block"; }
function closeAddClientModal(){ document.getElementById("addClientModal").style.display="none"; }

// البحث في العملاء
document.getElementById("search_client").addEventListener("input",function(){
    const term=this.value.toLowerCase();
    const options=document.getElementById("client_select").options;
    for(let i=0;i<options.length;i++){ options[i].style.display = options[i].text.toLowerCase().includes(term)?"":"none"; }
});

// جلب العملاء
let allClients=[];
async function loadClients(){
    const res = await fetch(API,{ method:"POST", body: JSON.stringify({action:"getClients"})});
    const data = await res.json();
    allClients = data;
    const select = document.getElementById("client_select");
    select.innerHTML=`<option value="">اختر العميل</option>`;
    data.forEach(c=>{
        let opt=document.createElement("option");
        opt.value=c.client_id; opt.textContent=`${c.name} (${c.mobile})`;
        select.appendChild(opt);
    });
}

// إضافة عميل
async function addClient(){
    const name=document.getElementById("new_name").value.trim();
    const mobile=document.getElementById("new_mobile").value.trim();
    const username=document.getElementById("new_username").value.trim();
    const password=document.getElementById("new_password").value.trim();
    const msg=document.getElementById("clientMsg");
    if(!name||!mobile||!username||!password){ msg.innerText="يرجى تعبئة كل الحقول"; msg.style.color="red"; return; }
    const res=await fetch(API,{ method:"POST", body: JSON.stringify({action:"addClient",name,mobile,username,password}) });
    const data=await res.json();
    if(data.status==="success"){ msg.innerText="تمت الإضافة بنجاح"; msg.style.color="green"; closeAddClientModal(); loadClients(); }
    else{ msg.innerText="حدث خطأ أثناء الإضافة"; msg.style.color="red"; }
}

// إضافة عملية مالية
async function addTrans(){
    const client_id=document.getElementById("client_select").value;
    let amount=Number(document.getElementById("amount").value);
    const type=document.getElementById("type").value;
    const note=document.getElementById("note").value;
    const msg=document.getElementById("msg");
    if(!client_id||!amount||!note){ msg.innerText="يرجى تعبئة كل الحقول"; msg.style.color="red"; return; }
    if(type==="credit") amount=-Math.abs(amount); else amount=Math.abs(amount);

    const res=await fetch(API,{ method:"POST", body: JSON.stringify({action:"addTransaction",client_id,amount,type,note}) });
    const data=await res.json();
    if(data.status==="success"){ msg.innerText="تمت الإضافة بنجاح"; msg.style.color="green"; document.getElementById("amount").value=""; document.getElementById("note").value=""; loadTransactions(); }
    else{ msg.innerText="حدث خطأ أثناء الإضافة"; msg.style.color="red"; }
}

// تحميل العمليات
let currentClientId=""; let clientTransactions=[];
async function loadTransactions(){
    currentClientId=document.getElementById("client_select").value;
    if(!currentClientId) return;
    const res=await fetch(API,{ method:"POST", body: JSON.stringify({action:"getClientData", client_id: currentClientId}) });
    const data=await res.json();
    if(data.status!=="success") return;
    clientTransactions=data.list;
    let total=data.total;
    document.getElementById("total_info").innerText=`إجمالي الرصيد: ${total>=0?"عليه "+total:"له "+Math.abs(total)} ريال`;
renderTransactions(
    clientTransactions
        .sort((a,b)=> new Date(b.date) - new Date(a.date))
        .slice(0,5)
);
}
function showAllTransactions(){ renderTransactions(clientTransactions); }

let currentTransId=null;
function openTransModal(trans_id){
    currentTransId=trans_id;
    const t=clientTransactions.find(tr=>tr.trans_id==trans_id);
    if(!t) return;
    document.getElementById("modal_amount").value=Math.abs(t.amount);
    document.getElementById("modal_type").value=t.type;
    document.getElementById("modal_note").value=t.note;
    document.getElementById("transModal").style.display="block";
}
function closeTransModal(){ document.getElementById("transModal").style.display="none"; currentTransId=null; }

async function saveTransModal(){
    if(!currentTransId) return;
    let amount=Number(document.getElementById("modal_amount").value);
    const type=document.getElementById("modal_type").value;
    const note=document.getElementById("modal_note").value;
    if(type==="credit") amount=-Math.abs(amount); else amount=Math.abs(amount);
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
    // ترتيب العمليات من الأحدث إلى الأقدم
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const table=document.getElementById("transTable");
    table.innerHTML=`<tr><th>ID</th><th>العميل</th><th>المبلغ</th><th>النوع</th><th>البيان</th><th>التاريخ</th></tr>`;
    
    const clientName = allClients.find(c => c.client_id == currentClientId)?.name || "غير معروف";

    transactions.forEach(t=>{
        let row = table.insertRow();
        row.onclick = () => openTransModal(t.trans_id);
        row.innerHTML = `
            <td>${t.trans_id}</td>
            <td>${clientName}</td>
            <td>${Math.abs(t.amount)}</td>
            <td>${t.type === 'debit' ? 'عليه' : 'له'}</td>
            <td>${t.note}</td>
            <td>${new Date(t.date).toLocaleDateString()}</td>
        `;
    });
}


// تحميل العملاء عند الفتح
loadClients();
document.getElementById("client_select").addEventListener("change",loadTransactions);
