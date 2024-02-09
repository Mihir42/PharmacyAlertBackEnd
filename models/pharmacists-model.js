const model = {};

model.table = "pharmacists";
model.mutableFields = [
  "pharmacists.Pharmacist_ID",
  "pharmacists.Pharmacist_First_Name",
  "pharmacists.Pharmacist_Last_Name",
  "pharmacists.Pharmacist_E_Mail",
  "pharmacists.Pharmacist_Manager",
];
model.idField = "Pharmacist_ID";

model.buildReadQuery = (id, variant) => {
  let sql = "";
  const resolvedTable = "pharmacists";
  const resolvedFields = [
    model.idField,
    ...model.mutableFields,
    "pharmacists.Pharmacist_ID",
    "pharmacists.Pharmacist_First_Name",
    "pharmacists.Pharmacist_Last_Name",
    "pharmacists.Pharmacist_E_Mail",
    "pharmacists.Pharmacist_Manager",
  ];

  switch (variant) {
    default:
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable}`;
      if (id) sql += ` WHERE Pharmacist_ID=:ID`;
  }
  return { sql: sql, data: { ID: id } };
};

export default model;
