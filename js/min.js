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
// تسجيل Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("Service Worker Registered"))
    .catch((err) => console.error("SW registration failed:", err));
}


// زر تثبيت التطبيق
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // عرض الزر بعد 6 ثوانٍ
  setTimeout(() => {
    // إنشاء عنصر container للـ Shadow DOM
    const container = document.createElement("div");
    document.body.appendChild(container);

    // إنشاء Shadow Root
    const shadow = container.attachShadow({ mode: "open" });

    // إنشاء الزر داخل Shadow DOM
    const installBtn = document.createElement("button");
    installBtn.textContent = "⚡ تثبيت التطبيق";

    // CSS مستقل داخل Shadow DOM
    const style = document.createElement("style");
    style.textContent = `
      button {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) scale(0);
        z-index: 10000;
        padding: 12px 28px;
        font-size: 16px;
        font-weight: 700;
        color: #fff;
        background: linear-gradient(135deg, #1f1f1f, #333333);
        border: 1px solid #6c5ce7;
        border-radius: 25px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        opacity: 0;
        transition: all 0.4s ease, opacity 0.5s ease;
      }
      button:hover {
        transform: translateX(-50%) scale(1.05);
        box-shadow: 0 6px 18px rgba(0,0,0,0.7);
        background: linear-gradient(135deg, #333333, #444444);
      }
    `;

    // إضافة style والزر للـ Shadow DOM
    shadow.appendChild(style);
    shadow.appendChild(installBtn);

    // ظهور تدريجي
    requestAnimationFrame(() => {
      installBtn.style.transform = "translateX(-50%) scale(1)";
      installBtn.style.opacity = "1";
    });

    // إخفاء الزر بعد 10 ثوانٍ من ظهوره
    setTimeout(() => {
      installBtn.style.opacity = 0;
      installBtn.style.transform = "translateX(-50%) scale(0.8)";
      setTimeout(() => container.remove(), 500); // إزالة container كامل بعد fade-out
    }, 10000);

    // عند الضغط على الزر لتثبيت التطبيق
    installBtn.addEventListener("click", async () => {
      container.remove();
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(outcome === "accepted" ? "تم التثبيت" : "تم رفض التثبيت");
      deferredPrompt = null;
    });

  }, 6000); // ← 6 ثوانٍ قبل ظهور الزر
});

// ← خاص بضهو اسبلاش



    window.addEventListener('load', () => {
      setTimeout(() => {
        const splash = document.getElementById('splash');
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
          document.getElementById('content').style.opacity = '1';
          document.body.style.overflow = 'auto';
        }, 1000);
      }, 2000); // ← مدة العرض (2 ثانية)
    });
