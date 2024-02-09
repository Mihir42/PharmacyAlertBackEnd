const model = {};

model.table = "drugs";
model.mutableFields = ["Drugs_Name", "Drugs_Route", "Drugs_Side_Affects"];
model.idField = "Drugs_ID";
// model.fields = [model.idField, ...model.mutableFields];

model.buildReadQuery = (id, variant) => {
  let sql = "";
  const resolvedTable = "drugs";
  const resolvedFields = [
    model.idField,
    ...model.mutableFields,
    "drugs.Drugs_Name",
    "drugs.Drugs_Route",
    "drugs.Drugs_Side_Affects",
  ];

  switch (variant) {
    default:
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable}`;
      if (id) sql += ` WHERE Drugs_ID=:ID`;
  }
  return { sql: sql, data: { ID: id } };
};

export default model;
