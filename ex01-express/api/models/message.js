// api/models/message.js
const getMessageModel = (sequelize, { DataTypes }) => {
  const Message = sequelize.define("message", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER, // 👈 bate com o User.id
      allowNull: false,
    },
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Message;
};

export default getMessageModel;
