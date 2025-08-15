// controller/Bahan/FixController.js

const { getItems } = require('../../helpers/itemHelper');
const { Item } = require('../../models');
const config = require('../../config/config.json');

/**
 * =========================
 * 🔄 GET: Halaman Stock Fix
 * =========================
 */
exports.getStockFix = async (req, res) => {
    try {
        const items = await getItems();

        // Ambil config makanan dan buat Map
        const withdrawalAmounts = config.withdrawalAmounts.makanan;
        const withdrawalMap = new Map(withdrawalAmounts.map(item => [item.name, item.amount]));

        // Kurangi stok dari config
        const updatedItems = items.map(item => {
            const amountToWithdraw = withdrawalMap.get(item.dataValues.name) || 0;
            item.dataValues.quantity -= amountToWithdraw;
            return item;
        });

        // Urutkan berdasarkan urutan di config makanan
        const orderedNames = withdrawalAmounts.map(item => item.name);

        // Prioritaskan urutan dari config, sisanya ditambahkan di akhir
        const sortedItems = [
            ...orderedNames
                .map(name => updatedItems.find(item => item.dataValues.name === name))
                .filter(Boolean), // buang yang tidak ketemu
            ...updatedItems.filter(item => !orderedNames.includes(item.dataValues.name))
        ];

        // Render ke EJS
        res.render('1-Bahan/4-stock-fix', {
            currentRoute: 'stock-fix',
            user: req.user,
            items: sortedItems.map(item => ({
                name: item.dataValues.name,
                amount: item.dataValues.quantity
            }))
        });

    } catch (error) {
        console.error('❌ Gagal mengambil atau mengupdate data stock fix:', error);
        res.status(500).send('Terjadi kesalahan saat memuat halaman stock fix.');
    }
};

/**
 * =========================
 * 🔄 POST: Update Stok Barang
 * =========================
 */
exports.postStockFix = async (req, res) => {
    const updates = req.body.updatedStocks;

    if (!updates || typeof updates !== 'object') {
        return res.status(400).send('Data stok tidak valid.');
    }

    // Ambil withdrawal config untuk makanan
    const withdrawalAmounts = config.withdrawalAmounts.makanan;
    const withdrawalMap = new Map(withdrawalAmounts.map(item => [item.name, item.amount]));

    // Inisialisasi array untuk menghitung hasil
    const validUpdates = [];
    const skippedItems = [];
    const invalidItems = [];
    const notFoundItems = [];

    // 🔍 Validasi dan filter item
    for (const [name, newAmount] of Object.entries(updates)) {
        if (!name || name.trim() === '' || name.toLowerCase().startsWith('skip')) {
            skippedItems.push(name);
            continue;
        }

        if (!newAmount || newAmount.trim() === '' || isNaN(parseFloat(newAmount)) || parseFloat(newAmount) < 0) {
            invalidItems.push(name);
            continue;
        }

        const parsedAmount = parseFloat(newAmount);
        const configAmount = withdrawalMap.get(name) || 0;

        // Tambahkan nilai dari config ke input form
        const finalAmount = parsedAmount + configAmount;

        validUpdates.push({ name, quantity: finalAmount });
    }

    try {
        // 🔄 Proses update bulk
        for (const update of validUpdates) {
            const [updated] = await Item.update(
                { quantity: update.quantity },
                { where: { name: update.name } }
            );

            if (updated === 0) notFoundItems.push(update.name);
        }

        // ✅ Log hasil update
        console.log(`🔁 Selesai update stok:
        - ${validUpdates.length} berhasil
        - ${skippedItems.length} dilewati
        - ${invalidItems.length} invalid
        - ${notFoundItems.length} tidak ditemukan
        `);

        res.redirect('/stock-fix');
    } catch (error) {
        console.error('❌ Gagal update stok fix:', error);
        res.status(500).send('Terjadi kesalahan saat update stok.');
    }
};

