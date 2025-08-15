const { Uang_Gaji, Uang_Gaji_Logs } = require("../../models");

const ADMIN_FIELDS = ["babeh", "naomi", "kay", "roy"];

exports.showUangGaji = async (req, res) => {
  try {
    const transaksi = await Uang_Gaji.findAll();
    const logs = await Uang_Gaji_Logs.findAll({
      order: [["createdAt", "DESC"]],
    });

    const gajiData = {
      Babeh: 0,
      Naomi: 0,
      Kay: 0,
      Roy: 0,
    };

    transaksi.forEach((t) => {
      const nama = t.nama?.toLowerCase();
      const jumlah = t.jumlah || 0;
      if (ADMIN_FIELDS.includes(nama)) {
        const key = nama.charAt(0).toUpperCase() + nama.slice(1);
        if (t.wd_depo === "Masuk") gajiData[key] += jumlah;
        else if (t.wd_depo === "Keluar") gajiData[key] -= jumlah;
      }
    });

    res.render("2-Uang/3-uang-gaji", {
      currentRoute: "uang-gaji",
      gajiData,
      logs,
      user: req.user, // kirim user ke EJS
    });
  } catch (error) {
    console.error("Gagal memuat data Uang Gaji:", error);
    res.status(500).send("Terjadi kesalahan saat memuat data Uang Gaji.");
  }
};

exports.ambilGaji = async (req, res) => {
  const admin = req.params.admin?.toLowerCase();
  const jumlah = parseInt(req.body.jumlah, 10);

  const pengurus = req.user?.dataValues?.username || "unknown";

  if (!ADMIN_FIELDS.includes(admin) || isNaN(jumlah) || jumlah <= 0) {
    return res.status(400).send("Permintaan tidak valid.");
  }

  try {
    const transaksi = await Uang_Gaji.findAll({ where: { nama: admin } });

    let saldo = 0;
    transaksi.forEach((t) => {
      const nilai = t.jumlah || 0;
      if (t.wd_depo === "Masuk") saldo += nilai;
      else if (t.wd_depo === "Keluar") saldo -= nilai;
    });

    if (jumlah > saldo) {
      return res
        .status(400)
        .send(
          `Saldo tidak mencukupi. Saldo saat ini: Rp ${saldo.toLocaleString()}`
        );
    }

    await Uang_Gaji.create({
      nama: admin,
      wd_depo: "Keluar",
      jumlah,
      wdBatchId: null,
    });

    await Uang_Gaji_Logs.create({
      pengurus, // sudah dari username
      nominal: jumlah,
      tujuan: admin.charAt(0).toUpperCase() + admin.slice(1),
    });

    res.redirect("/uang-gaji");
  } catch (error) {
    console.error("Gagal ambil gaji:", error);
    res.status(500).send("Terjadi kesalahan saat mengambil gaji.");
  }
};
