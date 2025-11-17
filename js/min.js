// رابط السكربت الصحيح الذي يدعم العملاء والأدمن
const API = "https://script.google.com/macros/s/AKfycbyqo_4LRAisFoN_QrUO6nTRez1o9AgvxCFLQJzxV3DbyKczaJN0EtAXwuDMXwUMlp5c/exec";

async function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let msg = document.getElementById("msg");

    msg.innerText = "";

    if (username === "" || password === "") {
        msg.innerText = "يرجى تعبئة جميع الحقول";
        return;
    }

    try {
        let res = await fetch(API, {
            method: "POST",
            body: JSON.stringify({
                action: "login",
                username,
                password
            })
        });

        let data = await res.json();

        if (data.status !== "success") {
            msg.innerText = data.message || "خطأ في اسم المستخدم أو كلمة المرور";
            return;
        }

        // حفظ بيانات العميل أو الانتقال للأدمن
        if (data.role === "client") {
            localStorage.setItem("client_id", data.client_id);
            localStorage.setItem("client_name", data.name);
            window.location = "client.html";
        } else if (data.role === "admin") {
            localStorage.setItem("role", "admin");
            window.location = "admin.html";
        }

    } catch (err) {
        msg.innerText = "خطأ في الاتصال بالسيرفر";
        console.error(err);
    }
}
     // تحديد مدة الجلسه
    document.addEventListener("click", () => {
    const expire = localStorage.getItem("session_expire");
    if (expire && Date.now() < Number(expire)) {
        // تمديد الجلسة تلقائياً
        const sessionDuration = 30 * 60 * 1000; // 30 دقيقة
        localStorage.setItem("session_expire", Date.now() + sessionDuration);
    }
});
