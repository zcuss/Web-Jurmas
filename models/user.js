module.exports = (sequelize, DataTypes) => {
    // Mendefinisikan model User
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        discord_id: {
            type: DataTypes.STRING,
            unique: true,  // Discord ID harus unik
            allowNull: false  // Discord ID tidak boleh null
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false  // Username tidak boleh null
        },
        role: {
            type: DataTypes.ENUM('user', 'mod', 'admin', 'superadmin'),
            defaultValue: 'user',
            allowNull: false  // Role tidak boleh null
        }
    }, {
        timestamps: true,  // Secara otomatis mengelola createdAt dan updatedAt
        // Option tambahan yang bisa ditambahkan jika diperlukan
        // tableName: 'users', // Nama tabel jika berbeda dengan nama model
        // underscored: true,  // Gunakan snake_case pada kolom
    });

    return User;
};