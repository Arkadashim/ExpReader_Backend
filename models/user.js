'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.belongsTo(models.Role);
            User.belongsTo(models.Author, { foreignKey: { name: 'favAuthor', allowNull: true } });
            User.belongsTo(models.Genre, { foreignKey: { name: 'favGenre', allowNull: true } });
        }
    }
    User.init({
        nickname: DataTypes.STRING,
        login: DataTypes.STRING,
        password: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'User',
    });
    module.exports.Model = User;
    return User;
};