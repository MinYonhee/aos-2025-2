const getTarefaModel = (sequelize, { DataTypes }) => {
  const Tarefa = sequelize.define("Tarefa", {
    objectId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    
    descricao: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    
    concluida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, 
  {
    tableName: 'tarefas',
  });

  /*
  Tarefa.associate = (models) => {
  };
  */

  return Tarefa;
};

export default getTarefaModel;