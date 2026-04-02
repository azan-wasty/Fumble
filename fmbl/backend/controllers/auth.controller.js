const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fumble_secret_key', {
        expiresIn: '30d',
    });
};

// POST /api/auth/register
const registerUser = async (req, res) => {
    const { roll_number, full_name, email, phone, role, password } = req.body;

    if (!roll_number || !full_name || !email || !password) {
        return res.status(400).json({ error: 'Please provide all required fields (roll_number, full_name, email, password)' });
    }

    try {
        const pool = await poolPromise;

        // Check if user exists
        const userExists = await pool.request()
            .input('roll_number', sql.VarChar, roll_number)
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE roll_number = @roll_number OR email = @email');

        if (userExists.recordset.length > 0) {
            return res.status(400).json({ error: 'User with this roll number or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const result = await pool.request()
            .input('roll_number', sql.VarChar, roll_number)
            .input('full_name', sql.VarChar, full_name)
            .input('email', sql.VarChar, email)
            .input('phone', sql.VarChar, phone || null)
            .input('role', sql.VarChar, role || 'student')
            .input('password_hash', sql.VarChar, hashedPassword)
            .query(`INSERT INTO Users (roll_number, full_name, email, phone, role, password_hash)
                    OUTPUT INSERTED.user_id, INSERTED.roll_number, INSERTED.full_name, INSERTED.email, INSERTED.role
                    VALUES (@roll_number, @full_name, @email, @phone, @role, @password_hash)`);

        const newUser = result.recordset[0];

        res.status(201).json({
            user_id: newUser.user_id,
            roll_number: newUser.roll_number,
            full_name: newUser.full_name,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(newUser.user_id, newUser.role)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
    const { roll_number, password } = req.body;

    if (!roll_number || !password) {
        return res.status(400).json({ error: 'Please provide roll_number and password' });
    }

    try {
        const pool = await poolPromise;

        // Find user
        const result = await pool.request()
            .input('roll_number', sql.VarChar, roll_number)
            .query('SELECT * FROM Users WHERE roll_number = @roll_number');

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.recordset[0];

        // Check if the user has a password_hash set up (in case of old data without passwords, we might need a reset mechanism)
        if (!user.password_hash) {
            return res.status(401).json({ error: 'Please contact admin to set up your password.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            res.json({
                user_id: user.user_id,
                roll_number: user.roll_number,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                token: generateToken(user.user_id, user.role)
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};
