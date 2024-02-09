import { Router } from "express";
import Model from "../models/Model.js";
import modelConfig from "../models/patients-model.js";
import database from "../database.js";

// Model -------------------------------------

const model = new Model(modelConfig);

// Data accessors -------------------------------------

const read = async (id, variant) => {
  try {
    const { sql, data } = model.buildReadQuery(id, variant);
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

const router = Router();
router.get("/", (req, res) => getPatientsController(req, res, null));
router.get("/:id", (req, res) => getPatientsController(req, res, null));

export default router;
