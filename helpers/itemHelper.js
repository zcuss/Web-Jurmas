// =============================================================
// 🔹 ITEM SERVICE
// =============================================================

const { Item } = require('../models'); // Ambil model Item secara eksplisit

/**
 * Mengambil semua data item dari database.
 * @returns {Promise<Array>} Daftar item.
 * @throws {Error} Jika terjadi kesalahan dalam pengambilan data.
 */
const getItems = async () => {
  try {
    const items = await Item.findAll();
    return items;
  } catch (error) {
    console.error("❌ Error fetching items:", error.message);
    throw new Error("Tidak dapat mengambil data item");
  }
};

// =============================================================
// 🔹 EXPORT SERVICE
// =============================================================
module.exports = {
  getItems,
};
