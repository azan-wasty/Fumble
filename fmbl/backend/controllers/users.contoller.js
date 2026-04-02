const { sql, poolPromise } = require('../config/db');

// Columns to select — never expose password_hash
const SAFE_COLS = 'user_id, roll_number, full_name, email, phone, role, created_at';

// GET /api/users
const getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`SELECT ${SAFE_COLS} FROM Users`);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT ${SAFE_COLS} FROM Users WHERE user_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'User not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/users  (admin only — no password, use /auth/register for self-registration)
const createUser = async (req, res) => {
    const { roll_number, full_name, email, phone, role } = req.body;
    if (!full_name) return res.status(400).json({ error: 'full_name is required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('roll_number', sql.VarChar, roll_number)
            .input('full_name', sql.VarChar, full_name)
            .input('email', sql.VarChar, email)
            .input('phone', sql.VarChar, phone)
            .input('role', sql.VarChar, role || 'student')
            .query(`INSERT INTO Users (roll_number, full_name, email, phone, role)
                    OUTPUT INSERTED.user_id, INSERTED.roll_number, INSERTED.full_name,
                           INSERTED.email, INSERTED.phone, INSERTED.role
                    VALUES (@roll_number, @full_name, @email, @phone, @role)`);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
    const { full_name, email, phone, role } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('full_name', sql.VarChar, full_name)
            .input('email', sql.VarChar, email)
            .input('phone', sql.VarChar, phone)
            .input('role', sql.VarChar, role)
            .query(`UPDATE Users SET
                        full_name = ISNULL(@full_name, full_name),
                        email     = ISNULL(@email, email),
                        phone     = ISNULL(@phone, phone),
                        role      = ISNULL(@role, role)
                    OUTPUT INSERTED.user_id, INSERTED.roll_number, INSERTED.full_name,
                           INSERTED.email, INSERTED.phone, INSERTED.role
                    WHERE user_id = @id`);
        if (!result.recordset.length) return res.status(404).json({ error: 'User not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Users OUTPUT DELETED.user_id WHERE user_id = @id');
        if (!result.recordset.length) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted', user_id: result.recordset[0].user_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };