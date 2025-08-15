const { Item, LogRestock } = require('../../models');

// Fungsi untuk memformat tanggal dan waktu
function formatDateTime(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return {
        formattedDate: `${day}/${month}/${year}`,
        formattedTime: `${hours}:${minutes}`
    };
}

exports.logsRestock = async (req, res) => {
    try {
        const restocks = await LogRestock.findAll({
            include: [{ model: Item, as: 'item' }],
            order: [['createdAt', 'DESC']]  // Sorting directly from the query
        });

        const formattedLogs = restocks.reduce((acc, restock) => {
            const { formattedDate, formattedTime } = formatDateTime(new Date(restock.createdAt));

            const itemDetail = {
                name: restock.item.name,
                quantity: restock.quantityAdded
            };

            // Find or create the log entry for the same date and time
            const existingLog = acc.find(log => log.date === formattedDate && log.time === formattedTime);
            if (existingLog) {
                existingLog.items.push(itemDetail);
            } else {
                acc.push({
                    date: formattedDate,
                    time: formattedTime,
                    items: [itemDetail]
                });
            }

            return acc;
        }, []);

        res.render('3-Logs/1-logs-restock', {
            logs: formattedLogs.reverse(),  // Reverse logs for recent first
            currentRoute: 'logs-restock'
        });
    } catch (error) {
        console.error('❌ Gagal mengambil log restock:', error);
        res.status(500).send("Terjadi kesalahan saat mengambil log restock.");
    }
};
