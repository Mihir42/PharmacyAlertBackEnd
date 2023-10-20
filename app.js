// Imports ---------------------------------------
import express from "express";
import database from './database.js';

// Configure express app -------------------------

const app = new express();

// Configure middleware --------------------------

// Controllers -----------------------------------

const read = async (selectsql) => {
    try {
        const [result] = await database.query(selectsql);
        return (result.length === 0) 
            ? {isSuccess: false, result: null, message: 'No record(s) found'}
            : {isSuccess: true, result: result, message: 'Records(s) successfully recovered'}
    }
    
    catch(error) {
        return {isSuccess: false, result: null, message: `Failed to execute query: ${error.message}` };
    } 
}

const buildDrugsselectSql = (id, variant) => {
    let sql = '';
    let table = 'drugs';
    let fields = ['DrugID', 'DrugName', 'DrugDosage', 'DrugSymptoms'];

    switch(variant) {
        default:
            sql = `SELECT ${fields} from ${table}`;
            if(id) sql += ` WHERE DrugID=${id}`;
    }
    return sql;
}

const getDrugController = async (req, res, variant) => {
    const id = req.params.id;
    
    // Validate request
    // Access data 
    const sql = buildDrugsselectSql(id, variant);
    const { isSuccess, result, message } = await read(sql);
    if (!isSuccess) return res.status(404).json({message});

    // Response to request  
    res.status(200).json(result);
}

// Endpoints -------------------------------------

app.get('/api/drugs', (req, res) => getDrugController(req, res, null));
app.get('/api/drugs/:id', (req, res) => getDrugController(req, res, null));



// Start server ----------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server has started PORT ${PORT}`));