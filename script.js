"use strict";

// ==========================================
// 1. KONFIGURASI FIREBASE CLOUD
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyA5svW_GZ6bCIhewmrk8TXMDuJ1CekWFKc",
  authDomain: "tonvault-248cb.firebaseapp.com",
  databaseURL: "https://tonvault-248cb-default-rtdb.firebaseio.com",
  projectId: "tonvault-248cb",
  storageBucket: "tonvault-248cb.firebasestorage.app",
  messagingSenderId: "984871958367",
  appId: "1:984871958367:web:6d1dd5c10e4006a59de8ea",
  measurementId: "G-YRRRZQR0QH"
};

let dbFirebase = null;
try {
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    dbFirebase = firebase.database();
    console.log("🟢 FIREBASE CONNECTED: EduSched tersinkronisasi online.");
  }
} catch (e) {
  console.warn("⚠️ FIREBASE ERROR: Menggunakan penyimpanan lokal.");
}

const SESSION_KEY = "edusched_session_v1";

let db = {
    users: [],
    departments: [],
    programs: [],
    lecturers: [],
    students: [],
    courses: [],
    classes: [],
    schedules: [],
    grades: [],
    materials: [],
    announcements: [],
    logs: [],
    krs: []
};

let currentUser;
let activePage = "dashboard";
let currentFormType = "";
let openDropdowns = { katalog: true }; 

const menuByRole = {
  admin: [
    { id: "dashboard", label: "📊 Dashboard" },
    {
      id: "katalog",
      label: "🗂 Menu",
      isDropdown: true,
      children: [
        { id: "departments", label: "🏢 Jurusan" },
        { id: "programs", label: "🎓 Program Studi" },
        { id: "lecturers", label: "👨‍🏫 Dosen" },
        { id: "students", label: "👥 Mahasiswa" },
        { id: "courses", label: "📚 Mata Kuliah" },
        { id: "classes", label: "🏫 Kelas" },
        { id: "schedules", label: "🗓 Jadwal" },
        { id: "grades", label: "📝 Nilai" },
        { id: "users", label: "🔐 User" }
      ]
    },
    { id: "backup", label: "💾 Backup & Reset" },
    { id: "logs", label: "🕘 Log Aktivitas" },
    // Profil dipindah ke urutan paling bawah
    { id: "profile", label: "👤 Profil Saya" } 
  ],
  dosen: [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "schedules", label: "🗓 Jadwal Mengajar" },
    { id: "classes", label: "🏫 Kelas" },
    { id: "grades", label: "📝 Input Nilai" },
    { id: "materials", label: "📚 Materi" },
    // Profil dipindah ke urutan paling bawah
    { id: "profile", label: "👤 Profil Saya" }
  ],
  mahasiswa: [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "schedules", label: "🗓 Jadwal Kuliah" },
    { id: "krs", label: "📋 KRS" },
    { id: "grades", label: "📝 Nilai Saya" },
    { id: "materials", label: "📚 Materi" },
    { id: "announcements", label: "📢 Pengumuman" },
    // Profil dipindah ke urutan paling bawah
    { id: "profile", label: "👤 Profil Saya" }
  ]
};

const pageTitles = {
  dashboard: ["Dashboard", "Ringkasan akademik"],
  profile: ["Profil Saya", "Kelola data diri dan foto profil"],
  catalog: ["Katalog Akademik", "Akses seluruh data master"],
  departments: ["Jurusan", "Data jurusan"],
  programs: ["Program Studi", "Data program studi"],
  lecturers: ["Dosen", "Data dosen"],
  students: ["Mahasiswa", "Data mahasiswa"],
  courses: ["Mata Kuliah", "Data mata kuliah"],
  classes: ["Kelas", "Data kelas"],
  schedules: ["Jadwal Kuliah", "Jadwal perkuliahan"],
  grades: ["Nilai", "Data nilai mahasiswa"],
  users: ["Manajemen User", "Kelola akun pengguna"],
  backup: ["Backup & Reset", "Simpan, pulihkan, atau hapus seluruh data"],
  logs: ["Log Aktivitas", "Riwayat aktivitas"],
  materials: ["Materi", "Materi perkuliahan"],
  krs: ["KRS", "Kartu rencana studi"],
  announcements: ["Pengumuman", "Informasi akademik"]
};

function createInitialDB() {
  return {
    users: [
      { id: "u1", username: "admin", password: "admin123", name: "Administrator", role: "admin" },
      { id: "u2", username: "dosen", password: "dosen123", name: "Budi Santoso", role: "dosen" },
      { id: "u3", username: "mahasiswa", password: "mhs123", name: "Siti Rahma", role: "mahasiswa", nim: "2024001" }
    ],
    departments: [{ id: "d1", name: "Teknik Informatika" }, { id: "d2", name: "Sistem Informasi" }],
    programs: [{ id: "p1", name: "S1 Informatika" }, { id: "p2", name: "S1 Sistem Informasi" }],
    lecturers: [{ id: "l1", name: "Budi Santoso", nidn: "00112233" }],
    students: [{ id: "s1", name: "Siti Rahma", nim: "2024001", program: "S1 Informatika" }],
    courses: [
      { id: "c1", name: "Pemrograman Web", code: "IF201", sks: 3 },
      { id: "c2", name: "Basis Data", code: "IF202", sks: 3 }
    ],
    classes: [{ id: "k1", name: "IF-4A", course: "Pemrograman Web" }],
    schedules: [{ id: "j1", course: "Pemrograman Web", day: "Senin", time: "08:00 - 10:30", room: "Lab 1" }],
    grades: [{ id: "n1", student: "Siti Rahma", nim: "2024001", course: "Pemrograman Web", score: 85, lecturer: "Budi Santoso" }],
    materials: [{ id: "m1", title: "Pengenalan HTML dan CSS", course: "Pemrograman Web", lecturer: "Budi Santoso" }],
    announcements: [{ id: "a1", title: "Jadwal Ujian Tengah Semester", content: "Ujian dilaksanakan sesuai jadwal akademik." }],
    logs: [],
    krs: []
  };
}

