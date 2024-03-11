const model = {};

model.table = "diagnosis";
model.mutableFields = [
  "Diagnosis_ID",
  "Diagnosis_Title",
  "Diagnosis_Description",
  "Diagnosis_Patient",
  "Diagnosis_GP",
];

model.idField = "Diagnosis_ID";
const fields = [model.idField, ...model.mutableFields];

model.buildReadQuery = (id, varient) => {
  let sql = "";
  const resolvedTable =
    " ((diagnosis INNER JOIN patients ON patients.PatientID = diagnosis.Diagnosis_Patient) INNER JOIN generalpractitioner on generalpractitioner.GP_ID = diagnosis.Diagnosis_GP)";
  const resolvedFields = [
    model.idField,
    ...model.mutableFields,
    "diagnosis.Diagnosis_ID",
    "diagnosis.Diagnosis_Title",
    "diagnosis.Diagnosis_Description",
    "diagnosis.Diagnosis_Patient",
    "patients.PatientFirstName",
    "patients.PatientLastName",
    "diagnosis.Diagnosis_GP",
    "generalpractitioner.GP_First_Name",
    "generalpractitioner.GP_Last_Name",
    "generalpractitioner.GP_E_Mail_Address",
  ];

  switch (varient) {
    default:
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable}`;
      if (id) sql += ` WHERE DIAGNOSIS_ID=:ID`;
  }
  return { sql: sql, data: { ID: id } };
};

export default model;
