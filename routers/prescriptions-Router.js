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

const buildPrescriptionsDeleteQuery = (id) => {
  let table = "prescriptions";
  const sql = `DELETE FROM ${table} WHERE Prescriptions_ID=:Prescriptions_ID`;
  return { sql, data: { Prescriptions_ID: id } };
};

// Data accessors -------------------------------------
const create = async (record) => {
  try {
    const { sql, data } = buildPrescriptionsCreateQuery(record);
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
    const { sql, data } = buildPrescriptionsReadQuery(id, variant);
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
    const { sql, data } = buildPrescriptionsUpdateQuery(record, id);
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
    const { sql, data } = buildPrescriptionsDeleteQuery(id);
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