// ==========================================
// SINKRONISASI REAL-TIME DENGAN FIREBASE
// ==========================================
function initCloudRealtimeSync(callback) {
  if (!dbFirebase) {
      const saved = localStorage.getItem("edusched_database_offline");
      if (saved) {
          db = JSON.parse(saved);
          if (!db.krs) db.krs = [];
      } else {
          db = createInitialDB();
          saveDB();
      }
      if (callback) callback();
      return;
  }

// Fungsi untuk memvalidasi apakah akun yang sedang login masih ada di database
function validateActiveSession() {
  if (currentUser && db.users) {
    const userExists = db.users.some(u => u.id === currentUser.id);
    if (!userExists) {
      // Tampilkan Modal Alert Keren alih-alih alert() bawaan browser
      const alertModal = document.getElementById("alertModal");
      if (alertModal) {
        alertModal.classList.remove("hidden");
        
        // Tombol OK diklik -> langsung logout
        const okBtn = document.getElementById("alertOkBtn");
        if (okBtn) {
          okBtn.onclick = () => {
            alertModal.classList.add("hidden");
            logout();
          };
        }
      } else {
        logout(); // Cadangan jika modal belum termuat
      }
    }
  }
}

  const stateRef = dbFirebase.ref('edusched_global_state');
 stateRef.on('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    db = data;
    if (!db.krs) db.krs = [];
  } else {
    db = createInitialDB();
    saveDB();
  }

  validateActiveSession(); // Tambahkan ini di sini!

  if (currentUser) {
     updateAvatarUI();
     if (activePage) renderPage(activePage);
  }
  });
}

function saveDB() {
  validateActiveSession(); // Tambahkan ini agar tervalidasi saat data disimpan

  if (dbFirebase) {
    dbFirebase.ref('edusched_global_state').set(db).catch(err => console.warn(err));
  }
  localStorage.setItem("edusched_database_offline", JSON.stringify(db));
}

// Fungsi untuk memvalidasi apakah akun yang sedang login masih ada di database
function validateActiveSession() {
  if (currentUser && db.users) {
    const userExists = db.users.some(u => u.id === currentUser.id);
    if (!userExists) {
      // Jika akun sudah dihapus dari database, paksa logout otomatis
      alert("Akun Anda telah dihapus oleh Administrator. Sesi Anda akan diakhiri.");
      logout();
    }
  }
}

// Fungsi untuk memvalidasi apakah akun yang sedang login masih ada di database
function validateActiveSession() {
  if (currentUser && db.users) {
    const userExists = db.users.some(u => u.id === currentUser.id);
    if (!userExists) {
      const alertModal = document.getElementById("alertModal");
      if (alertModal) {
        alertModal.classList.remove("hidden");
        
        const okBtn = document.getElementById("alertOkBtn");
        if (okBtn) {
          okBtn.onclick = () => {
            alertModal.classList.add("hidden");
            logout();
          };
        }
      } else {
        logout();
      }
    }
  }
}

function saveSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
}

function loadSession() {
  const session = localStorage.getItem(SESSION_KEY);
  if (session) {
    currentUser = JSON.parse(session);
    return true;
  }
  return false;
}

