'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
        }
    }
    Role.init({
        roleName: DataTypes.STRING,
    }, {
        sequelize,
        timestamps: false,
        modelName: 'Role',
    });
    
    module.exports.Model = Role;
    return Role;
};