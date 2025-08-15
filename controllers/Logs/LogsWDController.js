const { LogWD, LogBahan, Item } = require("../../models");

// Helper function untuk menangani error
function handleError(res, error, message = "Terjadi kesalahan di server") {
  console.error(error);
  res.status(500).json({ success: false, message });
}

// Untuk menampilkan data log withdrawal
exports.logsWD = async (req, res) => {
  try {
    const logs = await LogWD.findAll({
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

    res.render("3-Logs/3-logs-wd", {
      logwd: logs.length > 0 ? logs : [],
      userRole: req.user ? req.user.role : null,
      currentRoute: "logs-wd",
    });
  } catch (error) {
    handleError(
      res,
      error,
      "Terjadi kesalahan saat mengambil data log withdrawal."
    );
  }
};

// Untuk mengupdate status log withdrawal
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { keterangan, status } = req.body;

  try {
    const log = await LogWD.findByPk(id);

    if (!log) {
      return res
        .status(404)
        .json({ success: false, message: "Data tidak ditemukan" });
    }

    // Update status dan keterangan hanya jika ada perubahan
    log.status = status || log.status;
    log.keterangan = keterangan || log.keterangan;

    await log.save();
    console.log(
      `ID ${id} berhasil di-update: Keterangan -> ${keterangan}, Status -> ${status}`
    );
    res.json({ success: true });
  } catch (error) {
    handleError(res, error, "Error updating keterangan dan status.");
  }
};

// Menghapus log dan data terkait di LogBahan, lalu mengembalikan stok ke Item
// Helper function untuk menangani error
function handleError(res, error, message = "Terjadi kesalahan di server") {
  console.error(error);
  res.status(500).json({ success: false, message });
}

// Menghapus log dan data terkait di LogBahan, lalu mengembalikan stok ke Item
exports.deleteLog = async (req, res) => {
  const { id } = req.params;

  try {
    // Ambil data LogWD berdasarkan ID
    const logWD = await LogWD.findByPk(id);
    if (!logWD) {
      return res
        .status(404)
        .json({ success: false, message: "LogWD tidak ditemukan" });
    }

    // Ambil semua log bahan terkait berdasarkan wdBatchId
    const logBahan = await LogBahan.findAll({
      where: { wdBatchId: logWD.wdBatchId },
    });

    // Loop melalui setiap logBahan dan tambahkan kembali ke stok di Item
    for (let bahan of logBahan) {
      const item = await Item.findByPk(bahan.itemId);
      if (item) {
        item.quantity += bahan.quantityUsed; // ✅ Mengembalikan stok sesuai jumlah di LogBahan
        await item.save();
        console.log(
          `Stok barang dengan ID ${item.id} berhasil ditambah sebanyak ${bahan.quantityUsed}.`
        );
      } else {
        console.log(`Item dengan ID ${bahan.itemId} tidak ditemukan.`);
      }
    }

    // Hapus data terkait di LogBahan
    await LogBahan.destroy({ where: { wdBatchId: logWD.wdBatchId } });

    // Hapus data di LogWD
    await logWD.destroy();
    console.log(
      `Log dengan ID ${id} berhasil dihapus beserta data terkait di LogBahan dan stok barang di Item.`
    );
    res.json({ success: true });
  } catch (error) {
    handleError(
      res,
      error,
      "Terjadi kesalahan saat menghapus log dan mengembalikan stok."
    );
  }
};