function createId(prefix = "id") {
  return prefix + Date.now() + Math.random().toString(16).slice(2);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function addLog(action) {
  if (!db.logs) db.logs = [];
  db.logs.unshift({
    id: createId("log"),
    user: currentUser ? currentUser.name : "Sistem",
    role: currentUser ? currentUser.role : "-",
    action,
    date: new Date().toLocaleString("id-ID")
  });
  saveDB();
}

// Fungsi Login yang Diperkuat (Mendukung Database Lokal & Firebase)
function login(username, password) {
  if (!db.users) {
    db = createInitialDB();
  }

  const user = db.users.find(
    item => item.username.toLowerCase() === username.toLowerCase() && item.password === password
  );

  if (!user) {
    const msgEl = document.getElementById("loginMessage");
    if (msgEl) {
      msgEl.textContent = "Username atau password salah! (Coba: admin / admin123)";
    } else {
      alert("Username atau password salah!");
    }
    return;
  }

  currentUser = user;
  saveSession();
  addLog("Login ke dalam sistem");
  startApp();
}

function logout() {
  addLog("Logout dari sistem");
  localStorage.removeItem(SESSION_KEY);
  location.reload();
}

function startApp() {
  const loginPage = document.getElementById("loginPage") || document.getElementById("login-page");
  const appPage = document.getElementById("appPage") || document.getElementById("dashboard-page");
  
  if (loginPage) loginPage.classList.add("hidden");
  if (appPage) appPage.classList.remove("hidden");
  
  updateAvatarUI();
  renderMenu();
  showPage("dashboard");
}

function updateAvatarUI() {
  const nameEl = document.getElementById("userName");
  const roleEl = document.getElementById("userRole");
  const avatarEl = document.getElementById("userAvatar");
  
  if (nameEl) nameEl.textContent = currentUser.name;
  if (roleEl) roleEl.textContent = currentUser.role;
  if (avatarEl) {
    if (currentUser.photo) {
      avatarEl.innerHTML = `<img src="${currentUser.photo}" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
      avatarEl.innerHTML = currentUser.name.charAt(0).toUpperCase();
    }
  }
}

function toggleDropdown(id) {
  openDropdowns[id] = !openDropdowns[id];
  renderMenu();
}

function renderMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;
  const items = menuByRole[currentUser.role] || [];

  menu.innerHTML = items.map(item => {
    if (item.isDropdown) {
      const isOpen = openDropdowns[item.id];
      return `
        <div class="menu-dropdown">
          <button class="menu-button" onclick="toggleDropdown('${item.id}')">
            <span>${item.label}</span>
            <span style="font-size: 10px; color: #94a3b8;">${isOpen ? "▲" : "▼"}</span>
          </button>
          
          <div class="menu-submenu ${isOpen ? "open" : ""}">
            ${item.children.map(child => `
              <button class="submenu-button ${activePage === child.id ? "active" : ""}"
                onclick="showPage('${child.id}')">
                <span>${child.label}</span>${activePage === child.id ? '<span class="active-dot"></span>' : ''}
              </button>
            `).join("")}
          </div>
        </div>
      `;
    }

    return `
      <button class="menu-button ${activePage === item.id ? "active" : ""}"
        onclick="showPage('${item.id}')">
        ${item.label}
      </button>
    `;
  }).join("");
}

function showPage(page) {
  activePage = page;
  const title = pageTitles[page] || ["Halaman", ""];
  const pageTitleEl = document.getElementById("pageTitle");
  const pageSubtitleEl = document.getElementById("pageSubtitle");
  
  if (pageTitleEl) pageTitleEl.textContent = title[0];
  if (pageSubtitleEl) pageSubtitleEl.textContent = title[1];

  renderMenu();
  renderPage(page);
}

function renderPage(page) {
  const content = document.getElementById("content");
  if (!content) return;

  if (page === "dashboard") content.innerHTML = renderDashboard();
  else if (page === "profile") content.innerHTML = renderProfile();
  else if (page === "catalog") content.innerHTML = renderCatalog();
  else if (page === "backup") content.innerHTML = renderBackup();
  else if (page === "logs") content.innerHTML = renderLogs();
  else if (page === "grades") content.innerHTML = renderGrades();
  else if (page === "materials") content.innerHTML = renderMaterials();
  else if (page === "announcements") content.innerHTML = renderAnnouncements();
  else if (page === "schedules") content.innerHTML = renderSchedules();
  else if (page === "krs") content.innerHTML = renderKRS();
  else content.innerHTML = renderTablePage(page);
}

/* DASHBOARD */
/* DASHBOARD */
/* DASHBOARD */
function renderDashboard() {
  const gradeCount = currentUser.role === "mahasiswa"
    ? db.grades.filter(item => item.nim === currentUser.nim).length
    : db.grades.length;

  return `
    <div class="stats-grid" style="margin-top: 10px;">
      <!-- Kartu Mahasiswa -->
      <div class="stat-card" style="border-top: 4px solid #3b82f6;">
        <div class="stat-icon" style="background: #eff6ff; color: #3b82f6;">👥</div>
        <div class="stat-info">
          <span>Total Mahasiswa</span>
          <strong>${db.students.length}</strong>
        </div>
      </div>
      
      <!-- Kartu Dosen -->
      <div class="stat-card" style="border-top: 4px solid #10b981;">
        <div class="stat-icon" style="background: #ecfdf5; color: #10b981;">👨‍🏫</div>
        <div class="stat-info">
          <span>Total Dosen</span>
          <strong>${db.lecturers.length}</strong>
        </div>
      </div>
      
      <!-- Kartu Mata Kuliah -->
      <div class="stat-card" style="border-top: 4px solid #8b5cf6;">
        <div class="stat-icon" style="background: #f5f3ff; color: #8b5cf6;">📚</div>
        <div class="stat-info">
          <span>Total Mata Kuliah</span>
          <strong>${db.courses.length}</strong>
        </div>
      </div>
      
      <!-- Kartu Nilai -->
      <div class="stat-card" style="border-top: 4px solid #f59e0b;">
        <div class="stat-icon" style="background: #fffbeb; color: #f59e0b;">📝</div>
        <div class="stat-info">
          <span>${currentUser.role === "mahasiswa" ? "Nilai Saya" : "Total Nilai"}</span>
          <strong>${gradeCount}</strong>
        </div>
      </div>
    </div>
    
    <!-- Panel Informasi -->
    <div class="panel info-panel">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <span style="font-size: 24px;">🚀</span>
        <h3 style="margin: 0; color: #1e293b; font-size: 18px;">Informasi Sistem EduSched</h3>
      </div>
      <p style="color: #475569; line-height: 1.6; margin: 0;">Data portal akademik ini tersinkronisasi secara real-time melalui <b>Firebase Cloud Database</b>. Semua perubahan data yang Anda lakukan akan langsung tersimpan dengan aman dan diperbarui ke semua pengguna.</p>
    </div>
  `;
}

/* PROFILE */
/* PROFILE (Aman dari Error Undefined) */
function renderProfile() {
  if (!currentUser) return `<div class="panel">Sesi pengguna tidak ditemukan. Silakan login ulang.</div>`;

  const photoSrc = currentUser.photo || "";
  const photoHTML = photoSrc
    ? `<img src="${photoSrc}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">`
    : `<div style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: white; display: grid; place-items: center; font-size: 48px; font-weight: bold; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">${escapeHTML((currentUser.name || "U").charAt(0).toUpperCase())}</div>`;

  const isMahasiswa = currentUser.role === 'mahasiswa';
  const readOnlyAttr = isMahasiswa ? 'readonly style="background-color: #f1f5f9; color: #94a3b8; cursor: not-allowed;" title="Hubungi Admin untuk mengubah data ini"' : 'required';
  const userNim = currentUser.nim || '';

  return `
    <div class="page-head">
      <div><h3>Profil Saya</h3><p>Perbarui informasi akun dan foto profil Anda.</p></div>
    </div>
    <div class="panel" style="max-width: 500px; margin: 0 auto;">
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 1px solid var(--border); padding-bottom: 24px; margin-bottom: 24px;">
        ${photoHTML}
        <input type="file" id="photoUpload" accept="image/*" style="display: none;" onchange="handlePhotoUpload(event)">
        <button class="btn secondary small-btn" onclick="document.getElementById('photoUpload').click()">Pilih Foto Baru</button>
      </div>
      <form id="profileForm" onsubmit="saveProfile(event)">
        <label>Nama Lengkap</label>
        <input type="text" id="profName" value="${escapeHTML(currentUser.name || '')}" required>
        
        <label>Username ${isMahasiswa ? '<small style="color:var(--danger)">(Dikunci)</small>' : ''}</label>
        <input type="text" id="profUsername" value="${escapeHTML(currentUser.username || '')}" ${readOnlyAttr}>
        
        ${currentUser.role !== 'admin' ? `
          <label>${currentUser.role === 'mahasiswa' ? 'NIM <small style="color:var(--danger)">(Dikunci)</small>' : 'NIDN'}</label>
          <input type="text" id="profNim" value="${escapeHTML(userNim)}" ${readOnlyAttr}>
        ` : ''}
        
        <label>Password Baru <small style="color:var(--muted); font-weight:normal;">(Kosongkan jika tidak diubah)</small></label>
        <input type="password" id="profPassword" placeholder="Masukkan password baru">
        <button type="submit" class="btn primary full">Simpan Profil</button>
      </form>
    </div>
  `;
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    currentUser.photo = base64;

    const userIndex = db.users.findIndex(u => u.id === currentUser.id);
    if(userIndex > -1) db.users[userIndex].photo = base64;

    saveDB();
    saveSession();
    renderPage('profile');
    updateAvatarUI();
    showToast("Foto profil berhasil diperbarui.");
  };
  reader.readAsDataURL(file);
}

function saveProfile(event) {
  event.preventDefault();
  const newName = document.getElementById("profName").value.trim();
  const newUsername = document.getElementById("profUsername").value.trim();
  const newPassword = document.getElementById("profPassword").value;
  const profNimEl = document.getElementById("profNim");
  const newNim = profNimEl ? profNimEl.value.trim() : currentUser.nim;

  currentUser.name = newName;
  currentUser.username = newUsername;
  if (profNimEl) currentUser.nim = newNim;
  if (newPassword) currentUser.password = newPassword;

  const userIndex = db.users.findIndex(u => u.id === currentUser.id);
  if(userIndex > -1) {
    db.users[userIndex].name = newName;
    db.users[userIndex].username = newUsername;
    if (profNimEl) db.users[userIndex].nim = newNim;
    if (newPassword) db.users[userIndex].password = newPassword;
  }

  saveDB();
  saveSession();
  updateAvatarUI();
  showToast("Profil berhasil disimpan.");
}

/* KATALOG */
function renderCatalog() {
  if (currentUser.role !== "admin") return `<div class="panel">Akses hanya untuk admin.</div>`;
  const catalogs = [
    ["🏢", "Jurusan", "departments"], ["🎓", "Program Studi", "programs"],
    ["👨‍🏫", "Dosen", "lecturers"], ["👥", "Mahasiswa", "students"],
    ["📚", "Mata Kuliah", "courses"], ["🏫", "Kelas", "classes"],
    ["🗓", "Jadwal", "schedules"], ["📝", "Nilai", "grades"], ["🔐", "User", "users"]
  ];

  return `
    <div class="page-head"><div><h3>Katalog Akademik</h3><p>Pilih data yang ingin dikelola.</p></div></div>
    <div class="catalog-grid">
      ${catalogs.map(item => `
        <button class="catalog-item" onclick="showPage('${item[2]}')">
          <span>${item[0]}</span><b>${item[1]}</b><small>Kelola data${item[1]}</small>
        </button>
      `).join("")}
    </div>
  `;
}

/* TABLE UMUM */
function renderTablePage(page) {
  const config = {
    departments: { title: "Jurusan", button: "Tambah Jurusan", headers: ["Nama Jurusan"], rows: item => [item.name] },
    programs: { title: "Program Studi", button: "Tambah Program Studi", headers: ["Nama Program Studi"], rows: item => [item.name] },
    lecturers: { title: "Dosen", button: "Tambah Dosen", headers: ["Nama", "NIDN"], rows: item => [item.name, item.nidn] },
    students: { title: "Mahasiswa", button: "Tambah Mahasiswa", headers: ["Nama", "NIM", "Program Studi"], rows: item => [item.name, item.nim, item.program] },
    courses: { title: "Mata Kuliah", button: "Tambah Mata Kuliah", headers: ["Mata Kuliah", "Kode", "SKS"], rows: item => [item.name, item.code, item.sks] },
    classes: { title: "Kelas", button: "Tambah Kelas", headers: ["Nama Kelas", "Mata Kuliah"], rows: item => [item.name, item.course] },
    users: { title: "Manajemen User", button: "Tambah User", headers: ["Nama", "Username", "Role", "NIM/NIDN"], rows: item => [item.name, item.username, item.role, item.nim || "-"] }
  };

  const selected = config[page];
  if (!selected) return `<div class="panel">Data tidak tersedia.</div>`;

  const canAdd = currentUser.role === "admin" && ["departments", "programs", "lecturers", "students", "courses", "classes", "users"].includes(page);
  const data = db[page] || [];

  return `
    <div class="page-head">
      <div><h3>${selected.title}</h3><p>Kelola data ${selected.title.toLowerCase()}.</p></div>
      ${canAdd ? `<button class="btn primary" onclick="openForm('${page}')">+ ${selected.button}</button>` : ""}
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr>${selected.headers.map(h => `<th>${h}</th>`).join("")}${canAdd ? "<th>Aksi</th>" : ""}</tr></thead>
        <tbody>
          ${data.length ? data.map(item => `
            <tr>${selected.rows(item).map(v => `<td>${escapeHTML(v)}</td>`).join("")}
            ${canAdd ? `<td><button class="btn danger small-btn" onclick="deleteData('${page}', '${item.id}')">Hapus</button></td>` : ""}</tr>
          `).join("") : `<tr><td colspan="${selected.headers.length + (canAdd ? 1 : 0)}" style="text-align:center; padding: 20px;">Belum ada data.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

/* NILAI */
function renderGrades() {
  let grades = currentUser.role === "mahasiswa" ? db.grades.filter(item => item.nim === currentUser.nim) : db.grades;
  const canAdd = currentUser.role === "admin" || currentUser.role === "dosen";

  return `
    <div class="page-head">
      <div><h3>${currentUser.role === "mahasiswa" ? "Nilai Saya" : "Data Nilai"}</h3><p>Nilai tersinkron otomatis.</p></div>
      ${canAdd ? `<button class="btn primary" onclick="openForm('grades')">+ Input Nilai</button>` : ""}
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Mahasiswa</th><th>NIM</th><th>Mata Kuliah</th><th>Nilai</th><th>Dosen</th>${canAdd ? "<th>Aksi</th>" : ""}</tr></thead>
        <tbody>
          ${grades.length ? grades.map(item => `
            <tr><td>${escapeHTML(item.student)}</td><td>${escapeHTML(item.nim)}</td><td>${escapeHTML(item.course)}</td>
            <td><span class="badge">${item.score}</span></td><td>${escapeHTML(item.lecturer)}</td>${canAdd ? `<td><button class="btn danger small-btn" onclick="deleteData('grades', '${item.id}')">Hapus</button></td>` : ""}</tr>
          `).join("") : `<tr><td colspan="6" style="text-align:center; padding: 20px;">Belum ada nilai.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

/* JADWAL */
function renderSchedules() {
  const canAdd = currentUser.role === "admin";
  return `
    <div class="page-head"><div><h3>Jadwal Kuliah</h3></div>
      ${canAdd ? `<button class="btn primary" onclick="openForm('schedules')">+ Tambah Jadwal</button>` : ""}
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Mata Kuliah</th><th>Hari</th><th>Waktu</th><th>Ruangan</th>${canAdd ? "<th>Aksi</th>" : ""}</tr></thead>
        <tbody>
          ${db.schedules.length ? db.schedules.map(item => `
            <tr><td>${escapeHTML(item.course)}</td><td>${escapeHTML(item.day)}</td><td>${escapeHTML(item.time)}</td><td>${escapeHTML(item.room)}</td>${canAdd ? `<td><button class="btn danger small-btn" onclick="deleteData('schedules', '${item.id}')">Hapus</button></td>` : ""}</tr>
          `).join("") : `<tr><td colspan="5" style="text-align:center; padding: 20px;">Belum ada jadwal.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

/* MATERI & PENGUMUMAN */
function renderMaterials() {
  const canAdd = currentUser.role === "dosen";
  return `
    <div class="page-head"><div><h3>Materi Perkuliahan</h3></div>
      ${canAdd ? `<button class="btn primary" onclick="openForm('materials')">+ Tambah Materi</button>` : ""}
    </div>
    <div class="catalog-grid">
      ${db.materials.map(item => `<div class="catalog-item"><span>📄</span><b>${escapeHTML(item.title)}</b><small>${escapeHTML(item.course)}</small><small>Dosen:${escapeHTML(item.lecturer)}</small></div>`).join("")}
    </div>
  `;
}

function renderAnnouncements() {
  const canAdd = currentUser.role === "admin";
  return `
    <div class="page-head"><div><h3>Pengumuman</h3></div>
      ${canAdd ? `<button class="btn primary" onclick="openForm('announcements')">+ Tambah Pengumuman</button>` : ""}
    </div>
    ${db.announcements.map(item => `
      <div class="panel"><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.content)}</p>${canAdd ? `<button class="btn danger small-btn" style="margin-top:15px" onclick="deleteData('announcements', '${item.id}')">Hapus</button>` : ""}</div>
    `).join("")}
  `;
}

/* KRS */
function renderKRS() {
  if (currentUser.role !== "mahasiswa") return `<div class="panel">Halaman ini khusus mahasiswa.</div>`;
  const myKRS = db.krs ? db.krs.filter(item => item.nim === currentUser.nim) : [];
  const totalSKS = myKRS.reduce((total, item) => total + item.sks, 0);

  return `
    <div class="page-head">
      <div><h3>Kartu Rencana Studi</h3><p>Pilih mata kuliah yang ingin diambil.</p></div>
      <button class="btn primary" onclick="openForm('krs')">+ Tambah KRS</button>
    </div>
    <div class="stats-grid" style="margin-bottom: 24px;">
      <div class="stat-card"><span>Total SKS Diambil</span><strong>${totalSKS} SKS</strong></div>
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Mata Kuliah</th><th>SKS</th><th>Aksi</th></tr></thead>
        <tbody>
          ${myKRS.length ? myKRS.map(item => `
            <tr><td>${escapeHTML(item.course)}</td><td>${item.sks}</td>
            <td><button class="btn danger small-btn" onclick="deleteData('krs', '${item.id}')">Batal Ambil</button></td></tr>
          `).join("") : `<tr><td colspan="3" style="text-align:center; padding: 20px;">Belum ada mata kuliah yang diambil.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

/* BACKUP, RESTORE & RESET */
/* BACKUP, RESTORE & RESET BARU */
function renderBackup() {
  if (currentUser.role !== "admin") return `<div class="panel">Akses hanya admin.</div>`;
  return `
    <div class="page-head"><div><h3>Backup, Restore & Reset</h3><p>Kelola keamanan dan keutuhan data sistem.</p></div></div>
    <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
      <div class="panel">
        <h3 style="margin-bottom: 10px;">Backup Data</h3>
        <p style="margin-bottom: 15px; color: var(--muted); font-size: 14px;">Download seluruh data dalam format JSON untuk cadangan.</p>
        <button class="btn primary" onclick="downloadBackup()">Download Backup</button>
      </div>
      
      <!-- UI Restore yang Dipercantik -->
      <div class="panel">
        <h3 style="margin-bottom: 10px;">Restore Data</h3>
        <p style="margin-bottom: 15px; color: var(--muted); font-size: 14px;">Pulihkan data dari file JSON. Data saat ini akan tertimpa.</p>
        <div class="custom-file-input">
          <input type="file" id="restoreFile" accept=".json" onchange="updateFileName(this)">
          <label for="restoreFile" class="btn secondary">Pilih File JSON</label>
          <span id="fileName" class="file-name">Belum ada file</span>
          <button class="btn primary" onclick="restoreBackup()">Restore</button>
        </div>
      </div>
    </div>
    
    <!-- UI Reset Tanpa Teks Danger Zone -->
    <div class="panel" style="margin-top: 24px; border: 1px solid #fecaca; background: #fff5f5;">
      <div style="display: flex; gap: 15px; align-items: center; justify-content: space-between;">
        <div>
          <h3 style="color: var(--danger); margin-bottom: 8px;">Reset Sistem</h3>
          <p style="color: var(--muted); font-size: 14px; margin: 0;">Tindakan ini akan menghapus semua riwayat dan data tambahan, lalu mengembalikan sistem ke data awal default. <b>Anda tidak akan logout.</b></p>
        </div>
        <button class="btn danger" onclick="resetAllData()">Reset Database</button>
      </div>
    </div>
  `;
}

// Fungsi bantu untuk menampilkan nama file yang dipilih
function updateFileName(input) {
  const fileName = input.files[0] ? input.files[0].name : "Belum ada file";
  const fileNameEl = document.getElementById("fileName");
  if(fileNameEl) fileNameEl.textContent = fileName;
}

function resetAllData() {
  if (currentUser.role !== "admin") return;
  
  // Tampilkan Custom Modal Reset alih-alih confirm() bawaan browser
  const resetModal = document.getElementById("resetModal");
  if (resetModal) {
    resetModal.classList.remove("hidden");
    
    const btnCancel = document.getElementById("cancelResetBtn");
    const btnConfirm = document.getElementById("confirmResetBtn");
    
    // Tombol Batal
    btnCancel.onclick = () => {
      resetModal.classList.add("hidden");
    };
    
    // Tombol Konfirmasi Reset
    btnConfirm.onclick = () => {
      db = createInitialDB(); 
      saveDB(); 

      const adminUser = db.users.find(u => u.username === currentUser.username);
      if (adminUser) {
          currentUser = adminUser;
          saveSession();
      }

      addLog("Melakukan Reset Database");
      showToast("Sistem berhasil direset ke data awal.");
      
      resetModal.classList.add("hidden");
      renderPage(activePage);
    };
  }
}

function renderLogs() {
  if (!db.logs) db.logs = [];
  return `
    <div class="page-head"><div><h3>Log Aktivitas</h3></div></div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Tanggal</th><th>User</th><th>Role</th><th>Aktivitas</th></tr></thead>
        <tbody>
          ${db.logs.map(item => `<tr><td>${escapeHTML(item.date)}</td><td>${escapeHTML(item.user)}</td><td><span class="badge" style="background:#f1f5f9; color:#475569;">${escapeHTML(item.role)}</span></td><td>${escapeHTML(item.action)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

/* FORM */
function openForm(type) {
  const allowed = {
    departments: ["admin"], programs: ["admin"], lecturers: ["admin"], students: ["admin"],
    courses: ["admin"], classes: ["admin"], users: ["admin"], schedules: ["admin"],
    grades: ["admin", "dosen"], materials: ["dosen"], announcements: ["admin"], krs: ["mahasiswa"]
  };
  if (!allowed[type]?.includes(currentUser.role)) return showToast("Anda tidak memiliki akses.");
  
  currentFormType = type;
  const formMap = {
    departments: { title: "Tambah Jurusan", fields: [["name", "Nama Jurusan", "text"]] },
    programs: { title: "Tambah Program Studi", fields: [["name", "Nama Program Studi", "text"]] },
    lecturers: { title: "Tambah Dosen", fields: [["name", "Nama Dosen", "text"], ["nidn", "NIDN", "text"]] },
    
    // Mahasiswa: Program studi jadi Dropdown
    students: { title: "Tambah Mahasiswa", fields: [["name", "Nama Lengkap", "text"], ["nim", "NIM", "text"], ["program", "Program Studi", "select", db.programs.length ? db.programs.map(p => p.name) : ["Belum ada data Program Studi"]]] },
    
    courses: { title: "Tambah Mata Kuliah", fields: [["name", "Nama Mata Kuliah", "text"], ["code", "Kode Mata Kuliah", "text"], ["sks", "Jumlah SKS", "number"]] },
    
    // Kelas: Mata kuliah jadi Dropdown
    classes: { title: "Tambah Kelas", fields: [["name", "Nama Kelas (Contoh: IF-4A)", "text"], ["course", "Mata Kuliah", "select", db.courses.length ? db.courses.map(c => c.name) : ["Belum ada data Mata Kuliah"]]] },
    
    users: { title: "Tambah User", fields: [["name", "Nama Lengkap", "text"], ["username", "Username", "text"], ["password", "Password", "password"], ["role", "Role", "select", ["admin", "dosen", "mahasiswa"]], ["nim", "NIM / NIDN (Kosongkan jika Admin)", "text"]] },
    
    // Jadwal: Mata kuliah & Hari jadi Dropdown
    schedules: { title: "Tambah Jadwal", fields: [["course", "Mata Kuliah", "select", db.courses.length ? db.courses.map(c => c.name) : ["Belum ada data Mata Kuliah"]], ["day", "Hari", "select", ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]], ["time", "Waktu (Contoh: 08:00 - 10:30)", "text"], ["room", "Ruangan", "text"]] },
    
    // Form Dosen yang sudah kita perbaiki tadi
    grades: { title: "Input Nilai", fields: [["student_data", "Pilih Mahasiswa", "select", db.students.length ? db.students.map(s => `${s.name} - ${s.nim}`) : ["Belum ada data mahasiswa"]], ["course", "Mata Kuliah", "select", db.courses.length ? db.courses.map(c => c.name) : ["Belum ada data mata kuliah"]], ["score", "Nilai", "number"]] },
    
    materials: { title: "Tambah Materi", fields: [["title", "Judul Materi", "text"], ["course", "Mata Kuliah", "select", db.courses.length ? db.courses.map(c => c.name) : ["Belum ada data mata kuliah"]]] },
    
    announcements: { title: "Tambah Pengumuman", fields: [["title", "Judul Pengumuman", "text"], ["content", "Isi Pengumuman", "text"]] },
    
    krs: { title: "Tambah KRS", fields: [["course", "Mata Kuliah", "select", db.courses.length ? db.courses.map(c => c.name) : ["Belum ada data mata kuliah"]]] }
  };

  const selected = formMap[type];
  document.getElementById("modalTitle").textContent = selected.title;
  document.getElementById("formFields").innerHTML = selected.fields.map(field => {
    const [name, label, inputType, options] = field;
    if (inputType === "select") {
      return `<label>${label}</label><select name="${name}" required>${options.map(o => `<option value="${o}">${o}</option>`).join("")}</select>`;
    }
    const isRequired = name === "nim" ? "" : "required";
    return `<label>${label}</label><input type="${inputType}" name="${name}" ${isRequired} placeholder="${label}">`;
  }).join("");

  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("dataForm").reset();
}

function submitForm(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  data.id = createId(currentFormType);

  // Mencegah form disubmit jika data master (dropdown) belum tersedia
  for (let key in data) {
    if (data[key] && data[key].toString().includes("Belum ada data")) {
      return showToast(`Gagal menyimpan: Anda harus menambahkan data master (${key}) terlebih dahulu!`);
    }
  }

 if (currentFormType === "grades") {
    // Cegah input jika data mahasiswa atau mata kuliah masih kosong di database admin
    if (data.student_data === "Belum ada data mahasiswa" || data.course === "Belum ada data mata kuliah") {
      return showToast("Gagal: Data master Mahasiswa atau Mata Kuliah belum tersedia!");
    }

    // Pisahkan string "Nama - NIM" yang dipilih dari dropdown
    const studentInfo = data.student_data.split(" - ");
    data.student = studentInfo[0]; // Ambil Nama
    data.nim = studentInfo[1];     // Ambil NIM
    delete data.student_data;      // Hapus properti sementara

    data.score = Number(data.score); 
    data.lecturer = currentUser.name;
  }
  if (currentFormType === "courses") {
    data.sks = Number(data.sks);
  }
  if (currentFormType === "users") {
    data.username = data.username.trim(); 
  }
  if (currentFormType === "krs") {
    data.student = currentUser.name;
    data.nim = currentUser.nim || "";
    const selectedCourse = db.courses.find(c => c.name === data.course);
    data.sks = selectedCourse ? selectedCourse.sks : 0;

    const isAlreadyTaken = db.krs.some(k => k.nim === data.nim && k.course === data.course);
    if (isAlreadyTaken) return showToast("Gagal: Mata kuliah ini sudah diambil!");
  }

  if (!db[currentFormType]) db[currentFormType] = [];
  db[currentFormType].push(data);
  saveDB(); 
  addLog(`Menambahkan data ${currentFormType}`);
  closeModal(); 
  renderPage(activePage); 
  showToast("Data berhasil disimpan.");
}

function deleteData(collection, id) {
  if (currentUser.role !== "admin" && collection !== "grades" && collection !== "krs") return showToast("Akses ditolak.");
  if (!confirm("Hapus data ini?")) return;
  db[collection] = db[collection].filter(item => item.id !== id);
  saveDB(); 
  addLog(`Menghapus data ${collection}`); 
  renderPage(activePage); 
  showToast("Data berhasil dihapus.");
}

/* EVENT LISTENERS */
document.getElementById("loginForm").addEventListener("submit", event => {
  event.preventDefault();
  login(document.getElementById("username").value.trim(), document.getElementById("password").value);
});

document.getElementById("logoutButton").addEventListener("click", logout);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("dataForm").addEventListener("submit", submitForm);
document.getElementById("modal").addEventListener("click", event => { if (event.target.id === "modal") closeModal(); });

/* START APP & INITIALIZE CLOUD SYNC */
initCloudRealtimeSync(() => {
    if (loadSession()) startApp();
});

// ==========================================
// SAMBUNGAN FUNGSI DELETE (YANG TERPOTONG)
// ==========================================
function deleteData(collection, id) {
  // Cek hak akses untuk menghapus data
  const allowedRoles = {
    departments: ["admin"], programs: ["admin"], lecturers: ["admin"],
    students: ["admin"], courses: ["admin"], classes: ["admin"],
    users: ["admin"], schedules: ["admin"], announcements: ["admin"],
    grades: ["admin", "dosen"], materials: ["dosen"], krs: ["mahasiswa"]
  };

  if (!allowedRoles[collection] || !allowedRoles[collection].includes(currentUser.role)) {
    return showToast("Akses ditolak: Anda tidak memiliki izin menghapus data ini.");
  }

  if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    db[collection] = db[collection].filter(item => item.id !== id);
    saveDB();
    addLog(`Menghapus data dari ${collection}`);
    renderPage(activePage);
    showToast("Data berhasil dihapus.");
  }
}

// ==========================================
// INISIALISASI & EVENT LISTENERS (SANGAT PENTING)
// ==========================================
// ==========================================
// INISIALISASI & EVENT LISTENERS
// ==========================================
// ==========================================
// FUNGSI DELETE DENGAN CUSTOM MODAL YANG ELEGAN
// ==========================================
let deleteDataTarget = null; // Menyimpan target data yang akan dihapus

function deleteData(collection, id) {
  const allowedRoles = {
    departments: ["admin"], programs: ["admin"], lecturers: ["admin"],
    students: ["admin"], courses: ["admin"], classes: ["admin"],
    users: ["admin"], schedules: ["admin"], announcements: ["admin"],
    grades: ["admin", "dosen"], materials: ["dosen"], krs: ["mahasiswa"]
  };

  if (!allowedRoles[collection] || !allowedRoles[collection].includes(currentUser.role)) {
    return showToast("Akses ditolak: Anda tidak memiliki izin menghapus data ini.");
  }

  // Simpan data target hapus, lalu tampilkan modal buatan sendiri (Bukan confirm() bawaan browser)
  deleteDataTarget = { collection, id };
  const confirmModal = document.getElementById("confirmModal");
  if (confirmModal) {
    confirmModal.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Hubungkan Form Login
const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Mencegah halaman refresh
      const user = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value;
      login(user, pass);
    });
  }

  // 2. Hubungkan Tombol Sign Out
  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // 3. Hubungkan Modal Form
  const closeModalBtn = document.getElementById("closeModal");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  const dataForm = document.getElementById("dataForm");
  if (dataForm) {
    dataForm.addEventListener("submit", submitForm);
  }

  // 4. Hubungkan Tombol Toggle Sidebar
  const sidebarToggleBtn = document.getElementById("sidebarToggle");
  const sidebarEl = document.querySelector(".sidebar");
  if (sidebarToggleBtn && sidebarEl) {
    sidebarToggleBtn.addEventListener("click", () => {
      sidebarEl.classList.toggle("collapsed");
    });
  }

  // 5. Hubungkan Custom Modal Konfirmasi Hapus
  const confirmModal = document.getElementById("confirmModal");
  const btnCancel = document.getElementById("cancelDeleteBtn");
  const btnConfirm = document.getElementById("confirmDeleteBtn");

  if (btnCancel && btnConfirm && confirmModal) {
    // Tombol Batal
    btnCancel.addEventListener("click", () => {
      confirmModal.classList.add("hidden");
      deleteDataTarget = null;
    });

    // Tombol Ya, Hapus
    btnConfirm.addEventListener("click", () => {
      if (deleteDataTarget) {
        const { collection, id } = deleteDataTarget;
        db[collection] = db[collection].filter(item => item.id !== id);
        saveDB();
        addLog(`Menghapus data dari ${collection}`);
        renderPage(activePage);
        showToast("Data berhasil dihapus.");
        
        confirmModal.classList.add("hidden");
        deleteDataTarget = null;
      }
    });
  }

  // 6. Jalankan Aplikasi & Cek Sesi Login
  initCloudRealtimeSync(() => {
    if (loadSession()) {
      startApp();
    } else {
      const loginPage = document.getElementById("loginPage");
      const appPage = document.getElementById("appPage");
      if(loginPage) loginPage.classList.remove("hidden");
      if(appPage) appPage.classList.add("hidden");
    }
  });
});

// Mengambil role dari localStorage (atau default ke 'viewer' jika belum login)
const userRole = localStorage.getItem('userRole') || 'viewer';

function applyRoleBasedAccess(role) {
  const menuItems = document.querySelectorAll('.sidebar [data-roles]');

  menuItems.forEach((item) => {
    // Ambil daftar role yang diizinkan
    const allowedRoles = item.dataset.roles.split(',').map((r) => r.trim());

    // Tampilkan jika role pengguna ada di dalam daftar, sembunyikan jika tidak
    if (allowedRoles.includes(role)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

// Jalankan saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  applyRoleBasedAccess(userRole);
});

