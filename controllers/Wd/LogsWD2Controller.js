const { LogWDUser } = require("../../models");

// Helper function untuk menangani error
function handleError(res, error, message = "Terjadi kesalahan di server") {
  console.error(error);
  res.status(500).json({ success: false, message });
}

// Untuk menampilkan data log withdrawal
exports.logsWD = async (req, res) => {
  try {
    const logs = await LogWDUser.findAll({
      attributes: [
        "id",
        "tanggal",
        "jam",
        "nama",
        "makanan",
        "cerutu",
        "korek",
        "tuak",
        "radio",
        "micin",
        "jamur",
        "total_harga",
        "withdraw_by",
        "keterangan",
        "status",
        "message_id",
      ],
    });

    res.render("4-Wd/LogsWd", {
      LogWDUser: logs.length > 0 ? logs : [],
      userRole: req.user ? req.user.role : null,
      currentRoute: "LogsWdUser",
    });
  } catch (error) {
    handleError(res, error, "Terjadi kesalahan saat mengambil data log withdrawal.");
  }
};

// Untuk mengupdate status log withdrawal
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { keterangan, status } = req.body;

  try {
    const log = await LogWDUser.findByPk(id);

    if (!log) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    }

    // Update status dan keterangan hanya jika ada perubahan
    log.status = status || log.status;
    log.keterangan = keterangan || log.keterangan;

    await log.save();
    console.log(`ID ${id} berhasil di-update: Keterangan -> ${keterangan}, Status -> ${status}`);
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Error updating keterangan dan status.");
  }
};

// Menghapus log withdrawal (tanpa bahan & item)
exports.deleteLog = async (req, res) => {
  const { id } = req.params;

  try {
    const logWDUser = await LogWDUser.findByPk(id);
    if (!logWDUser) {
      return res.status(404).json({ success: false, message: "Log WD User tidak ditemukan" });
    }

    await logWDUser.destroy();
    console.log(`Log WD User dengan ID ${id} berhasil dihapus.`);
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Terjadi kesalahan saat menghapus log.");
  }
};
