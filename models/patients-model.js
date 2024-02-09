const model = {};

model.table = "patients";
model.mutableFields = [
  "patients.PatientID",
  "patients.PatientFirstName",
  "patients.PatientLastName",
  "patients.PatientAddress",
  "patients.PatientPhoneNumber",
  "patients.PatientEmailAddress",
];
model.idField = "PatientID";
const fields = [model.idField, ...model.mutableFields];

model.buildReadQuery = (id, variant) => {
  let sql = "";
  const resolvedTable = "patients";
  const resolvedFields = [
    model.idField,
    ...model.mutableFields,
    "patients.PatientID",
    "patients.PatientFirstName",
    "patients.PatientLastName",
    "patients.PatientAddress",
    "patients.PatientPhoneNumber",
    "patients.PatientEmailAddress",
  ];

  switch (variant) {
    default:
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable}`;
      if (id) sql += ` WHERE PatientID=:ID`;
  }
  return { sql: sql, data: { ID: id } };
};

export default model;
