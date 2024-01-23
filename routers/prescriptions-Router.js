import { Router } from "express";
import database from "../database.js";

const router = Router();
// Query builders -------------------------------------

const buildSetPrescriptionsField = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ", "),
    "SET "
  );

const buildPrescriptionsReadQuery = (id, variant) => {
  let sql = "";
  let table =
    " ((prescriptions INNER JOIN drugs ON drugs.Drugs_ID = prescriptions.PrescriptionsDrugID) INNER JOIN patients on patients.PatientID = prescriptions.Prescriptions_Patient_ID)";
  let fields = [
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
  ];

  switch (variant) {
    case "patients":
      sql = `SELECT ${fields} FROM ${table} WHERE PatientID=:ID`;
      break;
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += `WHERE Prescriptions_ID=:ID`;
  }

  return { sql: sql, data: { ID: id } };
};

const buildPrescriptionsCreateQuery = (record) => {
  let table = "prescriptions";
  let mutableFields = [
    "PrescriptionsStartDate",
    "PrescriptionsEndDate",
    "PrescriptionsDrugID",
    "Prescriptions_Dose",
    "Prescriptions_Frequency",
    "Prescriptions_Additional_Information",
    "Prescriptions_Patient_ID",
  ];
  const sql =
    `INSERT INTO ${table} ` + buildSetPrescriptionsField(mutableFields);
  return { sql, data: record };
};

const buildPrescriptionsUpdateQuery = (record, id) => {
  let table = "prescriptions";
  let mutableFields = [
    "PrescriptionsStartDate",
    "PrescriptionsEndDate",
    "PrescriptionsDrugID",
    "Prescriptions_Dose",
    "Prescriptions_Frequency",
    "Prescriptions_Additional_Information",
    "Prescriptions_Patient_ID",
  ];

  const sql =
    `UPDATE ${table} ` +
    buildSetPrescriptionsField(mutableFields) +
    ` WHERE Prescriptions_ID=:Prescriptions_ID`;
  return { sql, data: { ...record, Prescriptions_ID: id } };
};

// Data accessors -------------------------------------
const create = async (createQuery) => {
  try {
    const status = await database.query(createQuery.sql, createQuery.data);
    const readQuery = buildPrescriptionsReadQuery(status[0].insertId, null);
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
      message: `Failed to execute query : ${error.message}`,
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

const updatePrescriptions = async (updateQuery) => {
  try {
    const status = await database.query(updateQuery.sql, updateQuery.data);

    if (status[0].affectedRows === 0)
      return {
        isSuccess: false,
        result: null,
        message: `Failed to update record: no rows affected`,
      };

    const readQuery = buildPrescriptionsReadQuery(
      updateQuery.data.Prescriptions_ID,
      null
    );

    const { isSuccess, result, message } = await read(readQuery);

    return isSuccess
      ? {
          isSuccess: true,
          result: result,
          message: `Record successfully recovered`,
        }
      : {
          isSuccess: false,
          result: null,
          message: `Failed to execute query: ${message}`,
        };
  } catch (error) {
    return {
      isSuccess: false,
      result: null,
      message: `Failed to execute query: ${error.message}`,
    };
  }
};

// Controllers -------------------------------------
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

const postPrescriptionsController = async (req, res) => {
  const record = req.body;
  // Validate request

  // Access Data
  const query = buildPrescriptionsCreateQuery(record);
  const { isSuccess, result, message } = await create(query);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(201).json(result);
};

const putPrescriptionsController = async (req, res) => {
  const id = req.params.id;
  const record = req.body;

  // Validate request

  // Access Data

  const query = buildPrescriptionsUpdateQuery(record, id);
  const { isSuccess, result, message } = await updatePrescriptions(query);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(200).json(result);
};

// Endpoints -------------------------------------
router.get("/", (req, res) => getPrescriptionsController(req, res, null));
router.get("/:id", (req, res) => getPrescriptionsController(req, res, null));
router.get("/patients/:id", (req, res) =>
  getPrescriptionsController(req, res, "patients")
);
router.post("/", postPrescriptionsController);
router.put("/:id", putPrescriptionsController);

export default router;
