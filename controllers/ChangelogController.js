const db = require("../models");

// 📋 Tampilkan semua changelog
exports.ShowLog = async (req, res) => {
  try {
    const logs = await db.ChangeLog.findAll({
      order: [["createdAt", "DESC"]],
    });

    const { user } = req;

    res.render("changelog", {
      currentRoute: "changelog",
      logs,
      user,
    });
  } catch (error) {
    console.error("❌ Gagal ambil changelog:", error.message);
    res.status(500).send("Gagal memuat changelog.");
  }
};

// ➕ Tambah changelog baru
exports.AddLog = async (req, res) => {
  const { log } = req.body;

  if (!log || log.trim() === "") {
    return res.status(400).send("Isi changelog tidak boleh kosong.");
  }

  try {
    await db.ChangeLog.create({ log: log.trim() });
    res.redirect("/changelog");
  } catch (error) {
    console.error("❌ Gagal tambah changelog:", error.message);
    res.status(500).send("Gagal menambahkan changelog.");
  }
};

// ✏️ Edit changelog yang ada
exports.EditLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { log } = req.body;

    if (!id || !log || log.trim() === "") {
      return res.status(400).send("Data tidak valid.");
    }

    const updated = await db.ChangeLog.update(
      { log: log.trim() },
      { where: { id } }
    );

    if (updated[0] === 0) {
      return res.status(404).send("Changelog tidak ditemukan.");
    }

    res.redirect("/changelog");
  } catch (error) {
    console.error("❌ Gagal edit log:", error.message);
    res.status(500).send("Gagal mengedit catatan perubahan.");
  }
};

exports.DeleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    await db.ChangeLog.destroy({ where: { id } });
    res.redirect("/changelog");
  } catch (error) {
    console.error("❌ Gagal hapus log:", error.message);
    res.status(500).send("Gagal menghapus changelog.");
  }
};
