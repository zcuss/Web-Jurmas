// =============================================================
// 🔹 MIDDLEWARE: Authentication & Authorization
// =============================================================

/**
 * Middleware untuk memeriksa apakah user sudah login.
 * Jika mode debug aktif, bypass pengecekan login.
 */
const checkLogin = (req, res, next) => {
    const debugMode = process.env.DEBUG_MODE === 'true';
  
    if (debugMode) {
      console.log('⚠️  DEBUG MODE AKTIF: Melewati pengecekan login');
      
      // Set default user jika belum ada (untuk debug)
      req.user = req.user || { 
        username: 'Admin', 
        role: 'superadmin' 
      };
  
      return next();
    }
  
    if (!req.isAuthenticated()) {
      console.log('🔒 Akses ditolak: User belum login');
      return res.redirect('/login');
    }
  
    next();
  };
  
  /**
   * Middleware untuk memeriksa apakah user memiliki role tertentu.
   * Jika mode debug aktif, bypass pengecekan role.
   * @param {Array} allowedRoles - Daftar role yang diizinkan mengakses.
   */
  const checkRole = (allowedRoles = []) => (req, res, next) => {
    const debugMode = process.env.DEBUG_MODE === 'true';
  
    if (debugMode) {
      console.log('⚠️  DEBUG MODE AKTIF: Melewati pengecekan role');
      return next();
    }
  
    const userRole = req.user?.role;
  
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log(`⛔ Akses ditolak: Role "${userRole ?? 'undefined'}" tidak diizinkan`);
      return res.redirect('/dashboard');
    }
  
    next();
  };
  
  // =============================================================
  // 🔹 EKSPOR MIDDLEWARE
  // =============================================================
  module.exports = {
    checkLogin,
    checkRole
  };
  