const express = require("express");
const passport = require("passport");
const router = express.Router();

// Middleware: Cek login dan role pengguna
const { checkLogin, checkRole } = require("../middlewares/checkLogin");

// Controller untuk berbagai fitur
const dashboardController = require("../controllers/dashboardController");
const kalkulatorController = require("../controllers/kalkulatorController");
const ChangelogController = require("../controllers/ChangelogController");
const RoleController = require("../controllers/roleController");
const BahanController = require("../controllers/Bahan/BahanController");
const FixController = require("../controllers/Bahan/FixController");
const HargaController = require("../controllers/Bahan/HargaController");
const KulkasController = require("../controllers/Bahan/KulkasController");
const RestockController = require("../controllers/Bahan/RestockController");
const WithdrawController = require("../controllers/Bahan/WithdrawController");
const LogsBahanController = require("../controllers/Logs/LogsBahanController");
const LogsRestockController = require("../controllers/Logs/LogsRestockController");
const LogsWDController = require("../controllers/Logs/LogsWDController");
const UangGajiController = require("../controllers/Uang/UangGajiController");
const UangKasController = require("../controllers/Uang/UangKasController");
const UangWDController = require("../controllers/Uang/UangWDController");
const AuthController = require("../controllers/AuthController");
const SetoranTaniController = require("../controllers/SetoranTaniController");

// ** Routes untuk Otentikasi Discord **
// Mengarahkan pengguna untuk login melalui Discord
router.get("/auth/discord", passport.authenticate("discord"));

// Callback setelah Discord mengautentikasi pengguna
router.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login" }), // Jika gagal, redirect ke halaman login
  (req, res) => {
    res.redirect("/dashboard"); // Jika berhasil, arahkan ke dashboard
  }
);

// ** Routes untuk Halaman Login **
router.get("/", AuthController.login); // Menampilkan halaman login utama
router.get("/login", AuthController.login); // Halaman login

// ** Routes untuk Dashboard **
router.get("/dashboard", checkLogin, dashboardController.Dashboard); // Halaman dashboard
router.get("/kalkulator", checkLogin, kalkulatorController.formKalkulator);
router.post("/kalkulator", checkLogin, kalkulatorController.hitungKalkulasi);

router.get(
  "/changelog",
  checkLogin,
  checkRole(["superadmin"]),
  ChangelogController.ShowLog
);
router.post(
  "/changelog/add",
  checkLogin,
  checkRole(["superadmin"]),
  ChangelogController.AddLog
);
router.post(
  "/changelog/edit/:id",
  checkLogin,
  checkRole(["superadmin"]),
  ChangelogController.EditLog
);
router.post(
  "/changelog/delete/:id",
  checkLogin,
  checkRole(["superadmin"]),
  ChangelogController.DeleteLog
);

router.get(
  "/role",
  checkLogin,
  checkRole(["superadmin"]),
  RoleController.ShowRole
);
router.post(
  "/role/update/:id",
  checkLogin,
  checkRole(["superadmin"]),
  RoleController.UpdateRole
);

router.get("/setoran_tani", checkLogin, SetoranTaniController.SetoranTani);
router.post("/setoran_tani", SetoranTaniController.tambahSetoran);
router.get("/setoran/rekap", SetoranTaniController.rekapSetoranTani); // Rekap setoran tani

// ** Routes untuk Manajemen Bahan **
router.get("/harga-bahan", checkLogin, HargaController.showHarga); // Menampilkan harga bahan
router.post("/update-harga", HargaController.updateHarga); // Mengupdate harga bahan
router.get("/stock-bahan", checkLogin, BahanController.stockBahan); // Menampilkan stok bahan
router.get("/api/stock-bahan", BahanController.ApistockBahan); // Menampilkan stok bahan
router.get("/stock-kulkas", checkLogin, KulkasController.stockKulkas); // Menampilkan stok kulkas

// ** Routes untuk Stock-Fix (Hanya untuk Superadmin) **
router.get(
  "/stock-fix",
  checkLogin,
  checkRole(["superadmin"]),
  FixController.getStockFix
);
router.post("/stock-fix", FixController.postStockFix);

// ** Routes untuk Restock (Untuk Admin dan Superadmin) **
router.get(
  "/restock",
  checkLogin,
  checkRole(["admin", "superadmin"]),
  RestockController.restockForm
);
router.post("/restock", RestockController.restock); // Melakukan restock bahan

// ** Routes untuk Withdraw (Untuk Admin dan Superadmin) **
router.get(
  "/withdraw",
  checkLogin,
  checkRole(["admin", "superadmin"]),
  WithdrawController.withdrawForm
);
router.post("/withdraw", WithdrawController.withdraw); // Melakukan withdraw
router.post("/withdraw/mark-as-paid", WithdrawController.markAsPaid); // Tandai withdraw sebagai "Lunas"
router.post("/withdraw/mark-as-unpaid", WithdrawController.markAsUnpaid); // Tandai withdraw sebagai "Belum Lunas"
router.post(
  "/withdraw/delete-by-message-id",
  WithdrawController.deleteByMessageId
); // Hapus withdraw berdasarkan ID pesan

// ** Routes untuk Logs **
router.get("/logs-restock", checkLogin, LogsRestockController.logsRestock); // Menampilkan log restock
router.get("/logs-bahan", checkLogin, LogsBahanController.logsBahan); // Menampilkan log bahan
router.get("/logs-wd", checkLogin, LogsWDController.logsWD); // Menampilkan log withdraw
router.post("/logwd/updateStatus/:id", LogsWDController.updateStatus); // Update status log withdraw
router.delete("/logwd/delete/:id", LogsWDController.deleteLog); // Menghapus log withdraw

// ** Routes untuk Uang **
router.get("/uang-kas", UangKasController.showUangKas); // Menampilkan uang kas
router.get("/api/uang-kas", UangKasController.ApiUangKas); // Menampilkan uang kas
router.post("/update-kas", UangKasController.addOrUpdateUangKas); // Menambah uang kas
router.post("/uang-kas/delete/:id", UangKasController.deleteUangKas);
router.get("/uang-wd", checkLogin, UangWDController.showUangWD); // Menampilkan uang withdraw
router.post("/setor-uang/:admin", UangWDController.setorUang);
router.get("/uang-gaji", checkLogin, UangGajiController.showUangGaji); // Menampilkan uang gaji
router.post("/uang-gaji/:admin", UangGajiController.ambilGaji);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Gagal logout:", err);
      return res.status(500).send("Gagal logout.");
    }
    res.redirect("/login"); // arahkan ke halaman login
  });
});

// ** Routes Lainnya **
module.exports = router;
