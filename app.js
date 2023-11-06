// Imports ---------------------------------------
import express from "express";
import database from "./database.js";
import cors from "cors";

// Configure express app -------------------------

const app = new express();

// Configure middleware --------------------------
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});

app.use(cors({ origin: "*" }));
// Controllers -----------------------------------

const buildPrescriptionsSelectSql = (id, variant) => {
  let sql = "";
  let table =
    "(((drugs INNER JOIN prescriptions ON drugs.DrugID = prescriptions.PrescriptionsDrugID) INNER JOIN prescribeddrugs on prescriptions.PrescriptionPrescribedDrugID = prescribeddrugs.PrescribeddrugsID ) INNER JOIN patients ON prescribeddrugs.PrescribeddrugsPatientID = patients.PatientID) ";
  let fields = [
    "drugs.DrugID",
    "drugs.DrugName",
    "drugs.DrugDosage",
    "drugs.DrugSymptoms",
    "patients.PatientID",
    "patients.PatientFirstName",
    "patients.PatientLastName",
  ];

  switch (variant) {
    case "drug":
      sql = `SELECT ${fields} FROM ${table} WHERE DrugID=${id}`;
      break;
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += `WHERE PatientID=${id}`;
  }

  return sql;
};

const buildDrugsSelectSQL = (id, variant) => {
  let sql = "";
  let table = "drugs";
  let fields = [
    "drugs.DrugID",
    "drugs.DrugName",
    "drugs.DrugDosage",
    "drugs.DrugSymptoms",
  ];

  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE DrugID=${id}`;
  }
  console.log(id);
  return sql;
};

const getPrescriptionsController = async (req, res, variant) => {
  const id = req.params.id;
  // Build SQL
  const sql = buildPrescriptionsSelectSql(id, variant);
  // Execute Query
  let isSuccess = false;
  let message = "";
  let result = null;
  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found";
    else {
      isSuccess = true;
      message = "Record(s) successfully recovered";
    }
  } catch (error) {
    message = `Failed to execute query: ${error.message}`;
  }
  //Responses
  isSuccess ? res.status(200).json(result) : res.status(400).json({ message });
};

const getDrugsController = async (req, res, variant) => {
  const id = req.params.id;
  //Build SQL
  const sql = buildDrugsSelectSQL(id, variant);
  // Execute Query
  let isSuccess = false;
  let message = "";
  let result = null;
  try {
    [result] = await database.query(sql);
    if (result.length === 0) message = "No record(s) found";
    else {
      isSuccess = true;
      message = "Record(s) successfully recovered";
    }
  } catch (error) {
    message = `Failed to execute query: ${error.message}`;
  }
  // Responses
  isSuccess ? res.status(200).json(result) : res.status(400).json({ message });
};

// Endpoints -------------------------------------

// Prescriptions
app.get("/api/prescriptions", (req, res) =>
  getPrescriptionsController(req, res, null)
);
app.get("/api/prescriptions/:id", (req, res) =>
  getPrescriptionsController(req, res, null)
);
app.get("/api/prescriptions/drug/:id", (req, res) =>
  getPrescriptionsController(req, res, "drug")
);

// Drugs
app.get("/api/drugs", (req, res) => getDrugsController(req, res, null));
app.get("/api/drugs/:id", (req, res) => getDrugsController(req, res, null));

// Start server ----------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server has started PORT ${PORT}`));
