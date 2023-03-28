'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserBookStat extends Model {
        static associate(models) {
            UserBookStat.belongsTo(models.User);
            UserBookStat.belongsTo(models.Book);
        }
    }
    UserBookStat.init({
        currentPage: DataTypes.INTEGER,
        readPages: DataTypes.INTEGER,
        isRead: DataTypes.BOOLEAN,
        readDate: DataTypes.DATE
    }, {
        sequelize,
        timestamps: false,
        modelName: 'UserBookStat',
    });
    module.exports.Model = UserBookStat;
    return UserBookStat;
};
