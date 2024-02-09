import { Router } from "express";
import database from "../database.js";

const router = Router();
// Query builders -------------------------------------

const table = "patients";
const mutableFields = [
  "patients.PatientID",
  "patients.PatientFirstName",
  "patients.PatientLastName",
  "patients.PatientAddress",
  "patients.PatientPhoneNumber",
  "patients.PatientEmailAddress",
];
const idField = "PatientID";
const fields = [idField, ...mutableFields];

const buildReadQuery = (id, variant) => {
  let sql = "";
  const resolvedTable = "patients";
  const resolvedFields = [
    idField,
    ...mutableFields,
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

// Data accessors -------------------------------------
const read = async (id, varaint) => {
  try {
    const { sql, data } = buildReadQuery(id, varaint);
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

// Controllers -------------------------------------
const getPatientsController = async (req, res, varaint) => {
  const id = req.params.id;

  // validate request
  // Access data
  const { isSuccess, result, message } = await read(id, varaint);
  if (!isSuccess) return res.status(404).json({ message });

  // Reponse to request
  res.status(200).json(result);
};

// Endpoints -------------------------------------
router.get("/", (req, res) => getPatientsController(req, res, null));
router.get("/:id", (req, res) => getPatientsController(req, res, null));

export default router;
