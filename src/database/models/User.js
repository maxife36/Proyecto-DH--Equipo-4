"use strict";
const { Model, Sequelize } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const CartModel = require("./cart")


module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {

      // User - Cart association
      this.hasOne(models.Cart, {
        as: "cart",
        foreignKey: "userId"
      })

      // User - Credit Cards association
      this.hasMany(models.Credit_Card, {
        as: "creditCards",
        foreignKey: "userId"
      })

      // User - Product through -> "comments" association
      this.belongsToMany(models.Product, {
        as: "productsReviews",
        through: {
          model: models.Comment,
          uniqueKey: "commentId",
        },
        foreignKey: "userId",
        otherKey: "productId"
      })

      // User - Comment association
      this.hasMany(models.Comment, {
        as: "comments",
        foreignKey: "userId"
      })

      // User - Purchase association
      this.hasMany(models.Purchase, {
        as: "purchases",
        foreignKey: "userId"
      })

      // User - Product through -> "favorite" association
      this.belongsToMany(models.Product, {
        as: "favoriteProducts",
        through: {
          model: models.Favorite,
          uniqueKey: "favoriteId",
        },
        foreignKey: "userId",
        otherKey: "productId"
      })
    }
  }

  User.init({
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    admin: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
      /*    validate: {
           isIn: [[0, 1]], // Restricción para permitir solo 0 o 1
         } */
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
      /*   validate: {
          isEmail: true
        } */
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: false
    },
    address: DataTypes.STRING(100),
    profileImg: DataTypes.STRING(100),
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      /*   validate: {
          is: /^[a-zA-Z0-9._-]{6,20}$/
        } */
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true
  });

  // HOOKS de User - Crea automaticamente un carrito por usuario
  User.afterCreate(async (user, options) => {
    const cartId = uuidv4(); // Generar nuevo UUID para cartId
    try {
      const CartInstance = CartModel(sequelize, DataTypes)
      await CartInstance.create({ 
        cartId,
        userId: user.userId 
      })

    } catch (err) {
      console.error('Error creating cart:', err);
    }
  })

  User.afterBulkCreate(async (users, options) => {
    for (const user of users) {
      const cartId = uuidv4(); // Generar nuevo UUID para cartId
      try {
        const CartInstance = CartModel(sequelize, DataTypes)
        await CartInstance.create({ 
          cartId,
          userId: user.userId 
        })

      } catch (err) {
        console.error('Error creating cart:', err);
      }
    }
  })

  return User;
};