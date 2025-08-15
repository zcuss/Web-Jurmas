// controller/Bahan/HargaController.js

const { HargaItems } = require('../../models');
const moment = require('moment');

/**
 * =========================
 * 🔄 GET: Halaman Harga Bahan
 * =========================
 */
exports.showHarga = async (req, res) => {
    try {
        // Ambil data harga bahan, urutkan berdasarkan ID
        const items = await HargaItems.findAll({
            order: [['id', 'ASC']]
        });

        // Ambil peran user, jika tidak ada maka default 'user'
        const role = req.user?.role || 'user';

        // Render ke halaman harga bahan
        res.render('1-Bahan/1-harga-bahan', { 
            items, 
            currentRoute: 'harga-bahan',
            role,     
            moment    
        });

    } catch (error) {
        console.error('Gagal mengambil data harga:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil data harga.');
    }
};

/**
 * =========================
 * 🔄 POST: Update Harga Bahan
 * =========================
 */
exports.updateHarga = async (req, res) => {
    const { id, price } = req.body;

    // Validasi input ID dan harga
    if (!id || !price) {
        return res.status(400).send('ID atau Harga tidak ada.');
    }

    try {
        // Update harga bahan berdasarkan ID
        const updatedItem = await HargaItems.update(
            { price },
            { where: { id } }
        );

        if (updatedItem[0] === 1) {
            // Jika berhasil, redirect ke halaman harga bahan
            res.redirect('/harga-bahan');
        } else {
            // Jika gagal memperbarui
            res.status(400).send('Gagal memperbarui harga.');
        }

    } catch (error) {
        console.error('Gagal memperbarui harga:', error);
        res.status(500).send('Terjadi kesalahan saat memperbarui harga.');
    }
};
