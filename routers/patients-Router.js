import { Router } from "express";
import Model from "../models/Model.js";
import modelConfig from "../models/patients-model.js";
import database from "../database.js";
import Accessor from "../accessor/Accessor.js";
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

export default router;
