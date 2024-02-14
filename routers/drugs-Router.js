import { Router } from "express";
import Model from "../models/Model.js";
import modelConfig from "../models/drugs-model.js";
import Accessor from "../accessor/Accessor.js";
import database from "../database.js";
import Controller from "../controller/Controller.js";

// Model -------------------------------------

const model = new Model(modelConfig);

// Data accessors -------------------------------------

const accessor = new Accessor(model, database);

// Controllers -------------------------------------

const controller = new Controller(accessor);

// Endpoints -------------------------------------

const router = Router();

router.get("/", (req, res) => controller.get(req, res, null));
router.get("/:id", (req, res) => controller.get(req, res, null));
router.post("/", controller.post);
router.put("/:id", controller.put);
router.delete("/:id", controller.delete);

export default router;
