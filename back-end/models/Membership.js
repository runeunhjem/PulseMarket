module.exports = (sequelize, DataTypes) => {
  const Membership = sequelize.define(
    "Membership",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      minQty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 },
      },
      maxQty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 },
      },
      discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, max: 100 },
      },
    },
    {
      timestamps: true,
    }
  );

  return Membership;
};
