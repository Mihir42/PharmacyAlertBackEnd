import { Router } from "express";
import database from "../database.js";

const router = Router();
// Query builders -------------------------------------

const table = "prescriptions";
const mutableFields = [
  "PrescriptionsStartDate",
  "PrescriptionsEndDate",
  "PrescriptionsDrugID",
  "Prescriptions_Dose",
  "Prescriptions_Frequency",
  "Prescriptions_Additional_Information",
  "Prescriptions_Patient_ID",
];
const idField = "Prescriptions_ID";
const fields = [idField, ...mutableFields];

const buildSetPrescriptionsField = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ", "),
    "SET "
  );

const buildCreateQuery = (record) => {
  const sql =
    `INSERT INTO ${table} ` + buildSetPrescriptionsField(mutableFields);
  return { sql, data: record };
};

const buildReadQuery = (id, variant) => {
  let sql = "";
  const resolvedTable =
    " ((prescriptions INNER JOIN drugs ON drugs.Drugs_ID = prescriptions.PrescriptionsDrugID) INNER JOIN patients on patients.PatientID = prescriptions.Prescriptions_Patient_ID)";
  const resolvedFields = [
    idField,
    mutableFields,
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
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable} WHERE PatientID=:ID`;
      break;
    default:
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable}`;
      if (id) sql += `WHERE Prescriptions_ID=:ID`;
  }

  return { sql: sql, data: { ID: id } };
};

const buildUpdateQuery = (record, id) => {
  const sql =
    `UPDATE ${table} ` +
    buildSetPrescriptionsField(mutableFields) +
    ` WHERE ${idField}=:${idField}`;
  return { sql, data: { ...record, [idField]: id } };
};

const buildDeleteQuery = (id) => {
  const sql = `DELETE FROM ${table} WHERE ${idField}=:${idField}`;
  return { sql, data: { [idField]: id } };
};

// Data accessors -------------------------------------
const create = async (record) => {
  try {
    const { sql, data } = buildCreateQuery(record);
    const status = await database.query(sql, data);
    const { isSuccess, result, message } = await read(status[0].insertId, null);

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

const read = async (id, variant) => {
  try {
    const { sql, data } = buildReadQuery(id, variant);
    const [result] = await database.query(sql, data);
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

const update = async (record, id) => {
  try {
    const { sql, data } = buildUpdateQuery(record, id);
    const status = await database.query(sql, data);

    if (status[0].affectedRows === 0)
      return {
        isSuccess: false,
        result: null,
        message: `Failed to update record: no rows affected`,
      };

    const { isSuccess, result, message } = await read(id, null);

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

const _delete = async (id) => {
  try {
    const { sql, data } = buildDeleteQuery(id);
    const status = await database.query(sql, data);
    return status[0].affectedRows === 0
      ? {
          isSuccess: false,
          result: null,
          message: `Failed to delete record ${id}`,
        }
      : {
          isSuccess: true,
          result: null,
          message: `Record deleted successfully`,
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
  const { isSuccess, result, message } = await read(id, variant);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(200).json(result);
};

const postPrescriptionsController = async (req, res) => {
  const record = req.body;
  // Validate request

  // Access Data
  const { isSuccess, result, message } = await create(record);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(201).json(result);
};

const putPrescriptionsController = async (req, res) => {
  const id = req.params.id;
  const record = req.body;

  // Validate request

  // Access Data

  const { isSuccess, result, message } = await update(record, id);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(200).json(result);
};

const deletePrescriptionsController = async (req, res) => {
  // Validate request
  const id = req.params.id;

  // Access data
  const { isSuccess, result, message } = await _delete(id);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to request
  res.status(204).json(message);
};

// Endpoints -------------------------------------
router.get("/", (req, res) => getPrescriptionsController(req, res, null));
router.get("/:id", (req, res) => getPrescriptionsController(req, res, null));
router.get("/patients/:id", (req, res) =>
  getPrescriptionsController(req, res, "patients")
);
router.post("/", postPrescriptionsController);
router.put("/:id", putPrescriptionsController);
router.delete("/:id", deletePrescriptionsController);

export default router;
