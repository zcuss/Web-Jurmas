// utils/getItems.js
const { Item } = require('../models'); // Sesuaikan dengan path model yang kamu gunakan

/**
 * Fungsi untuk mengambil semua item dari database
 * @returns {Promise<Array>} Daftar item atau array kosong jika terjadi error
 */
const getItems = async () => {
    try {
        const items = await Item.findAll();
        console.log(`✅ Berhasil mengambil ${items.length} item dari database`);
        return items;
    } catch (error) {
        console.error("❌ Error saat mengambil data item:", error.message);
        return [];
    }
};

module.exports = getItems;
