const db = require("../models"); // Pastikan path ini sesuai struktur project kamu

// 🔍 TAMPILKAN SEMUA USER
exports.ShowRole = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ["id", "username", "nama", "role"],
    });

    const roles = getRoleEnumValues();

    res.render("role", {
      currentRoute: "role",
      users,
      roles,
    });
  } catch (error) {
    console.error("❌ Error saat mengambil data role:", error.message);
    res.status(500).send("Terjadi kesalahan saat mengambil data role.");
  }
};

// ✏️ UPDATE ROLE DAN NAMA USER
exports.UpdateRole = async (req, res) => {
  const { id } = req.params;
  const { nama, role } = req.body;

  try {
    // Validasi input
    if (!nama || !role) {
      return res.status(400).send("Nama dan role tidak boleh kosong.");
    }

    const updated = await db.User.update({ nama, role }, { where: { id } });

    if (updated[0] === 0) {
      return res.status(404).send("Pengguna tidak ditemukan.");
    }

    res.redirect("/role");
  } catch (error) {
    console.error("❌ Error saat update data pengguna:", error.message);
    res.status(500).send("Terjadi kesalahan saat update data.");
  }
};

// Fungsi ambil enum role dari model User
const getRoleEnumValues = () => {
  const roleField = db.User.rawAttributes.role;
  if (roleField && roleField.type && roleField.type.values) {
    return roleField.type.values;
  }
  return []; // fallback
};
