const { getItems } = require("../../helpers/itemHelper");
const { LogWDUser } = require("../../models");
const config = require("../../config/config.json");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

exports.withdrawForm = async (req, res) => {
  try {
    const items = await getItems();
    const maxWithdraws = (items, config.withdrawalAmounts);

    res.render("4-Wd/WithdrawForm", {
      items,
      maxWithdraws,
      currentRoute: "WithdrawForm",
    });
  } catch (error) {
    console.error("Error loading withdraw form:", error);
    res.status(500).send("Terjadi kesalahan saat memuat halaman withdraw.");
  }
};

// Normalisasi nama pengurus
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
  return lowerInput;
}

exports.withdraw = async (req, res) => {
  const { withdrawItem: withdrawItemsRaw, pengurus, message_id, yang_wd } = req.body;

  if (!yang_wd || typeof yang_wd !== "string" || !yang_wd.trim()) {
    return res.status(400).send("Nama yang withdraw tidak boleh kosong.");
  }

  let withdrawItems;
  try {
    withdrawItems = typeof withdrawItemsRaw === "string" ? JSON.parse(withdrawItemsRaw) : withdrawItemsRaw;
    if (!Array.isArray(withdrawItems) || withdrawItems.some((i) => typeof i.name !== "string" || isNaN(Number(i.quantity)))) {
      throw new Error();
    }
  } catch {
    return res.status(400).send("Format withdrawItem tidak valid.");
  }

  const wdBatchIdNew = Date.now();
  const now = dayjs().tz("Asia/Jakarta");
  const tanggal = now.format("YYYY-MM-DD");
  const jam = now.format("HH:mm:ss");

  // Load harga
  const hargaDataRaw = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config/harga.json")));
  const hargaData = Object.fromEntries(Object.entries(hargaDataRaw).map(([k, v]) => [k.toLowerCase(), v]));

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

  try {
    // Hitung total harga & mapping item field
    for (const { name, quantity } of withdrawItems) {
      const itemName = name.toLowerCase();
      const qty = Number(quantity);
      const hargaItem = hargaData[itemName];

      if (hargaItem === undefined) {
        return res.status(400).send(`Harga untuk item '${itemName}' tidak ditemukan.`);
      }

      totalHarga += hargaItem * qty;
      if (wdItemFields.hasOwnProperty(itemName)) wdItemFields[itemName] += qty;
    }

    const namaPengurus = normalizePengurusName(pengurus);

    await LogWDUser.create({
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
    });

    return res.status(200).send("Withdraw berhasil dicatat.");
  } catch (error) {
    console.error("❌ Gagal memproses withdraw:", error.message);
    return res.status(500).send("Terjadi kesalahan saat memproses withdraw.");
  }
};
