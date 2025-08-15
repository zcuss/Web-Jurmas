const { getItems } = require("../../helpers/itemHelper");

// Helper untuk menangani error secara terpusat
function handleError(res, error, message = "Terjadi kesalahan") {
  console.error(error);
  res.status(500).send(message);
}

exports.stockBahan = async (req, res) => {
  try {
    // Ambil data item menggunakan helper getItems
    const items = await getItems();

    // Render halaman dengan data yang diambil
    res.render("1-Bahan/2-stock-bahan", {
      items,
      currentRoute: "stock-bahan",
    });
  } catch (error) {
    // Gunakan fungsi handleError untuk menangani error
    handleError(res, error, "Terjadi kesalahan saat mengambil data item");
  }
};

exports.ApistockBahan = async (req, res) => {
  try {
    // Ambil data item menggunakan helper getItems
    const items = await getItems();

    // Kirim data dalam bentuk JSON
    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    // Tangani error, kirim status dan pesan
    console.error("Error saat mengambil data stock bahan:", error);

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data item",
      error: error.message,
    });
  }
};
