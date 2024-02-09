import { Router } from "express";
import Model from "../models/Model.js";
import modelConfig from "../models/pharmacists-model.js";
import database from "../database.js";

// Model -------------------------------------

const model = new Model(modelConfig);

// Data accessors -------------------------------------

const read = async (id, varaint) => {
  try {
    const { sql, data } = model.buildReadQuery(id, varaint);
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

const router = Router();

router.get("/", (req, res) => getPharmacistController(req, res, null));
router.get("/:id", (req, res) => getPharmacistController(req, res, null));

export default router;
