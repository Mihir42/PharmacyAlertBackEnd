const model = {};

model.table = "generalpractitioner";
model.mutableFields = [
  "generalpractitioner.GP_ID",
  "generalpractitioner.GP_First_Name",
  "GP_Last_Name",
  "GP_E_Mail_Address",
  "GP_Telephone_Number",
];

model.idField = "GP_ID";
const fields = [model.idField, ...model.mutableFields];

model.buildReadQuery = (id, varient) => {
  let sql = "";
  const resolvedTable = "generalpractitioner";
  const resolvedFields = [
    model.idField,
    ...model.mutableFields,
    "generalpractitioner.GP_ID",
    "generalpractitioner.GP_First_Name",
    "GP_Last_Name",
    "GP_E_Mail_Address",
    "GP_Telephone_Number",
  ];

  switch (varient) {
    default:
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable}`;
      if (id) sql += ` WHERE GP_ID=:ID`;
  }
  return { sql: sql, data: { ID: id } };
};

export default model;
