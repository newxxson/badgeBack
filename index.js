sequelize.sync().then(() => {
  console.log("all models were created");
});
