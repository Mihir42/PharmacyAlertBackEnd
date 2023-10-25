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

const read = async (selectsql) => {
  try {
    const [result] = await database.query(selectsql);
    return result.length === 0
      ? { isSuccess: false, result: null, message: "No record(s) found" }
      : {
          isSuccess: true,
          result: result,
          message: "Records(s) successfully recovered",
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const buildDrugsselectSql = (id, variant) => {
  let sql = "";
  let table = "drugs";
  let fields = ["DrugID", "DrugName", "DrugDosage", "DrugSymptoms"];

  switch (variant) {
    default:
      sql = `SELECT ${fields} from ${table}`;
      if (id) sql += ` WHERE DrugID=${id}`;
  }
  return sql;
};

const buildPatientPrescription = (id, variant) => {
  let sql = "";
  let table1 = "drugs";
  let table2 = "prescriptions";
  let table3 = "prescribeddrugs";
  let table4 = "patients";
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
    default:
      sql = `SELECT ${fields} FROM ${table1}
            INNER JOIN ${table2}
            ON drugs.DrugID = prescriptions.PrescriptionsDrugID
            INNER JOIN ${table3}
            ON prescriptions.PrescriptionPrescribedDrugID = prescribeddrugs.PrescribeddrugsID
            INNER JOIN ${table4}
            ON prescribeddrugs.PrescribeddrugsPatientID = patients.PatientID AND patients.PatientID = ${id};`;
  }
  return sql;
};

const getDrugController = async (req, res, variant) => {
  const id = req.params.id;

  // Validate request
  // Access data
  const sql = buildPatientPrescription(id, variant);
  const { isSuccess, result, message } = await read(sql);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(200).json(result);
};

// Endpoints -------------------------------------

app.get("/api/drugs", (req, res) => getDrugController(req, res, null));
app.get("/api/drugs/:id", (req, res) => getDrugController(req, res, null));

// Start server ----------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server has started PORT ${PORT}`));
