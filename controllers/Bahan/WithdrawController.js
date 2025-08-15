const { getItems } = require("../../helpers/itemHelper");
const {
  sequelize,
  Item,
  LogBahan,
  LogWD,
  Uang_Gaji,
  Uang_WD,
} = require("../../models");
const config = require("../../config/config.json");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const calculateMaxWithdraws = (items, withdrawalAmounts) => {
  const bahanStok = items.reduce((acc, item) => {
    acc[item.name.toLowerCase()] = item.quantity;
    return acc;
  }, {});

  return Object.entries(withdrawalAmounts).reduce(
    (acc, [itemKey, bahanList]) => {
      const minRasio = bahanList.reduce((min, bahan) => {
        const stok = bahanStok[bahan.name.toLowerCase()] || 0;
        if (stok <= 0) return 0;
        return Math.min(min, Math.floor(stok / bahan.amount));
      }, Infinity);

      acc[itemKey] = minRasio === 0 ? "Stok Habis" : minRasio;
      return acc;
    },
    {}
  );
};

exports.withdrawForm = async (req, res) => {
  try {
    const items = await getItems();
    const maxWithdraws = calculateMaxWithdraws(items, config.withdrawalAmounts);

    res.render("1-Bahan/6-withdraw", {
      items,
      maxWithdraws,
      currentRoute: "withdraw",
    });
  } catch (error) {
    console.error("Error loading withdraw form:", error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman withdraw.");
  }
};

// Fungsi normalize supaya variasi kapitalisasi dianggap sama
function normalizePengurusName(inputName) {
  const lowerInput = inputName.toLowerCase().trim();
  const aliasMap = {
    babeh: ["babeh"],
    naomi: ["naomi", "naomi lazovsky haegen"],
    kay: ["kay", "kay s hawkins"],
    roy: ["roy"],
  };

  for (const [key, aliases] of Object.entries(aliasMap)) {
    if (aliases.some((alias) => lowerInput.includes(alias.toLowerCase()))) {
      return key;
    }
  }
  return lowerInput; // fallback jika tidak ketemu alias
}

exports.withdraw = async (req, res) => {
  const {
    withdrawItem: withdrawItemsRaw,
    pengurus,
    message_id,
    yang_wd,
  } = req.body;

  if (!yang_wd || typeof yang_wd !== "string" || !yang_wd.trim())
    return res.status(400).send("Nama yang withdraw tidak boleh kosong.");

  let withdrawItems;
  try {
    withdrawItems =
      typeof withdrawItemsRaw === "string"
        ? JSON.parse(withdrawItemsRaw)
        : withdrawItemsRaw;
    if (
      !Array.isArray(withdrawItems) ||
      withdrawItems.some(
        (i) => typeof i.name !== "string" || isNaN(Number(i.quantity))
      )
    ) {
      throw new Error();
    }
  } catch {
    return res.status(400).send("Format withdrawItem tidak valid.");
  }

  const wdBatchIdNew = Date.now();
  const now = dayjs().tz("Asia/Jakarta");
  const tanggal = now.format("YYYY-MM-DD");
  const jam = now.format("HH:mm:ss");

  const hargaDataRaw = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../config/harga.json"))
  );
  const hargaData = Object.fromEntries(
    Object.entries(hargaDataRaw).map(([k, v]) => [k.toLowerCase(), v])
  );

  let totalHarga = 0;
  const wdItemFields = {
    makanan: 0,
    cerutu: 0,
    korek: 0,
    tuak: 0,
    radio: 0,
    micin: 0,
    jamur: 0,
  };

  const t = await Item.sequelize.transaction();
  try {
    // Kelompokkan jumlah per item
    const groupedItems = withdrawItems.reduce((acc, { name, quantity }) => {
      const key = name.toLowerCase();
      const qty = Number(quantity);
      if (qty > 0) acc[key] = (acc[key] || 0) + qty;
      return acc;
    }, {});

    // Hitung bahan yang dipakai dan total harga
    const groupedBahan = {};
    for (const [itemName, qty] of Object.entries(groupedItems)) {
      const isComplex = config.withdrawalAmounts.hasOwnProperty(itemName);
      const bahanList = isComplex
        ? config.withdrawalAmounts[itemName].map((e) => [
            e.name.toLowerCase(),
            e.amount,
          ])
        : [[itemName, 1]];

      for (const [bahanName, perQty] of bahanList) {
        groupedBahan[bahanName] = (groupedBahan[bahanName] || 0) + perQty * qty;
      }

      const hargaItem = hargaData[itemName];
      if (hargaItem === undefined)
        return res
          .status(400)
          .send(`Harga untuk item '${itemName}' tidak ditemukan.`);

      totalHarga += hargaItem * qty;
      if (wdItemFields.hasOwnProperty(itemName)) wdItemFields[itemName] += qty;
    }

    // Update stok dan buat log bahan
    for (const [bahanName, qtyUsed] of Object.entries(groupedBahan)) {
      const item = await Item.findOne({ where: { name: bahanName } });
      if (!item) {
        console.error(`❌ Item '${bahanName}' tidak ditemukan.`);
        continue;
      }
      await LogBahan.create(
        {
          wdBatchId: wdBatchIdNew,
          itemId: item.id,
          quantityUsed: qtyUsed,
          message_id: message_id || null,
        },
        { transaction: t }
      );
      item.quantity -= qtyUsed;
      await item.save({ transaction: t });
    }

    const namaPengurus = normalizePengurusName(pengurus);
    console.log(`Nama pengurus yang dinormalisasi: ${namaPengurus}`);

    await LogWD.create(
      {
        wdBatchId: wdBatchIdNew,
        tanggal,
        jam,
        nama: yang_wd,
        total_harga: totalHarga,
        withdraw_by: pengurus,
        keterangan: "belum lunas",
        status: "PENDING",
        gaji: "PENDING",
        message_id: message_id || null,
        ...wdItemFields,
      },
      { transaction: t }
    );

    await Uang_WD.create(
      {
        nama: namaPengurus,
        wd_depo: "Masuk",
        jumlah: totalHarga.toString(),
        wdBatchId: wdBatchIdNew.toString(),
      },
      { transaction: t }
    );

    // Bonus gaji berdasarkan harga makanan dan config gaji
    const gajiConfig = hargaDataRaw.gaji || {};
    const bonusPer = hargaDataRaw.makanan || {};
    const bonusPerNama = gajiConfig[namaPengurus] || 0;
    const bonus = Math.floor(totalHarga / bonusPer) * bonusPerNama;

    if (bonus > 0) {
      await Uang_Gaji.create(
        {
          nama: namaPengurus,
          wd_depo: "Masuk",
          jumlah: bonus,
          wdBatchId: wdBatchIdNew.toString(),
        },
        { transaction: t }
      );
    }

    await t.commit();
    return res.status(200).send("Withdraw berhasil diproses.");
  } catch (error) {
    await t.rollback();
    console.error("❌ Gagal memproses withdraw:", error.message);
    return res.status(500).send("Terjadi kesalahan saat memproses withdraw.");
  }
};

