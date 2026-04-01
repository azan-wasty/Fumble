const { sql, poolPromise } = require('../config/db');

const getAllItems = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT si.*, s.sport_name FROM Sports_Items si
            LEFT JOIN Sports s ON si.sport_id = s.sport_id`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getItemById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT si.*, s.sport_name FROM Sports_Items si
                    LEFT JOIN Sports s ON si.sport_id = s.sport_id
                    WHERE si.item_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Item not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createItem = async (req, res) => {
    const { item_name, sport_id, total_qty, available_qty } = req.body;
    if (!item_name || total_qty == null) return res.status(400).json({ error: 'item_name and total_qty are required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('item_name', sql.VarChar, item_name)
            .input('sport_id', sql.Int, sport_id)
            .input('total_qty', sql.Int, total_qty)
            .input('available_qty', sql.Int, available_qty ?? total_qty)
            .query(`INSERT INTO Sports_Items (item_name, sport_id, total_qty, available_qty)
                    OUTPUT INSERTED.*
                    VALUES (@item_name, @sport_id, @total_qty, @available_qty)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateItem = async (req, res) => {
    const { total_qty, available_qty } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('total_qty', sql.Int, total_qty)
            .input('available_qty', sql.Int, available_qty)
            .query(`UPDATE Sports_Items SET
                        total_qty     = ISNULL(@total_qty, total_qty),
                        available_qty = ISNULL(@available_qty, available_qty)
                    OUTPUT INSERTED.*
                    WHERE item_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'Item not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Sports_Items OUTPUT DELETED.item_id WHERE item_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem };