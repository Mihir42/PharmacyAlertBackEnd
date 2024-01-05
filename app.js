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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Controllers -----------------------------------

const create = async (createQuery) => {
  try {
    const status = await database.query(createQuery.sql, createQuery.data);
    const readQuery = buildDrugsReadQuery(status[0].insertId, null);
    const { isSuccess, result, message } = await read(readQuery);

    return isSuccess
      ? {
          isSuccess: true,
          result: result,
          message: "Record successfully recovered",
        }
      : {
          isSuccess: false,
          result: null,
          message: `Failed to recover the inserted record ${message}`,
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const read = async (query) => {
  try {
    const [result] = await database.query(query.sql, query.data);
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

const updateDrugs = async (updateQuery) => {
  try {
    const status = await database.query(updateQuery.sql, updateQuery.data);

    if (status[0].affectedRows === 0)
      return {
        isSuccess: false,
        result: null,
        message: `Failed to update record: no rows affected `,
      };

    const readQuery = buildDrugsReadQuery(updateQuery.data.DrugID, null);

    const { isSuccess, result, message } = await read(readQuery);

    return isSuccess
      ? {
          isSuccess: true,
          result: result,
          message: "Record successfully recovered",
        }
      : {
          isSuccess: false,
          result: null,
          message: `Failed to recover the updated record ${message}`,
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

const deleteDrugs = async (deleteQuery) => {
  try {
    const status = await database.query(deleteQuery.sql, deleteQuery.data);
    return status[0].affectedRows === 0
      ? {
          isSuccess: false,
          result: null,
          message: `Failed to delete record ${id}`,
        }
      : {
          isSuccess: true,
          result: null,
          message: "Record successfully deleted",
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

// SQL prepared statements builders
// Prescriptions

const buildPrescriptionsReadQuery = (id, variant) => {
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
      sql = `SELECT ${fields} FROM ${table} WHERE DrugID=:ID`;
      break;
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += `WHERE PatientID=:ID`;
  }

  return { sql: sql, data: { ID: id } };
};

// Drugs

const buildDrugsReadQuery = (id, variant) => {
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
      if (id) sql += ` WHERE DrugID=:ID`;
  }
  return { sql: sql, data: { ID: id } };
};

const buildDrugsCreateSQL = (record) => {
  let table = "drugs";
  let mutableFields = ["DrugName", "DrugDosage", "DrugSymptoms"];

  const sql = `INSERT INTO ${table} ` + buildSetDrugFields(mutableFields);
  return { sql, data: record };
};

const buildDrugsUpdateQuery = (record, id) => {
  let table = "drugs";
  let mutableFields = ["DrugName", "DrugDosage", "DrugSymptoms"];

  const sql =
    `UPDATE ${table} ` +
    buildSetDrugFields(mutableFields) +
    ` WHERE DrugID=:DrugID`;
  return { sql, data: { ...record, DrugID: id } };
};

const buildDrugsDeleteQuery = (id) => {
  let table = "drugs";
  const sql = `DELETE FROM ${table} WHERE DrugID=:DrugID`;
  return { sql, data: { DrugID: id } };
};

const buildSetDrugFields = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ", "),
    "SET "
  );

// Patients

const buildPatientsReadQuery = (id, variant) => {
  let sql = "";
  let table = "patients";
  let fields = [
    "patients.PatientID",
    "patients.PatientFirstName",
    "patients.PatientLastName",
    "patients.PatientAddress",
    "patients.PatientPhoneNumber",
    "patients.PatientEmailAddress",
  ];

  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE PatientID=:ID`;
  }
  return { sql: sql, data: { ID: id } };
};

const getPrescriptionsController = async (req, res, variant) => {
  const id = req.params.id;
  // Validate request

  // Access Data
  const query = buildPrescriptionsReadQuery(id, variant);
  const { isSuccess, result, message } = await read(query);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(200).json(result);
};

const getDrugsController = async (req, res, variant) => {
  const id = req.params.id;

  // Validate request

  // Access Data
  const query = buildDrugsReadQuery(id, variant);
  const { isSuccess, result, message } = await read(query);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(200).json(result);
};

const postDrugsController = async (req, res) => {
  const record = req.body;
  // Validate request

  // Access Data
  const query = buildDrugsCreateSQL(record);
  const { isSuccess, result, message } = await create(query);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(201).json(result);
};

const putDrugsController = async (req, res) => {
  const id = req.params.id;
  const record = req.body;

  // Validate request

  // Access Data
  const query = buildDrugsUpdateQuery(record, id);
  const { isSuccess, result, message } = await updateDrugs(query);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(200).json(result);
};

const deleteDrugsController = async (req, res) => {
  // Validate request
  const id = req.params.id;

  // Access Data
  const query = buildDrugsDeleteQuery(id);
  const { isSuccess, result, message } = await deleteDrugs(query);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(204).json(message);
};

const getPatientsController = async (req, res, varaint) => {
  const id = req.params.id;

  // validate request
  // Access data
  const query = buildPatientsReadQuery(id, varaint);
  const { isSuccess, result, message } = await read(query);
  if (!isSuccess) return res.status(404).json({ message });

  // Reponse to request
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

app.post("/api/drugs", postDrugsController);

app.put("/api/drugs/:id", putDrugsController);

app.delete("/api/drugs/:id", deleteDrugsController);

// Patients
app.get("/api/patients", (req, res) => getPatientsController(req, res, null));
app.get("/api/patients/:id", (req, res) =>
  getPatientsController(req, res, null)
);

// Start server ----------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server has started PORT ${PORT}`));
