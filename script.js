// --- file: script.js ---
document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. DEKLARASI ELEMEN DOM
    // ==========================================
    const loginForm = document.getElementById("login-form");
    const loginPage = document.getElementById("login-page");
    const dashboardPage = document.getElementById("dashboard-page");
    const logoutBtn = document.getElementById("logout-btn");
    
    const navLinks = document.querySelectorAll(".nav-link");
    const tabContents = document.querySelectorAll(".tab-content");
    
    const btnProsesGA = document.getElementById("btn-proses-ga");
    const loadingContainer = document.getElementById("loading-container");
    const scheduleTbody = document.getElementById("schedule-tbody");
    const navHasilBtn = document.getElementById("nav-hasil");

    // ==========================================
    // 2. LOGIKA LOGIN & LOGOUT SPA
    // ==========================================
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        // Sembunyikan halaman login, tampilkan dashboard
        loginPage.style.display = "none";
        dashboardPage.style.display = "flex";
        
        // Setup text sapaan sesuai role
        const role = document.getElementById("role").value;
        const username = document.getElementById("username").value;
        document.getElementById("welcome-text").innerText = `Selamat datang, ${username} (${role})`;
    });

    logoutBtn.addEventListener("click", () => {
        // Reset form dan kembalikan ke halaman login
        loginForm.reset();
        dashboardPage.style.display = "none";
        loginPage.style.display = "flex";
    });

    // ==========================================
    // 3. LOGIKA NAVIGASI SIDEBAR
    // ==========================================
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Hapus class 'active' dari semua menu navigasi
            navLinks.forEach(nav => nav.classList.remove("active"));
            
            // Sembunyikan semua konten tab
            tabContents.forEach(tab => tab.classList.remove("active"));
            
            // Tambahkan class 'active' pada menu yang diklik
            link.classList.add("active");
            
            // Tampilkan tab konten yang sesuai dengan atribut data-target
            const targetId = link.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");
        });
    });

    // ==========================================
    // 4. SIMULASI ALGORITMA GENETIKA (GA)
    // ==========================================
    btnProsesGA.addEventListener("click", () => {
        // Tampilkan loading, sembunyikan sementara tombol proses
        loadingContainer.style.display = "flex";
        btnProsesGA.disabled = true;
        btnProsesGA.style.opacity = "0.7";

        // Simulasi proses algoritma selama 3 detik menggunakan setTimeout
        setTimeout(() => {
            // Hilangkan loading
            loadingContainer.style.display = "none";
            btnProsesGA.disabled = false;
            btnProsesGA.style.opacity = "1";
            
            // Render data jadwal ke tabel
            renderJadwal();

            // Pindah halaman secara otomatis ke "Hasil Jadwal"
            navHasilBtn.click();
            
        }, 3000); // 3000 ms = 3 detik
    });

    // ==========================================
    // 5. DATA DUMMY & RENDER TABEL JADWAL
    // ==========================================
    // Dummy Data Hasil Penjadwalan
    const dataJadwal = [
        { hari: "Senin", jam: "08:00 - 09:40", ruang: "Lab Komputer 1", matkul: "Struktur Data", dosen: "Dr. Budi S." },
        { hari: "Senin", jam: "10:00 - 12:30", ruang: "Ruang A3", matkul: "Aljabar Linear", dosen: "Siti Aminah, M.Sc." },
        { hari: "Selasa", jam: "08:00 - 10:30", ruang: "Lab Komputer 2", matkul: "Pemrograman Web", dosen: "Arif Pratama, M.Kom." },
        { hari: "Selasa", jam: "13:00 - 15:30", ruang: "Ruang B1", matkul: "Kecerdasan Buatan", dosen: "Prof. Dr. Hendra" },
        { hari: "Rabu", jam: "09:00 - 11:30", ruang: "Lab Jaringan", matkul: "Jaringan Komputer", dosen: "Rina Sari, M.T." },
        { hari: "Kamis", jam: "13:00 - 15:30", ruang: "Ruang C2", matkul: "Sistem Basis Data", dosen: "Dr. Budi S." }
    ];

    function renderJadwal() {
        // Kosongkan isi tabel terlebih dahulu
        scheduleTbody.innerHTML = "";

        // Lakukan looping pada array of objects dan buat element <tr>
        dataJadwal.forEach(jadwal => {
            const tr = document.createElement("tr");
            
            tr.innerHTML = `
                <td><strong>${jadwal.hari}</strong></td>
                <td>${jadwal.jam}</td>
                <td>${jadwal.ruang}</td>
                <td>${jadwal.matkul}</td>
                <td>${jadwal.dosen}</td>
            `;
            
            scheduleTbody.appendChild(tr);
        });
    }
});