require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const { sequelize } = require("./models");
const DiscordStrategy = require("passport-discord").Strategy;
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const stockRoutes = require("./routes");
const User = require("./models/user")(
  sequelize,
  require("sequelize").DataTypes
);
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 33003;
// Kalau mau izinkan semua origin:
app.use(cors());

/* ===============================
    🚀 Konfigurasi Session Store
=============================== */
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "Sessions",
  checkExpirationInterval: 10 * 60 * 1000, // Cek setiap 10 menit
  expiration: 365 * 24 * 60 * 60 * 1000, // 1 tahun dalam milidetik
});

sessionStore.sync(); // Sinkronkan tabel jika belum ada

/* ===============================
    🚀 Konfigurasi Passport Strategy
=============================== */
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL_HTTP,
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [user] = await User.findOrCreate({
          where: { discord_id: profile.id },
          defaults: {
            username: profile.username,
            nama: "",
            role: "user",
          },
        });
        return done(null, user);
      } catch (error) {
        console.error("❌ Error login Discord:", error); // log keseluruhan object error
        done(error, null);
      }
    }
  )
);

/* ===============================
    🚀 Passport Serialize & Deserialize
=============================== */
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    if (!user) throw new Error("User tidak ditemukan");
    done(null, user);
  } catch (error) {
    console.error("❌ Error deserialize:", error.message);
    done(error, null);
  }
});

/* ===============================
    🚀 Konfigurasi Middleware Express
=============================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ===============================
    🚀 Konfigurasi Session
=============================== */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 tahun
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ===============================
    🔄 Middleware Auto-Refresh Session
=============================== */
app.use((req, res, next) => {
  if (req.session) {
    req.session.cookie.expires = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ); // Perbarui setiap request
  }
  next();
});

/* ===============================
    🚀 Konfigurasi View Engine EJS
=============================== */
app.set("view engine", "ejs");
app.set("views", "./views");
app.locals.pretty = true;

/* ===============================
    🔄 Middleware Global
=============================== */
app.use((req, res, next) => {
  res.locals.user = req.isAuthenticated() ? req.user : null;
  next();
});

/* ===============================
    🔀 Routes
=============================== */
app.use("/", stockRoutes);

/* ===============================
    🚀 Menjalankan Server
=============================== */
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("✅ Database disinkronkan!");
    app.listen(PORT, () => {
      console.log(`🌐 Server berjalan di http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Gagal menyinkronkan database:", error.message);
  }
};

startServer();
