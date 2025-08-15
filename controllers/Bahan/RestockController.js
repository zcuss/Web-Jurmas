// controller/Bahan/RestockController.js

const { getItems } = require('../../helpers/itemHelper');
const { sequelize, HargaItems, Item, LogRestock, Uang_Kas } = require('../../models');

/**
 * ========================
 * 🚀 Menampilkan Form Restock
 * ========================
 */
exports.restockForm = async (req, res) => {
    try {
        // Ambil semua item yang ada
        const items = await getItems();

        // Ambil harga setiap item
        for (let item of items) {
            const hargaItem = await HargaItems.findOne({
                where: { item_name: item.name.toLowerCase() }
            });

            // Tentukan harga item, jika tidak ada harga maka set 0
            item.price = hargaItem && !isNaN(hargaItem.price) ? parseFloat(hargaItem.price) : 0;
        }

        // Render form restock
        res.render('1-Bahan/5-restock', {
            items,
            currentRoute: 'restock'
        });
    } catch (error) {
        res.status(500).send("Terjadi kesalahan saat mengambil data item untuk restock");
    }
};

/**
 * ===========================
 * 🔄 Proses Restock dan Update Stock
 * ===========================
 */
exports.restock = async (req, res) => {
    const restockData = req.body.restock;
    const pengurus = req.body.pengurus || 'Tidak diketahui';
    let totalEstimasiHarga = 0;

    // Periksa apakah ada data restock
    if (restockData) {
        // Iterasi untuk setiap item yang direstock
        for (const itemName in restockData) {
            let quantityRaw = restockData[itemName];
            let quantity = parseInt(quantityRaw);

            // Validasi jumlah quantity
            if (!quantityRaw || isNaN(quantity)) quantity = 0;
            if (quantity <= 0) continue;

            const itemNameNormalized = itemName.trim().toLowerCase();

            try {
                // Cari harga item
                const hargaItem = await HargaItems.findOne({
                    where: { item_name: itemNameNormalized }
                });
                const price = hargaItem ? parseFloat(hargaItem.price) : 0;
                const estimasiHarga = price * quantity;
                totalEstimasiHarga += estimasiHarga;

                // Cari item di tabel Item
                const item = await Item.findOne({
                    where: sequelize.where(
                        sequelize.fn('lower', sequelize.col('name')),
                        itemNameNormalized
                    )
                });

                if (item) {
                    // Update stok item
                    item.quantity += quantity;
                    await item.save();

                    // Simpan log restock
                    await LogRestock.create({
                        itemId: item.id,
                        quantityAdded: quantity
                    });
                } else {
                    console.warn(`⚠️ Item tidak ditemukan: "${itemName}"`);
                }
            } catch (error) {
                console.error(`❌ Error saat memproses "${itemName}":`, error.message);
            }
        }
    }

    // Jika ada total estimasi harga, catat ke Uang_Kas
    try {
        if (totalEstimasiHarga > 0) {
            await Uang_Kas.create({
                tanggal: new Date(),
                wd_depo: 'Withdraw',
                pengurus,
                lokasi: 'Restock',
                keterangan: 'Restock bahan otomatis',
                uang_masuk: 0,
                uang_keluar: totalEstimasiHarga
            });
        }
    } catch (error) {
        console.error("❌ Gagal mencatat keuangan:", error.message);
    }

    // Ambil data item setelah proses restock
    try {
        const items = await getItems();
        for (const item of items) {
            const hargaItem = await HargaItems.findOne({
                where: { item_name: item.name.toLowerCase() }
            });
            item.price = hargaItem && !isNaN(hargaItem.price) ? parseFloat(hargaItem.price) : 0;
        }

        // Render ulang halaman restock dengan data yang terbaru
        res.render('1-Bahan/5-restock', {
            items,
            currentRoute: 'restock'
        });
    } catch (err) {
        console.error("❌ Gagal mengambil item untuk halaman restock:", err.message);
        res.status(500).send("Terjadi kesalahan saat mengambil data item.");
    }
};
