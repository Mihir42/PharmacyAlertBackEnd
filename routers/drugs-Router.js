import { Router } from "express";
import database from "../database.js";

const router = Router();
// Query builders -------------------------------------

const buildSetDrugFields = (fields) =>
  fields.reduce(
    (setSQL, field, index) =>
      setSQL + `${field}=:${field}` + (index === fields.length - 1 ? "" : ", "),
    "SET "
  );

const buildDrugsReadQuery = (id, variant) => {
  let sql = "";
  let table = "drugs";
  let fields = [
    "drugs.Drugs_ID",
    "drugs.Drugs_Name",
    "drugs.Drugs_Route",
    "drugs.Drugs_Side_Affects",
  ];

  switch (variant) {
    default:
      sql = `SELECT ${fields} FROM ${table}`;
      if (id) sql += ` WHERE Drugs_ID=:ID`;
  }
  return { sql: sql, data: { ID: id } };
};

const buildDrugsCreateQuery = (record) => {
  let table = "drugs";
  let mutableFields = ["Drugs_Name", "Drugs_Route", "Drugs_Side_Affects"];

  const sql = `INSERT INTO ${table} ` + buildSetDrugFields(mutableFields);
  return { sql, data: record };
};

const buildDrugsUpdateQuery = (record, id) => {
  let table = "drugs";
  let mutableFields = ["Drugs_Name", "Drugs_Route", "Drugs_Side_Affects"];

  const sql =
    `UPDATE ${table} ` +
    buildSetDrugFields(mutableFields) +
    ` WHERE Drugs_ID=:Drugs_ID`;
  return { sql, data: { ...record, DrugID: id } };
};

const buildDrugsDeleteQuery = (id) => {
  let table = "drugs";
  const sql = `DELETE FROM ${table} WHERE Drugs_ID=:Drugs_ID`;
  return { sql, data: { DrugID: id } };
};

// Data accessors -------------------------------------

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

// Controllers -------------------------------------

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
  const query = buildDrugsCreateQuery(record);
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

// Endpoints -------------------------------------

router.get("/", (req, res) => getDrugsController(req, res, null));
router.get("/:id", (req, res) => getDrugsController(req, res, null));
router.post("/", postDrugsController);
router.put("/:id", putDrugsController);
router.delete("/:id", deleteDrugsController);

export default router;