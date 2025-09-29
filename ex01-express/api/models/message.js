const getMessageModel = (sequelize, { DataTypes }) => {
  const Message = sequelize.define("Message", { 
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: "userId" }); 
  };

  return Message;
};

export default getMessageModel;
