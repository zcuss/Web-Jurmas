require("dotenv").config();
const { Sequelize, DataTypes, Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

// 🔗 Koneksi Database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  }
);

// =============================================================
// 🔹 MODEL: User
// =============================================================
const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    discord_id: { type: DataTypes.STRING, unique: true, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: true, defaultValue: false },
    nama: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    role: {
      type: DataTypes.ENUM("user", "mod", "admin", "superadmin"), // ✅ tambahkan superadmin
      defaultValue: "user",
      allowNull: false,
    },
  },
  { timestamps: true }
);

// =============================================================
// 🔹 MODEL: HargaItems
// =============================================================
const HargaItems = sequelize.define(
  "HargaItems",
  {
    item_name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
  },
  { tableName: "Harga_Items", timestamps: true }
);

// =============================================================
// 🔹 MODEL: Item
// =============================================================
const Item = sequelize.define(
  "Item",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { timestamps: true }
);

// =============================================================
// 🔹 MODEL: LogBahan
// =============================================================
class LogBahan extends Model {}
LogBahan.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Item, key: "id" },
    },
    quantityUsed: { type: DataTypes.INTEGER, allowNull: false },
    wdBatchId: { type: DataTypes.UUID, defaultValue: uuidv4 },
    message_id: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "LogBahan",
    tableName: "LogBahan",
    timestamps: true,
  }
);

// =============================================================
// 🔹 MODEL: LogRestock
// =============================================================
class LogRestock extends Model {}
LogRestock.init(
  {
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Item, key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    quantityAdded: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: "LogRestock",
    tableName: "LogRestocks",
    timestamps: true,
  }
);

// =============================================================
// 🔹 MODEL: LogWD
// =============================================================
const LogWD = sequelize.define(
  "LogWD",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_DATE()"),
    },
    jam: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIME()"),
    },
    nama: { type: DataTypes.STRING(100), allowNull: false },
    makanan: DataTypes.INTEGER,
    cerutu: DataTypes.INTEGER,
    korek: DataTypes.INTEGER,
    tuak: DataTypes.INTEGER,
    radio: DataTypes.INTEGER,
    micin: DataTypes.INTEGER,
    jamur: DataTypes.INTEGER,
    total_harga: DataTypes.INTEGER,
    withdraw_by: DataTypes.STRING(100),
    keterangan: {
      type: DataTypes.ENUM("LUNAS", "BELUM LUNAS"),
      defaultValue: "BELUM LUNAS",
    },
    status: {
      type: DataTypes.ENUM("CLEAR", "PENDING"),
      defaultValue: "PENDING",
    },
    gaji: { type: DataTypes.ENUM("CLEAR", "PENDING"), defaultValue: "PENDING" },
    message_id: DataTypes.STRING,
    wdBatchId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
  },
  { tableName: "LogWD", timestamps: false }
);

// =============================================================
// 🔹 MODEL: UangKas
// =============================================================
const Uang_Kas = sequelize.define(
  "UangKas",
  {
    tanggal: { type: DataTypes.DATEONLY, allowNull: false },
    wd_depo: { type: DataTypes.STRING, allowNull: false },
    pengurus: { type: DataTypes.STRING, allowNull: false },
    lokasi: { type: DataTypes.STRING, allowNull: false },
    keterangan: DataTypes.STRING,
    uang_masuk: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    uang_keluar: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  },
  { tableName: "Uang_Kas", timestamps: false }
);

// =============================================================
// 🔹 MODEL: Uang_Gaji
// =============================================================
const Uang_Gaji = sequelize.define(
  "Uang_Gaji",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    wd_depo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    wdBatchId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: Sequelize.UUIDV4,
    },
  },
  {
    tableName: "Uang_Gaji",
    timestamps: false,
  }
);

// =============================================================
// 🔹 MODEL: Uang_WD
// =============================================================
const Uang_WD = sequelize.define(
  "Uang_WD",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    wd_depo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    wdBatchId: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    },
  },
  {
    tableName: "Uang_WD",
    timestamps: false,
  }
);

// =============================================================
// 🔹 MODEL: Uang_WD_Logs
// =============================================================
const Uang_WD_Logs = sequelize.define(
  "Uang_WD_Logs",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pengurus: { type: DataTypes.STRING(50), allowNull: true },
    nominal: { type: DataTypes.INTEGER, allowNull: true },
    tujuan: { type: DataTypes.STRING(50), allowNull: true },
  },
  {
    tableName: "Uang_WD_Logs",
    timestamps: true,
  }
);

// =============================================================
// 🔹 MODEL: Uang_Gaji_Logs
// =============================================================
const Uang_Gaji_Logs = sequelize.define(
  "Uang_Gaji_Logs",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    pengurus: { type: DataTypes.STRING(50), allowNull: true },
    nominal: { type: DataTypes.INTEGER, allowNull: true },
    tujuan: { type: DataTypes.STRING(50), allowNull: true },
  },
  {
    tableName: "Uang_Gaji_Logs",
    timestamps: true,
  }
);

// =============================================================
// 🔹 MODEL: setoran_tani
// =============================================================
const setoran_tani = sequelize.define(
  "setoran_tani",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: { type: DataTypes.STRING(50), allowNull: true },
    bulan: { type: DataTypes.STRING, allowNull: true },
    jenis_tani: { type: DataTypes.STRING(50), allowNull: true },
    jumlah: { type: DataTypes.INTEGER(50), allowNull: true },
    keterangan: { type: DataTypes.STRING(50), allowNull: true },
  },
  {
    tableName: "setoran_tani",
    timestamps: false,
  }
);

// =============================================================
// 🔹 MODEL: Users
// =============================================================
const Users = sequelize.define(
  "Users",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    discord_id: { type: DataTypes.STRING(50), allowNull: true }, // meskipun int di DB, string lebih aman utk ID besar
    username: { type: DataTypes.STRING, allowNull: true },
    nama: { type: DataTypes.STRING, allowNull: true },
    role: {
      type: DataTypes.ENUM("user", "mod", "admin", "superadmin"), // <- ENUM sesuaikan dengan isi enum di DB
      allowNull: true,
    },
  },
  {
    tableName: "Users",
    timestamps: false,
  }
);

// =============================================================
// 🔹 MODEL: ChangeLog
// =============================================================
const ChangeLog = sequelize.define(
  "ChangeLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    log: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "ChangeLog", // nama tabel di database
    timestamps: true, // createdAt & updatedAt otomatis
    updatedAt: false, // disable updatedAt kalau hanya butuh createdAt
  }
);

// =============================================================
// 🔹 RELASI
// =============================================================
LogBahan.belongsTo(Item, { foreignKey: "itemId", as: "item" });
LogRestock.belongsTo(Item, { foreignKey: "itemId", as: "item" });

// =============================================================
// 🔹 EXPORT SEMUA MODEL DAN KONEKSI
// =============================================================
module.exports = {
  sequelize,
  Sequelize,
  User,
  Users,
  HargaItems,
  Item,
  LogBahan,
  LogRestock,
  LogWD,
  Uang_Kas,
  Uang_Gaji,
  Uang_WD,
  Uang_WD_Logs,
  Uang_Gaji_Logs,
  setoran_tani,
  ChangeLog,
};
