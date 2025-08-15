const moment = require("moment");
const { setoran_tani } = require("../models");
const fs = require("fs");
const path = require("path");

// 🔹 Load nama dari JSON
function loadNamaList() {
  const namaPath = path.resolve(__dirname, "../config/nama.json");
  const namaData = fs.readFileSync(namaPath, "utf-8");
  return JSON.parse(namaData).nama;
}

// 🔹 Daftar bulan
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

// 🔹 Tampilkan halaman utama
exports.SetoranTani = async (req, res) => {
  try {
    const data = await setoran_tani.findAll();
    const namaList = loadNamaList();

    const rekap = {};

    data.forEach((item) => {
      const nama = item.nama.toUpperCase();
      const bulan = item.bulan;
      const jenis = `${item.jumlah} ${item.jenis_tani.toUpperCase()}`;

      if (!rekap[nama]) rekap[nama] = {};
      rekap[nama][bulan] = jenis; // 👈 ganti jadi overwrite, bukan +=
    });

    const uniqueNamaList = [
      ...new Set(data.map((item) => item.nama.toUpperCase())),
    ];

    res.render("setoran-tani", {
      currentRoute: "setoran-tani",
      setoranList: uniqueNamaList.map((nama) => ({ nama })), // Hanya list unik nama
      moment,
      bulanList,
      rekap,
      namaList,
    });
  } catch (error) {
    console.error("❌ Error rendering setoran tani:", error.message);
    res.status(500).send("Terjadi kesalahan saat memuat halaman setoran tani.");
  }
};

// 🔹 Tambah data setoran
exports.tambahSetoran = async (req, res) => {
  try {
    const { nama, bulan, jenis_tani, jumlah, keterangan } = req.body;

    const namaList = loadNamaList();
    if (!namaList.includes(nama)) throw new Error("Nama tidak valid.");

    const bulanIndex = bulanList.indexOf(bulan);
    if (bulanIndex === -1) throw new Error("Bulan tidak valid.");

    const tanggal = moment()
      .month(bulanIndex)
      .startOf("month")
      .format("YYYY-MM-DD");

    // 🔍 Cek apakah sudah ada setoran untuk nama + bulan
    const existing = await setoran_tani.findOne({
      where: { nama, bulan },
    });

    if (existing) {
      // Jika ada, update data tersebut
      await setoran_tani.update(
        { jenis_tani, jumlah, keterangan, tanggal },
        { where: { id: existing.id } }
      );
    } else {
      // Jika belum ada, buat entri baru
      await setoran_tani.create({
        nama,
        bulan,
        jenis_tani,
        jumlah,
        keterangan: keterangan || null,
        tanggal,
      });
    }

    res.redirect("/setoran_tani");
  } catch (error) {
    console.error("❌ Gagal menambahkan/setoran:", error.message);
    res.status(500).send("Gagal menambahkan data.");
  }
};

// 🔹 Rekap setoran khusus (jika dibutuhkan)
exports.rekapSetoranTani = async (req, res) => {
  try {
    const data = await setoran_tani.findAll();
    const rekap = {};

    data.forEach((item) => {
      const nama = item.nama.toUpperCase();
      const bulanIndex = moment(item.tanggal).month();
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
  } catch (error) {
    console.error("❌ Gagal memuat rekap:", error.message);
    res.status(500).send("Terjadi kesalahan memuat rekap.");
  }
};