// ==================== ENDPOINT MARK AS PAID ====================
exports.markAsPaid = async (req, res) => {
  const { message_id } = req.body;

  if (!message_id) {
    return res.status(400).send("Message ID tidak ditemukan.");
  }

  try {
    // Update status keterangan menjadi "LUNAS" berdasarkan message_id
    const [updatedRows] = await LogWD.update(
      { keterangan: "LUNAS" },
      { where: { message_id } }
    );

    if (updatedRows > 0) {
      console.log(
        `✅ Status withdraw dengan Message ID ${message_id} berhasil diubah menjadi LUNAS.`
      );
      return res.status(200).send("Status berhasil diubah ke LUNAS.");
    } else {
      console.log(
        `⚠️ Tidak ditemukan withdraw dengan Message ID ${message_id}.`
      );
      return res.status(404).send("Data tidak ditemukan.");
    }
  } catch (error) {
    console.error("❌ Gagal mengubah status withdraw:", error.message);
    return res
      .status(500)
      .send("Terjadi kesalahan saat mengubah status withdraw.");
  }
};

// ==================== ENDPOINT MARK AS UNPAID ====================
exports.markAsUnpaid = async (req, res) => {
  const { message_id } = req.body;

  if (!message_id) {
    return res.status(400).send("Message ID tidak ditemukan.");
  }

  try {
    // Update status keterangan menjadi "BELUM LUNAS" berdasarkan message_id
    const [updatedRows] = await LogWD.update(
      { keterangan: "BELUM LUNAS" },
      { where: { message_id } }
    );

    if (updatedRows > 0) {
      console.log(
        `✅ Status withdraw dengan Message ID ${message_id} berhasil diubah menjadi BELUM LUNAS.`
      );
      return res.status(200).send("Status berhasil diubah ke BELUM LUNAS.");
    } else {
      console.log(
        `⚠️ Tidak ditemukan withdraw dengan Message ID ${message_id}.`
      );
      return res.status(404).send("Data tidak ditemukan.");
    }
  } catch (error) {
    console.error("❌ Gagal mengubah status withdraw:", error.message);
    return res
      .status(500)
      .send("Terjadi kesalahan saat mengubah status withdraw.");
  }
};

