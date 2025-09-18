const { Uang_WD, Uang_Kas, sequelize, Uang_WD_Logs } = require("../../models");

const validAdmins = ["babeh", "naomi", "kay", "roy"];
const validPenerima = [...validAdmins, "rei", "potong"];

// Hitung saldo terakhir berdasarkan log Masuk dan Keluar
async function getLatestSaldoByNama() {
  const records = await Uang_WD.findAll();
  const saldoMap = {};

  for (const nama of validAdmins) {
    const masuk = records
      .filter((r) => r.nama === nama && r.wd_depo === "Masuk")
      .reduce((sum, r) => sum + (r.jumlah || 0), 0);

    const keluar = records
      .filter((r) => r.nama === nama && r.wd_depo === "Keluar")
      .reduce((sum, r) => sum + (r.jumlah || 0), 0);

    saldoMap[nama] = masuk - keluar;
  }

  return saldoMap;
}

// Tampilkan data
exports.showUangWD = async (req, res) => {
  try {
    const logs = await Uang_WD_Logs.findAll({ order: [["id", "DESC"]] });
    const saldo = await getLatestSaldoByNama();

    res.render("2-Uang/1-uang-wd", {
      currentRoute: "uang-wd",
      wdData: saldo,
      logs,
      user: req.user,
    });
  } catch (error) {
    console.error("Gagal menampilkan Uang WD:", error);
    res.status(500).send("Terjadi kesalahan.");
  }
};

// Ambil WD oleh admin (Keluar)
exports.ambilWD = async (req, res) => {
  const admin = req.params.admin?.toLowerCase();
  const jumlah = parseInt(req.body.jumlah, 10);
  const pengurus = req.session.user?.username || "unknown";

  if (!validAdmins.includes(admin) || isNaN(jumlah) || jumlah <= 0) {
    return res.status(400).send("Permintaan tidak valid.");
  }

  try {
    const saldoMap = await getLatestSaldoByNama();
    if ((saldoMap[admin] || 0) < jumlah) {
      return res.status(400).send("Saldo tidak mencukupi.");
    }

    await Uang_WD.create({
      nama: admin,
      wd_depo: "Keluar",
      jumlah,
      Keterangan: `Ambil WD oleh ${admin}`,
      wdBatchId: `WD-${Date.now()}`,
    });

    res.redirect("/uang-wd");
  } catch (err) {
    console.error("Gagal ambil WD:", err);
    res.status(500).send("Gagal memproses WD.");
  }
};

// Setor uang ke sesama admin atau kas
// Setor uang ke sesama admin atau kas
exports.setorUang = async (req, res) => {
  const pengirim = req.params.admin;
  const { jumlah, penerima } = req.body;
  const nominal = parseInt(jumlah);

  if (req.user.role !== "superadmin")
    return res.status(403).send("Akses ditolak.");

  if (!validAdmins.includes(pengirim) || !validPenerima.includes(penerima))
    return res.status(400).send("Pengirim atau penerima tidak valid.");
  if (penerima === pengirim)
    return res.status(400).send("Tidak bisa transfer ke diri sendiri.");
  if (isNaN(nominal) || nominal <= 0)
    return res.status(400).send("Nominal tidak valid.");

  const t = await sequelize.transaction();
  try {
    const saldoMap = await getLatestSaldoByNama();
    if ((saldoMap[pengirim] || 0) < nominal) {
      throw new Error("Saldo pengirim tidak cukup.");
    }

    const batchId = `WD-${Date.now()}`;

    // Siapkan catatan ke Uang_WD
    const logs = [
      {
        nama: pengirim,
        wd_depo: "Keluar",
        jumlah: nominal,
        Keterangan: `Transfer ke ${penerima}`,
        wdBatchId: batchId,
      },
    ];

    if (validAdmins.includes(penerima)) {
      logs.push({
        nama: penerima,
        wd_depo: "Masuk",
        jumlah: nominal,
        Keterangan: `Dari ${pengirim}`,
        wdBatchId: batchId,
      });
    }

    // Simpan ke tabel Uang_WD
    await Uang_WD.bulkCreate(logs, { transaction: t });

    // Jika transfer ke rei, catat ke Uang_Kas
    if (penerima === "rei") {
      await Uang_Kas.create(
        {
          tanggal: new Date(),
          wd_depo: "Deposit",
          pengurus: pengirim,
          lokasi: "Transfer ke Rei",
          keterangan: `Setor dari ${pengirim}`,
          uang_masuk: nominal,
          uang_keluar: 0,
        },
        { transaction: t }
      );
    }

    // Tambahkan log ke Uang_WD_Logs
    await Uang_WD_Logs.create(
      {
        pengurus: pengirim,
        nominal: nominal,
        tujuan: penerima,
      },
      { transaction: t }
    );

    // Commit transaksi
    await t.commit();
    res.redirect("/uang-wd");
  } catch (err) {
    await t.rollback();
    console.error("Gagal setor:", err);
    res.status(500).send(err.message || "Gagal setor uang.");
  }
};
