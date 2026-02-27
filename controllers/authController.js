// controllers/authController.js - Authentication controller
const bcrypt = require('bcryptjs');
const { query, transaction } = require('../config/database');
const { generateTokens } = require('../middleware/auth');
const logger = require('../utils/logger');

// Register new user
exports.register = async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, companyName } = req.body;

        // Check if user already exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user and profile in transaction
        const result = await transaction(async (client) => {
            // Create user
            const userResult = await client.query(
                `INSERT INTO users (email, password_hash, role, is_active, email_verified)
                 VALUES ($1, $2, $3, true, false)
                 RETURNING id, email, role, created_at`,
                [email, passwordHash, role]
            );
            const user = userResult.rows[0];

            // Create profile based on role
            if (role === 'candidate') {
                await client.query(
                    `INSERT INTO candidate_profiles (user_id, first_name, last_name)
                     VALUES ($1, $2, $3)`,
                    [user.id, firstName, lastName]
                );
            } else if (role === 'company') {
                const slug = companyName.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                
                await client.query(
                    `INSERT INTO company_profiles (user_id, company_name, company_slug, description)
                     VALUES ($1, $2, $3, $4)`,
                    [user.id, companyName, slug, 'Company description pending']
                );
            }

            return user;
        });

        // Generate tokens
        const tokens = generateTokens(result.id, result.role);

        logger.info(`New user registered: ${email} (${role})`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: result.id,
                    email: result.email,
                    role: result.role,
                    createdAt: result.created_at
                },
                ...tokens
            }
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const { rows } = await query(
            `SELECT id, email, password_hash, role, is_active, email_verified 
             FROM users WHERE email = $1`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                error: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate tokens
        const tokens = generateTokens(user.id, user.role);

        // Store refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
            [user.id, tokens.refreshToken, expiresAt]
        );

        logger.info(`User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    emailVerified: user.email_verified
                },
                ...tokens
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }

        // Verify refresh token exists and is not expired
        const { rows } = await query(
            `SELECT rt.user_id, u.role, rt.expires_at
             FROM refresh_tokens rt
             JOIN users u ON rt.user_id = u.id
             WHERE rt.token = $1 AND rt.expires_at > NOW() AND u.is_active = true`,
            [refreshToken]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token'
            });
        }

        const { user_id, role } = rows[0];

        // Generate new tokens
        const tokens = generateTokens(user_id, role);

        // Update refresh token in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await query(
            `UPDATE refresh_tokens 
             SET token = $1, expires_at = $2
             WHERE token = $3`,
            [tokens.refreshToken, expiresAt, refreshToken]
        );

        res.json({
            success: true,
            data: tokens
        });
    } catch (error) {
        logger.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Token refresh failed'
        });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Remove refresh token from database
        await query(
            'DELETE FROM refresh_tokens WHERE token = $1',
            [refreshToken]
        );

        logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const { id, role } = req.user;

        let profileQuery;
        let profileData;

        if (role === 'candidate') {
            profileQuery = `
                SELECT u.id, u.email, u.role, u.created_at,
                       cp.first_name, cp.last_name, cp.phone, cp.location,
                       cp.education, cp.experience, cp.skills, cp.bio,
                       cp.linkedin_url, cp.portfolio_url, cp.resume_url,
                       cp.expected_salary_min, cp.expected_salary_max
                FROM users u
                LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
                WHERE u.id = $1
            `;
        } else if (role === 'company') {
            profileQuery = `
                SELECT u.id, u.email, u.role, u.created_at,
                       comp.company_name, comp.company_slug, comp.description,
                       comp.website, comp.logo_url, comp.industry,
                       comp.company_size, comp.location, comp.phone, comp.verified
                FROM users u
                LEFT JOIN company_profiles comp ON u.id = comp.user_id
                WHERE u.id = $1
            `;
        } else {
            // Admin
            profileQuery = `
                SELECT id, email, role, created_at
                FROM users
                WHERE id = $1
            `;
        }

        const { rows } = await query(profileQuery, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { id, role } = req.user;
        const updates = req.body;

        if (role === 'candidate') {
            const allowedFields = [
                'firstName', 'lastName', 'phone', 'location',
                'education', 'experience', 'skills', 'bio',
                'linkedinUrl', 'portfolioUrl', 'resumeUrl',
                'expectedSalaryMin', 'expectedSalaryMax'
            ];

            const setClause = [];
            const values = [];
            let paramIndex = 1;

            for (const [key, value] of Object.entries(updates)) {
                const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                if (allowedFields.includes(key)) {
                    setClause.push(`${dbField} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }

            if (setClause.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid fields to update'
                });
            }

            values.push(id);

            await query(
                `UPDATE candidate_profiles 
                 SET ${setClause.join(', ')}, updated_at = NOW()
                 WHERE user_id = $${paramIndex}`,
                values
            );
        } else if (role === 'company') {
            const allowedFields = [
                'companyName', 'description', 'website', 'logoUrl',
                'industry', 'companySize', 'location', 'phone'
            ];

            const setClause = [];
            const values = [];
            let paramIndex = 1;

            for (const [key, value] of Object.entries(updates)) {
                const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                if (allowedFields.includes(key)) {
                    setClause.push(`${dbField} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            }

            if (setClause.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid fields to update'
                });
            }

            values.push(id);

            await query(
                `UPDATE company_profiles 
                 SET ${setClause.join(', ')}, updated_at = NOW()
                 WHERE user_id = $${paramIndex}`,
                values
            );
        }

        logger.info(`Profile updated for user: ${req.user.email}`);

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;

        // Get current password hash
        const { rows } = await query(
            'SELECT password_hash FROM users WHERE id = $1',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newHash = await bcrypt.hash(newPassword, 12);

        // Update password
        await query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [newHash, id]
        );

        // Invalidate all refresh tokens
        await query(
            'DELETE FROM refresh_tokens WHERE user_id = $1',
            [id]
        );

        logger.info(`Password changed for user: ${req.user.email}`);

        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });
    } catch (error) {
        logger.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password'
        });
    }
};