// ==================== ENDPOINT DELETE BY MESSAGE ID ====================
exports.deleteByMessageId = async (req, res) => {
  const { message_id } = req.body;

  if (!message_id) {
    return res.status(400).send("Message ID tidak ditemukan.");
  }

  console.log(`🗑️ Mencoba hapus transaksi dengan Message ID: ${message_id}`);

  const sequelizeTransaction = await LogWD.sequelize.transaction();
  try {
    const logWD = await LogWD.findOne({ where: { message_id } });

    if (!logWD) {
      console.log(`⚠️ Tidak ditemukan LogWD dengan Message ID: ${message_id}`);
      await sequelizeTransaction.rollback();
      return res.status(404).send("Data LogWD tidak ditemukan.");
    }

    const { wdBatchId } = logWD;
    console.log(`🔗 Ditemukan wdBatchId: ${wdBatchId}`);

    // 🔁 Kembalikan stok item dari LogBahan
    const logBahanList = await LogBahan.findAll({
      where: { wdBatchId },
      transaction: sequelizeTransaction,
    });
    const bahanGrouped = {};

    for (const logBahan of logBahanList) {
      bahanGrouped[logBahan.itemId] =
        (bahanGrouped[logBahan.itemId] || 0) + logBahan.quantityUsed;
    }

    for (const [itemId, totalUsed] of Object.entries(bahanGrouped)) {
      const item = await Item.findByPk(itemId, {
        transaction: sequelizeTransaction,
      });
      if (item) {
        const stokSebelum = item.quantity;
        item.quantity += totalUsed;
        await item.save({ transaction: sequelizeTransaction });
        console.log(
          `✅ Stok '${item.name}' (ID ${item.id}) dikembalikan: ${stokSebelum} → ${item.quantity}`
        );
      } else {
        console.log(`⚠️ Item dengan ID ${itemId} tidak ditemukan.`);
      }
    }

    // 💰 Cek dan hapus data uang
    const cekUangWD = await Uang_WD.findAll({ where: { wdBatchId } });
    const cekUangGaji = await Uang_Gaji.findAll({ where: { wdBatchId } });
    console.log(`💰 Data Uang_WD ditemukan: ${cekUangWD.length}`);
    console.log(`👥 Data Uang_Gaji ditemukan: ${cekUangGaji.length}`);

    // 🧹 Hapus semua data terkait
    const deletedBahan = await LogBahan.destroy({
      where: { wdBatchId },
      transaction: sequelizeTransaction,
    });
    const deletedUangWD = await Uang_WD.destroy({
      where: { wdBatchId },
      transaction: sequelizeTransaction,
    });
    const deletedUangGaji = await Uang_Gaji.destroy({
      where: { wdBatchId },
      transaction: sequelizeTransaction,
    });
    const deletedLogWD = await LogWD.destroy({
      where: { wdBatchId },
      transaction: sequelizeTransaction,
    });

    console.log(
      `🗑️ Dihapus: LogBahan(${deletedBahan}), Uang_WD(${deletedUangWD}), Uang_Gaji(${deletedUangGaji}), LogWD(${deletedLogWD})`
    );

    await sequelizeTransaction.commit();
    console.log(`✅ Transaksi dengan wdBatchId ${wdBatchId} berhasil dihapus.`);

    return res.status(200).send("Transaksi dan data terkait berhasil dihapus.");
  } catch (error) {
    await sequelizeTransaction.rollback();
    console.error("❌ Gagal menghapus transaksi:", error.message);
    return res.status(500).send(`Terjadi kesalahan: ${error.message}`);
  }
};
