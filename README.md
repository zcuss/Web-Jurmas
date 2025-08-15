# WEB-JURMAS-V1

**WEB-JURMAS-V1** adalah aplikasi manajemen stok berbasis web yang dirancang untuk membantu pengelola dapur dan juru masak dalam mengelola stok bahan, melakukan restock, serta mencatat log aktivitas withdrawal dengan akurat dan efisien. Aplikasi ini dirancang untuk memudahkan pemantauan dan pengendalian bahan baku dapur secara real-time, yang sangat dibutuhkan dalam operasi dapur yang sibuk.

## Fitur Utama

* **Manajemen Stok**:

  * Penambahan, pengurangan, dan pembaruan stok bahan secara mudah dan cepat.
  * Pencatatan stok real-time untuk memberikan informasi terkini kepada pengelola dapur.

* **Log Aktivitas**:

  * Mencatat setiap aktivitas restock dan withdrawal secara otomatis untuk memastikan data yang akurat dan transparan.

* **Dashboard Interaktif**:

  * Tampilan visual untuk memantau status stok dan log aktivitas, mempermudah pengelolaan bahan.

* **Keamanan**:

  * Sistem autentikasi dan otorisasi berbasis peran pengguna (role-based access control) untuk menjamin akses hanya diberikan kepada pengguna yang sah.

* **Templating Modern**:

  * Menggunakan **EJS (Embedded JavaScript Templates)** untuk antarmuka yang responsif dan user-friendly.

## Teknologi yang Digunakan

* **Bahasa Pemrograman**: JavaScript (Node.js)
* **Backend**: Node.js dengan framework Express.js
* **Frontend**: EJS (Embedded JavaScript Templates), HTML, CSS
* **Database**: MySQL dengan ORM Sequelize
* **Keamanan**: Middleware autentikasi dan kontrol akses berbasis peran pengguna
* **CSS Framework**: Bootstrap 5 untuk desain antarmuka responsif

## Instalasi dan Penggunaan

### Persyaratan Sistem

* Node.js v16 atau lebih tinggi
* MySQL v8 atau lebih tinggi
* NPM (Node Package Manager)

### Langkah Instalasi

1. **Clone Repository**

   * Pertama, clone repository proyek ini ke sistem lokal Anda.

   ```bash
   git clone https://github.com/zcuss/WEB-JURMAS-V1.git
   ```

2. **Masuk ke Direktori Proyek**

   * Setelah clone selesai, pindah ke direktori proyek.

   ```bash
   cd WEB-JURMAS-V1
   ```

3. **Instalasi Dependensi**

   * Instal semua dependensi yang diperlukan untuk menjalankan proyek ini.

   ```bash
   npm install
   ```

4. **Konfigurasi File `.env`**

   * Salin file `.env.example` menjadi `.env` dan sesuaikan dengan detail konfigurasi lingkungan Anda, termasuk database.

   ```env
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASS=your_database_password
   DB_HOST=localhost
   DB_DIALECT=mysql
   DEBUG_MODE=false
   ```

5. **Jalankan Migrasi Database**

   * Pastikan struktur database sesuai dengan model yang telah dibuat.

   ```bash
   npx sequelize-cli db:migrate
   ```

6. **Jalankan Aplikasi**

   * Sekarang Anda dapat menjalankan aplikasi.

   ```bash
   npm start
   ```

### Skrip NPM yang Tersedia

* `npm start`: Menjalankan server di mode produksi.
* `npm run dev`: Menjalankan server dengan hot-reload menggunakan Nodemon untuk pengembangan.
* `npm run lint`: Mengecek kualitas kode menggunakan ESLint untuk memastikan kode bersih dan sesuai standar.

## Struktur Direktori

Berikut adalah struktur direktori utama proyek ini beserta penjelasan singkat setiap direktori:

```
WEB-JURMAS-V1/
├── controllers/          # Menyimpan logika bisnis dan handling request HTTP
├── models/               # Definisi skema database dan hubungan antar tabel
├── middlewares/          # Middleware untuk autentikasi dan kontrol akses
├── public/               # File statis seperti CSS, JS, gambar
├── views/                # Template EJS untuk tampilan frontend
├── utils/                # Fungsi utilitas dan helper
├── config/               # Konfigurasi aplikasi (misalnya koneksi database, setelan environment)
├── .env.example          # Contoh file konfigurasi lingkungan
└── README.md             # Dokumentasi proyek
```

## API Endpoint

Aplikasi ini menyediakan API untuk mengelola stok bahan dan log aktivitas. Berikut adalah endpoint-endpoint yang tersedia:

### **Stok**

* **GET** `/stock`: Mengambil daftar stok bahan yang tersedia.
* **POST** `/stock/add`: Menambahkan stok bahan baru ke dalam database.
* **PUT** `/stock/update`: Memperbarui informasi stok bahan yang sudah ada.

### **Log Aktivitas**

* **GET** `/logs/restock`: Mengambil log aktivitas restock bahan.
* **GET** `/logs/withdrawal`: Mengambil log aktivitas withdrawal bahan.

### **Autentikasi**

* **POST** `/login`: Login pengguna ke dalam sistem menggunakan kredensial yang valid.
* **POST** `/logout`: Logout pengguna dari aplikasi.

## Kontributor

* **Pemilik Proyek**: [zcuss](https://github.com/zcuss)
* **Kontribusi**: Jika Anda tertarik untuk berkontribusi, silakan buat issue atau kirimkan pull request. Pastikan untuk mengikuti pedoman kontribusi yang berlaku.

## Lisensi

Proyek ini **tidak memiliki lisensi resmi**. Jika Anda tertarik untuk menggunakan atau memodifikasi kode ini, harap hubungi pemilik proyek terlebih dahulu untuk memperoleh izin.

## Catatan Tambahan

* **Pengembangan Aktif**: Proyek ini masih dalam tahap pengembangan. Jika Anda menemukan bug atau memiliki saran, silakan buat laporan melalui [Issues](https://github.com/zcuss/WEB-JURMAS-V1/issues).
* **Dukungan**: Untuk pertanyaan lebih lanjut atau umpan balik, Anda dapat menghubungi kami melalui [GitHub Discussions](https://github.com/zcuss/WEB-JURMAS-V1/discussions) atau mengirimkan email.
* **Transparansi Stok**: Semua aktivitas terkait stok dicatat secara otomatis untuk menjaga transparansi dan akurasi data.

---

### Rangkuman Perubahan yang Dilakukan:

1. **Penyusunan Ulang Deskripsi**: Agar lebih jelas dan mudah dipahami.
2. **Penjelasan Lebih Lengkap tentang Fitur**: Penambahan detail mengenai cara kerja fitur utama.
3. **Penjelasan Lengkap API**: Menambahkan deskripsi lebih jelas pada setiap endpoint.
4. **Penambahan Pedoman Kontribusi**: Mengarahkan kontributor untuk mengikuti pedoman saat berkontribusi.
5. **Penyempurnaan Struktur Direktori**: Memberikan penjelasan tambahan mengenai tiap folder dalam proyek.
6. **Tata Bahasa dan Penyusunan**: Penggunaan kalimat yang lebih profesional dan alur yang lebih sistematis.
