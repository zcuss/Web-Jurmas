const config = require("../config/config.json");
const harga = require("../config/harga.json");

exports.formKalkulator = (req, res) => {
  const kategori = Object.keys(config.withdrawalAmounts);
  res.render("kalkulator", {
    currentRoute: "kalkulator",
    kategoriList: kategori,
    hasil: null,
    jumlah: 1,
    selected: null,
    totalHarga: null,
  });
};

exports.hitungKalkulasi = (req, res) => {
  const { kategori, jumlah } = req.body;
  const jumlahProduksi = parseInt(jumlah);
  const bahanList = config.withdrawalAmounts[kategori] || [];

  const hasil = bahanList.map((item) => ({
    name: item.name,
    total: item.amount * jumlahProduksi,
  }));

  const hargaPerUnit = harga[kategori] || 0;
  const totalHarga = hargaPerUnit * jumlahProduksi;

  const kategoriList = Object.keys(config.withdrawalAmounts);

  res.render("kalkulator", {
    currentRoute: "kalkulator",
    kategoriList,
    hasil,
    jumlah: jumlahProduksi,
    selected: kategori,
    totalHarga,
  });
};
