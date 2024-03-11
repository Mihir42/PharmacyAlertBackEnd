const model = {};

model.table = "prescriptions";
model.mutableFields = [
  "PrescriptionsStartDate",
  "PrescriptionsEndDate",
  "PrescriptionsDrugID",
  "Prescriptions_Dose",
  "Prescriptions_Frequency",
  "Prescriptions_Additional_Information",
  "Prescriptions_Patient_ID",
];
model.idField = "Prescriptions_ID";

model.buildReadQuery = (id, variant) => {
  let sql = "";
  const resolvedTable =
    " ((prescriptions INNER JOIN drugs ON drugs.Drugs_ID = prescriptions.PrescriptionsDrugID) INNER JOIN patients on patients.PatientID = prescriptions.Prescriptions_Patient_ID)";
  const resolvedFields = [
    model.idField,
    model.mutableFields,
    "prescriptions.Prescriptions_ID",
    "drugs.Drugs_ID",
    "drugs.Drugs_Name",
    "prescriptions.Prescriptions_Dose",
    "drugs.Drugs_Route",
    "prescriptions.Prescriptions_Frequency",
    "prescriptions.Prescriptions_Additional_Information",
    "prescriptions.PrescriptionsStartDate",
    "prescriptions.PrescriptionsEndDate",
    "patients.PatientID",
    "patients.PatientFirstName",
    "patients.PatientLastName",
  ];

  switch (variant) {
    case "patients":
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable} WHERE PatientID=:ID`;
      break;
    default:
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable}`;
      if (id) sql += `WHERE Prescriptions_ID=:ID`;
  }

  return { sql: sql, data: { ID: id } };
};

export default model;
