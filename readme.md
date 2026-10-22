# 🌐 Network Control Center (NCC) - SMKN 1 Purbalingga

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-emerald.svg)
![Stack](https://img.shields.io/badge/stack-HTML5%20%7C%20TailwindCSS%20%7C%20Chart.js-cyan.svg)

Dashboard pemantauan jaringan *real-time* berperforma tinggi dengan desain **High-Density (Zero-Scroll)** khusus untuk memantau infrastruktur jaringan di **SMK Negeri 1 Purbalingga**.

---

## 📸 Tampilan Dashboard

Dashboard ini dirancang agar muat dalam satu layar penuh (desktop/TV monitoring) tanpa perlu *scrolling*, menampilkan seluruh informasi kritis jaringan secara sekilas.

---

## ✨ Fitur Utama

- ⚡ **MikroTik Core & WAN Metrics**: Pemantauan beban CPU, *active clients* (DHCP Leases), serta *live traffic* (Upload/Download) pada gateway WAN.
- 🔀 **VLAN Segments Breakdown**: Matriks *traffic* jaringan terbagi berdasarkan segmen VLAN yang sedang aktif.
- 🔌 **Switch Status**: Indikator status koneksi perangkat *Core Switch* dan *EdgeSwitch*.
- 📶 **UniFi AP Distribution**: Visualisasi distribusi jumlah *client* terhubung pada setiap *Access Point* menggunakan diagram *doughnut*.
- 🌓 **Dark / Light Mode**: Peralihan mode tampilan gelap/terang otomatis dengan penyimpanan preferensi lokal (*LocalStorage*).
- 🔄 **Auto-Refresh Data**: Pembaruan data otomatis secara berkala terhubung langsung dengan Google Apps Script API.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: HTML5, JavaScript (ES6+)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- **Diagram/Grafik**: [Chart.js](https://www.chartjs.org/)
- **Ikon**: [FontAwesome 6](https://fontawesome.com/)
- **Backend API**: Google Apps Script (GAS) + Google Sheets (sebagai data store/collector)

---

## 🚀 Cara Penggunaan & Pemasangan

### 1. Kloning Repositori (Local Development)

```bash
# Clone repositori ini
git clone https://github.com/USERNAME/REPOSITORY-NAME.git

# Masuk ke direktori
cd REPOSITORY-NAME
```

### 2. Jalankan Secara Lokal
Cukup buka file `index.html` menggunakan browser pilihan Anda (Google Chrome, Mozilla Firefox, Microsoft Edge, dll).

---

## 📁 Struktur File Repositori

```text
├── index.html        # Kode utama dashboard (HTML, Tailwind, JS, Chart.js)
└── README.md         # Dokumentasi proyek
```

---

## ⚙️ Konfigurasi API

Untuk mengintegrasikan dengan backend MikroTik / Google Sheets Anda sendiri, ubah konstanta `API_URL` pada bagian script file `index.html`:

```javascript
const API_URL = "URL_GOOGLE_APPS_SCRIPT_ANDA_DISINI";
```

---

## 📄 Lisensi

Proyek ini dibuat untuk kebutuhan internal **SMK Negeri 1 Purbalingga**. Bebas digunakan dan dikembangkan kembali di bawah lisensi MIT.
