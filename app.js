// Imports ---------------------------------------
import express from "express";
import database from "./database.js";
import cors from "cors";
import drugRouter from "./routers/drugs-Router.js";
import prescriptionRouter from "./routers/prescriptions-Router.js";
import patientsRouter from "./routers/patients-Router.js";
import pharmacistRouter from "./routers/pharmacist-Router.js";
import gpRouter from "./routers/gp-Router.js";
import diagnosisRouter from "./routers/diagnosis-Router.js";

// Configure express app -------------------------

const app = new express();

// Configure middleware --------------------------
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Drugs

// Controllers -----------------------------------

// SQL prepared statements builders
// Prescriptions

// Drugs

// Patients

// Endpoints -------------------------------------

app.use("/api/drugs", drugRouter);
app.use("/api/prescriptions", prescriptionRouter);
app.use("/api/prescriptions/patients", prescriptionRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/pharmacists", pharmacistRouter);
app.use("/api/gps", gpRouter);
app.use("/api/diagnosis", diagnosisRouter);

// Prescriptions

// Start server ----------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server has started PORT ${PORT}`));
