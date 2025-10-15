// controller/Bahan/StockKulkasController.js

const { getItems } = require("../../helpers/itemHelper");
const fs = require("fs");
const path = require("path");

/**
 * =========================
 * 🔄 GET: Halaman Stock Kulkas
 * =========================
 */
exports.stockKulkas = async (req, res) => {
  try {
    // Baca file config.json untuk mendapatkan data withdrawalAmounts (makanan)
    const configData = fs.readFileSync(path.join(__dirname, "../../config/config.json"), "utf8");
    const config = JSON.parse(configData);
    const withdrawalAmounts = config.withdrawalAmounts.makanan;

    // Ambil semua item dari helper getItems()
    const allItems = await getItems();

    // Ambil nama item dari config agar selalu sinkron
    const allowedItems = withdrawalAmounts.map((item) => item.name);

    // Filter hanya item yang ada di allowedItems dan bukan yang diawali "skip"
    const filteredItems = allItems.filter((item) => allowedItems.includes(item.dataValues.name) && !item.dataValues.name.startsWith("skip"));

    // Kurangi stok berdasarkan withdrawalAmounts dari config.json
    const updatedItems = filteredItems.map((item) => {
      const withdrawalItem = withdrawalAmounts.find((configItem) => configItem.name === item.dataValues.name);
      if (withdrawalItem) {
        const updatedQuantity = item.dataValues.quantity - withdrawalItem.amount;
        item.dataValues.quantity = updatedQuantity >= 0 ? updatedQuantity : 0; // Hindari stok negatif
      }
      return item;
    });

    // Urutkan item sesuai urutan dalam config.json
    const sortedItems = allowedItems.map((name) => updatedItems.find((item) => item.dataValues.name === name)).filter((item) => item !== undefined);

    // Render halaman
    res.render("1-Bahan/3-stock-kulkas", {
      items: sortedItems,
      currentRoute: "stock-kulkas",
    });
  } catch (error) {
    console.error("❌ Gagal mengambil data item:", error);
    res.status(500).send("Terjadi kesalahan saat mengambil data item");
  }
};
