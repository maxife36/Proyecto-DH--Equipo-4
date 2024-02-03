"use strict";
/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("favorites", {
      favoriteId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.fn("UUID"),
        primaryKey: true,
        allowNull: false,
      }
    }, {
      timestamp: false
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("favorites");
  }
};