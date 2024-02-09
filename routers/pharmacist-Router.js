import { Router } from "express";
import database from "../database.js";

const router = Router();
// Query builders -------------------------------------

const buildSetPrescriptionFields = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ", "),
    "SET "
  );

const table = "pharmacists";
const mutableFields = [
  "pharmacists.Pharmacist_ID",
  "pharmacists.Pharmacist_First_Name",
  "pharmacists.Pharmacist_Last_Name",
  "pharmacists.Pharmacist_E_Mail",
  "pharmacists.Pharmacist_Manager",
];
const idField = "pharmacists.Pharmacist_ID";
const fields = [idField, mutableFields];

const buildReadQuery = (id, variant) => {
  let sql = "";
  const resolvedTable = "pharmacists";
  const resolvedFields = [
    idField,
    ...mutableFields,
    "pharmacists.Pharmacist_ID",
    "pharmacists.Pharmacist_First_Name",
    "pharmacists.Pharmacist_Last_Name",
    "pharmacists.Pharmacist_E_Mail",
    "pharmacists.Pharmacist_Manager",
  ];

  switch (variant) {
    default:
      sql = `SELECT ${resolvedFields} FROM ${resolvedTable}`;
      if (id) sql += ` WHERE Pharmacist_ID=:ID`;
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

const getPharmacistController = async (req, res, variant) => {
  const id = req.params.id;

  // Validate request

  // Access Data
  const { isSuccess, result, message } = await read(id, variant);
  if (!isSuccess) return res.status(404).json({ message });

  // Response to status
  res.status(200).json(result);
};
// Endpoints -------------------------------------

router.get("/", (req, res) => getPharmacistController(req, res, null));
router.get("/:id", (req, res) => getPharmacistController(req, res, null));

export default router;
