# Kanban Board Kolaboratif Real-time

Selamat datang di Kanban Board Kolaboratif bernama todoQ (tuduku) Ini adalah aplikasi web to-do list interaktif yang memungkinkan tim berkolaborasi dalam mengelola tugas secara real-time. Aplikasi ini dibangun dengan tumpukan teknologi modern dan berfokus pada pengalaman pengguna yang lancar tanpa perlu registrasi.

 

## ✨ Fitur Utama

-   **Kolaborasi Real-time**: Perubahan yang dibuat oleh satu pengguna (membuat, memindahkan, mengambil, atau menghapus tugas) langsung terlihat oleh semua pengguna lain tanpa perlu me-refresh halaman.
-   **Tanpa Login**: Pengguna bisa langsung masuk dan berkolaborasi. Pengguna dapat memilih namanya sendiri atau akan diberi nama acak yang unik.
-   **Kanban Board Interaktif**: Atur tugas dalam tiga kolom: "To Do", "In Progress", dan "Done" menggunakan antarmuka *drag-and-drop* yang intuitif.
-   **Manajemen Tugas Fleksibel**:
    -   Buat tugas baru dengan judul dan detail melalui pop-up.
    -   Ambil tugas yang belum ditugaskan.
    -   Lepas tugas yang sudah diambil agar bisa dikerjakan oleh orang lain.
-   **Chat Tim Terintegrasi**: Sebuah widget chat mengambang memungkinkan diskusi tim secara langsung di dalam aplikasi.
-   **Notifikasi Chat**: Dapatkan notifikasi visual dengan jumlah pesan yang belum dibaca saat jendela chat ditutup.
-   **Daftar Pengguna Online**: Lihat siapa saja yang sedang aktif melalui widget avatar yang interaktif di header.
-   **Akses Publik via Tunnel**: Mudah untuk didemokan atau digunakan secara remote dengan dukungan untuk tunneling.

## 🚀 Tumpukan Teknologi

-   **Backend**: Node.js dengan Express.js
-   **Komunikasi Real-time**: WebSocket (menggunakan library `ws`)
-   **Manajemen Sesi**: `express-session` untuk mengidentifikasi pengguna unik per browser.
-   **Frontend**: HTML5, CSS3, dan JavaScript murni (Vanilla JS) tanpa framework eksternal.

## 📦 Instalasi & Penggunaan

Untuk menjalankan proyek ini di mesin lokal Anda, ikuti langkah-langkah berikut.

### Prasyarat

-   [Node.js](https://nodejs.org/) (disarankan versi LTS)
-   [npm](https://www.npmjs.com/) (biasanya terinstal bersama Node.js)

### Langkah-langkah

1.  **Clone Repositori**
    Jika proyek ini ada di Git, clone repositori ini. Jika tidak, cukup salin folder proyek.
    ```bash
    # Contoh jika menggunakan git
    git clone https://github.com/your-username/collaborative-todo.git
    cd collaborative-todo
    ```

2.  **Instal Dependensi**
    Buka terminal di direktori root proyek dan jalankan perintah berikut untuk menginstal semua paket yang diperlukan:
    ```bash
    npm install
    ```
    Ini akan menginstal `express`, `express-session`, dan `ws`.

3.  **Jalankan Server**
    Setelah instalasi selesai, jalankan server aplikasi:
    ```bash
    node server.js
    ```
    Anda akan melihat pesan konfirmasi di terminal:
    ```
    Server berjalan di http://localhost:3000
    ```

4.  **Buka Aplikasi**
    Buka browser web favorit Anda dan navigasikan ke `http://localhost:3000`. Untuk melihat fitur kolaborasi, buka alamat yang sama di beberapa tab atau jendela browser yang berbeda.

## 🌐 Membuat Aplikasi Dapat Diakses Publik (Tunneling)

Jika Anda ingin orang lain di luar jaringan lokal Anda mengakses aplikasi ini, Anda bisa menggunakan layanan tunneling seperti `localtunnel` atau `cloudflared`.

### Menggunakan `localtunnel` (Rekomendasi)

1.  **Instal `localtunnel` secara global:**
    ```bash
    npm install -g localtunnel
    ```

2.  **Pastikan server aplikasi Anda sedang berjalan** (`node server.js`).

3.  **Buka terminal baru** dan jalankan:
    ```bash
    lt --port 3000
    ```

4.  Anda akan mendapatkan URL publik seperti `https://random-name.loca.lt`. Bagikan URL ini kepada teman-teman Anda!

    *(Catatan: Pengguna mungkin perlu mengklik halaman "Click to Continue" saat pertama kali mengakses URL `localtunnel`)*.

## 🏗️ Struktur Proyek
```
todoQ
├── public/ # File yang dapat diakses oleh klien
│ ├── index.html # Struktur utama halaman web
│ ├── style.css # Semua gaya untuk aplikasi
│ └── client.js # Semua logika frontend dan WebSocket
├── node_modules/ # Dependensi yang diinstal oleh npm
├── package.json # Info proyek dan daftar dependensi
├── package-lock.json # Versi spesifik dari dependensi
└── server.js # Server backend (Express & WebSocket)
```

## 🤝 Kontribusi

Merasa ada yang bisa ditingkatkan? Jangan ragu untuk membuat *fork* repositori ini, membuat perubahan, dan membuka *Pull Request*. Semua kontribusi sangat dihargai!

---