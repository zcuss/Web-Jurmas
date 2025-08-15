const { User } = require('../models');  // Import model User

/**
 * Controller untuk proses login
 */
exports.login = (req, res) => {
    try {
        // Jika pengguna sudah terautentikasi, langsung arahkan ke dashboard
        if (req.isAuthenticated()) {
            return res.redirect('/dashboard');
        }

        // Jika DEBUG_MODE=true, lewati proses login dan langsung ke dashboard
        if (process.env.DEBUG_MODE === 'true') {
            console.log('⚠️  DEBUG MODE AKTIF: Melewati proses autentikasi');
            return res.redirect('/dashboard');
        }

        // Jika pengguna belum terautentikasi, arahkan ke halaman login Discord
        console.log('🔄  Mengarahkan ke login Discord...');
        return res.redirect('/auth/discord');
    } catch (error) {
        console.error('❌ Error saat memproses login:', error.message);
        res.status(500).send('Terjadi kesalahan saat memproses login.');
    }
};

/**
 * Callback setelah login Discord berhasil
 */
exports.discordCallback = async (req, res) => {
    try {
        console.log('✅ Callback Discord Diproses');

        // Ambil discord_id dari session user yang sudah login
        const discordId = req.user.discord_id;
        console.log(`🔎 Mencari pengguna dengan discord_id: ${discordId}`);

        // Menggunakan findOrCreate untuk memastikan user tidak duplikat
        const [user, created] = await User.findOrCreate({
            where: { discord_id: discordId },
            defaults: {
                role: 'user'  // Set role default sebagai 'user' jika pengguna baru
            }
        });

        console.log(created ? '✨ Pengguna baru ditambahkan ke database' : '🔄 Pengguna sudah ada di database');

        // Simpan user dalam session
        req.user = user;

        // Redirect ke dashboard setelah login berhasil
        return res.redirect('/dashboard');
    } catch (error) {
        console.error('❌ Error saat memproses callback Discord:', error.message);
        res.status(500).send('Terjadi kesalahan saat memproses login Discord.');
    }
};
