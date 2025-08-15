// controller/Bahan/StockKulkasController.js

const { getItems } = require('../../helpers/itemHelper');
const fs = require('fs');
const path = require('path');

/**
 * =========================
 * 🔄 GET: Halaman Stock Kulkas
 * =========================
 */
exports.stockKulkas = async (req, res) => {
    try {
        // Membaca file config.json untuk mendapatkan data withdrawalAmounts
        const configData = fs.readFileSync(path.join(__dirname, '../../config/config.json'), 'utf8');
        const config = JSON.parse(configData);
        const withdrawalAmounts = config.withdrawalAmounts.makanan;

        // Ambil semua item dari helper getItems
        const allItems = await getItems();

        // Daftar nama item yang diizinkan
        const allowedItems = [
            'Ayam', 'Daging', 'Buah Buahan', 'Ikan', 'Lemak',
            'Akua', 'Susu', 'Cengkeh', 'Garam', 'Gula',
            'Sambal', 'Teh Celup', 'Telur', 'Zat Kimia',
            'Daun', 'Bambu', 'Beras'
        ];

        // Filter item yang sesuai dengan daftar allowedItems dan tidak diawali dengan 'skip'
        const filteredItems = allItems.filter(item =>
            allowedItems.includes(item.dataValues.name) && !item.dataValues.name.startsWith('skip')
        );

        // Perbarui jumlah item berdasarkan withdrawalAmounts dari config
        const updatedItems = filteredItems.map(item => {
            const withdrawalItem = withdrawalAmounts.find(configItem => configItem.name === item.dataValues.name);
            if (withdrawalItem) {
                const updatedQuantity = item.dataValues.quantity - withdrawalItem.amount;
                item.dataValues.quantity = updatedQuantity;
            }
            return item;
        });

        // Urutkan item sesuai urutan allowedItems dan pastikan setiap item ada
        const sortedItems = allowedItems.map(name => {
            return updatedItems.find(item => item.dataValues.name === name);
        }).filter(item => item !== undefined);

        // Render halaman dengan data items yang sudah diurutkan
        res.render('1-Bahan/3-stock-kulkas', {
            items: sortedItems,
            currentRoute: 'stock-kulkas'
        });
        
    } catch (error) {
        console.error('Gagal mengambil data item:', error);
        res.status(500).send("Terjadi kesalahan saat mengambil data item");
    }
};
