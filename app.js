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

const read = async (selectSql) => {
  try {
    const [result] = await database.query(selectSql);
    return result.length === 0
      ? { isSuccess: false, result: null, message: "No record(s) found" }
      : {
          isSuccess: true,
          result: result,
          message: "Record(s) successfully recovered",
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

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
  // Validate request

  // Access Data
  const sql = buildPrescriptionsSelectSql(id, variant);
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(200).json(result);
};

const getDrugsController = async (req, res, variant) => {
  const id = req.params.id;

  // Validate request

  // Access Data
  const sql = buildDrugsSelectSQL(id, variant);
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(200).json(result);
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
