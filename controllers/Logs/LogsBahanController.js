const { Item, LogBahan } = require('../../models');
const config = require('../../config/config.json');

// Fungsi untuk memprediksi item withdraw berdasarkan bahan dan konfigurasi
function tebakWithdrawItem(bahanList, withdrawalConfigs) {
    const inputMap = bahanList.reduce((map, { name, amount }) => {
        const key = name.toLowerCase();
        map[key] = (map[key] || 0) + amount;
        return map;
    }, {});

    return Object.entries(withdrawalConfigs).reduce((result, [productName, configItems]) => {
        const configMap = configItems.reduce((map, { name, amount }) => {
            map[name.toLowerCase()] = amount;
            return map;
        }, {});

        let bisaBuat = true;
        let minMultiplier = Infinity;

        // Tentukan seberapa banyak batch yang bisa dibuat berdasarkan bahan yang tersedia
        for (const [name, amount] of Object.entries(configMap)) {
            if (!inputMap[name] || inputMap[name] < amount) {
                bisaBuat = false;
                break;
            }
            minMultiplier = Math.min(minMultiplier, Math.floor(inputMap[name] / amount));
        }

        // Jika bisa dibuat, kurangi stok bahan dan simpan hasilnya
        if (bisaBuat && minMultiplier > 0) {
            for (const [name, amount] of Object.entries(configMap)) {
                inputMap[name] -= amount * minMultiplier;
            }

            result.push({ productName, quantity: minMultiplier });
        }

        return result;
    }, []) || [{ productName: "Unknown", quantity: 1 }];
}

// Menampilkan Log Bahan
exports.logsBahan = async (req, res) => {
    try {
        const withdrawals = await LogBahan.findAll({
            include: [{ model: Item, as: 'item' }],
            order: [['createdAt', 'DESC']]
        });

        // Kelompokkan log berdasarkan wdBatchId
        const groupedLogs = withdrawals.reduce((group, wd) => {
            const key = wd.wdBatchId;
            group[key] = group[key] || [];
            group[key].push(wd);
            return group;
        }, {});

        const formattedLogs = Object.entries(groupedLogs).map(([wdBatchId, logs]) => {
            const firstLog = logs[0];
            const dateObj = new Date(firstLog.createdAt);
            const date = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
            const time = `${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;

            const bahanList = logs.map(wd => ({
                name: wd.item.name,
                amount: wd.quantityUsed
            }));

            const withdrawnItems = tebakWithdrawItem(bahanList, config.withdrawalAmounts);

            return {
                date,
                time,
                withdrawItem: withdrawnItems,
                items: bahanList.map(({ name, amount }) => ({
                    name,
                    quantity: -amount
                }))
            };
        });

        res.render('3-Logs/2-logs-bahan', {
            logs: formattedLogs,
            currentRoute: 'logs-bahan'
        });
    } catch (error) {
        console.error('❌ Gagal mengambil log withdraw:', error);
        res.status(500).send('Terjadi kesalahan saat mengambil log withdraw.');
    }
};
