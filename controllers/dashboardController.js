// Controller untuk Dashboard dan Setoran Tani

exports.Dashboard = async (req, res) => {
  try {
    // Ambil data user dari middleware
    const { user } = req;

    res.render("dashboard", {
      currentRoute: "dashboard",
      user, // Kirim user ke EJS
    });
  } catch (error) {
    console.error("❌ Error rendering dashboard:", error.message);
    res.status(500).send("Terjadi kesalahan saat memuat dashboard.");
  }
};

const moment = require("moment");
const { setoran_tani } = require("../models");

// 🔹 Tampilkan halaman + semua data
exports.SetoranTani = async (req, res) => {
  try {
    const data = await setoran_tani.findAll({
      order: [["tanggal", "DESC"]],
    });

    res.render("setoran-tani", {
      currentRoute: "setoran-tani",
      setoranList: data,
      moment, // format tanggal di EJS
    });
  } catch (error) {
    console.error("❌ Error rendering setoran tani:", error.message);
    res.status(500).send("Terjadi kesalahan saat memuat halaman setoran tani.");
  }
};

// 🔹 Tambah data baru
exports.tambahSetoran = async (req, res) => {
  try {
    const { nama, tanggal, jenis_tani, jumlah, keterangan } = req.body;

    await setoran_tani.create({
      nama,
      tanggal,
      jenis_tani,
      jumlah,
      keterangan: keterangan || null,
    });

    res.redirect("/setoran");
  } catch (error) {
    console.error("❌ Gagal menambahkan setoran:", error.message);
    res.status(500).send("Gagal menambahkan data.");
  }
};

// 🔹 Edit data berdasarkan ID
exports.editSetoran = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, tanggal, jenis_tani, jumlah, keterangan } = req.body;

    await setoran_tani.update(
      {
        nama,
        tanggal,
        jenis_tani,
        jumlah,
        keterangan: keterangan || null,
      },
      {
        where: { id },
      }
    );

    res.redirect("/setoran");
  } catch (error) {
    console.error("❌ Gagal mengedit setoran:", error.message);
    res.status(500).send("Gagal mengedit data.");
  }
};

// 🔹 Hapus data berdasarkan ID
exports.hapusSetoran = async (req, res) => {
  try {
    const { id } = req.params;

    await setoran_tani.destroy({
      where: { id },
    });

    res.redirect("/setoran");
  } catch (error) {
    console.error("❌ Gagal menghapus setoran:", error.message);
    res.status(500).send("Gagal menghapus data.");
  }
};

// 🔹 Rekap bulanan (pivot NAMA x BULAN)
exports.rekapSetoranTani = async (req, res) => {
  try {
    const data = await setoran_tani.findAll();

    // Struktur bulan
    const bulanList = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    // Rekap per nama dan per bulan
    const rekap = {};

    data.forEach((item) => {
      const nama = item.nama.toUpperCase();
      const bulanIndex = moment(item.tanggal).month(); // 0 - 11
      const bulan = bulanList[bulanIndex];
      const jenis = `${item.jumlah} ${item.jenis_tani.toUpperCase()}`;

      if (!rekap[nama]) rekap[nama] = {};
      if (!rekap[nama][bulan]) {
        rekap[nama][bulan] = jenis;
      } else {
        rekap[nama][bulan] += " + " + jenis;
      }
    });

    res.render("rekap-setoran", {
      currentRoute: "rekap-setoran",
      bulanList,
      rekap,
    });
  } catch (err) {
    console.error("❌ Gagal memuat rekap:", err.message);
    res.status(500).send("Terjadi kesalahan memuat rekap.");
  }
};
