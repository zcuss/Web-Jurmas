const { Uang_Kas } = require("../../models");

// Fungsi untuk menampilkan data Uang Kas
exports.showUangKas = async (req, res) => {
  try {
    const uangKasData = await Uang_Kas.findAll({
      order: [["id", "ASC"]],
    });

    // Hitung total keseluruhan kas
    const totalKas = uangKasData.reduce((total, tx) => {
      return total + (tx.uang_masuk - tx.uang_keluar);
    }, 0);

    // Ambil ID jika ada, misal dari URL (param)
    const { id } = req.params; // <-- Ambil id dari parameter URL

    let transactionToEdit = null;
    if (id) {
      // Jika ada id, cari data berdasarkan id tersebut untuk di-edit
      transactionToEdit = await Uang_Kas.findByPk(id);
    }

    res.render("2-Uang/2-uang-kas", {
      id,
      uangKasData,
      totalKas,
      transactionToEdit, // Data transaksi untuk edit
      currentRoute: "uang-kas",
      userRole: req.user ? req.user.role : null,
    });
  } catch (error) {
    console.error("Gagal mengambil data uang kas:", error.message);
    res.status(500).send("Terjadi kesalahan saat mengambil data uang kas.");
  }
};

exports.ApiUangKas = async (req, res) => {
  try {
    const uangKasData = await Uang_Kas.findAll({
      order: [["id", "ASC"]],
    });

    const totalKas = uangKasData.reduce((total, tx) => {
      return total + (tx.uang_masuk - tx.uang_keluar);
    }, 0);

    const { id } = req.params;

    let transactionToEdit = null;
    if (id) {
      transactionToEdit = await Uang_Kas.findByPk(id);
    }

    res.json({
      id: id || null,
      uangKasData,
      totalKas,
      transactionToEdit,
      userRole: req.user ? req.user.role : null,
    });
  } catch (error) {
    console.error("Gagal mengambil data uang kas:", error.message);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data uang kas." });
  }
};

// Fungsi untuk menghapus data Uang Kas
exports.deleteUangKas = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari dan hapus data Uang Kas berdasarkan ID
    const uangKas = await Uang_Kas.findByPk(id);

    if (!uangKas) {
      return res.status(404).send("Data Uang Kas tidak ditemukan.");
    }

    await uangKas.destroy();

    // Setelah menghapus, ambil data terbaru dan hitung totalnya
    const uangKasData = await Uang_Kas.findAll({
      order: [["id", "ASC"]],
    });

    // Hitung total keseluruhan kas
    const totalKas = uangKasData.reduce((total, tx) => {
      return total + (tx.uang_masuk - tx.uang_keluar);
    }, 0);

    // Render ulang halaman setelah penghapusan
    res.render("2-Uang/2-uang-kas", {
      uangKasData,
      totalKas,
      currentRoute: "uang-kas",
      userRole: req.session.userRole || "guest", // Misal: ambil dari session
    });
  } catch (error) {
    console.error("Gagal menghapus data uang kas:", error.message);
    res.status(500).send("Terjadi kesalahan saat menghapus data uang kas.");
  }
};

// Fungsi untuk menambah atau memperbarui data Uang Kas
exports.addOrUpdateUangKas = async (req, res) => {
  const { wd_depo, pengurus, lokasi, keterangan, jumlah, transactionId } =
    req.body;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Buat tanggalnya hanya YYYY-MM-DD

    const parsedJumlah = parseFloat(jumlah);

    if (isNaN(parsedJumlah) || parsedJumlah <= 0) {
      return res.status(400).send("Jumlah harus berupa angka lebih dari 0.");
    }

    const uangMasuk = wd_depo === "Deposit" ? parsedJumlah : 0;
    const uangKeluar = wd_depo === "Withdraw" ? parsedJumlah : 0;

    // Jika ada transactionId (untuk update)
    if (transactionId) {
      // Cari data transaksi yang akan diupdate
      const uangKas = await Uang_Kas.findByPk(transactionId);

      if (!uangKas) {
        return res.status(404).send("Data Uang Kas tidak ditemukan.");
      }

      // Update data transaksi
      uangKas.wd_depo = wd_depo;
      uangKas.pengurus = pengurus;
      uangKas.lokasi = lokasi;
      uangKas.keterangan = keterangan;
      uangKas.uang_masuk = uangMasuk;
      uangKas.uang_keluar = uangKeluar;

      await uangKas.save(); // Simpan perubahan
    } else {
      // Jika tidak ada transactionId (untuk tambah data baru)
      const lastRecord = await Uang_Kas.findOne({
        order: [["id", "DESC"]],
      });

      let nextId = lastRecord ? lastRecord.id + 1 : 1; // Jika tidak ada record, mulai dari ID 1

      // Menambahkan data baru
      await Uang_Kas.create({
        id: nextId,
        tanggal: today,
        wd_depo,
        pengurus,
        lokasi,
        keterangan,
        uang_masuk: uangMasuk,
        uang_keluar: uangKeluar,
      });
    }

    res.redirect("/uang-kas"); // Redirect ke halaman uang kas setelah proses selesai
  } catch (error) {
    console.error("Gagal menambah atau mengupdate data uang kas:", error);
    res
      .status(500)
      .send("Terjadi kesalahan saat menambah atau mengupdate data uang kas.");
  }
};
