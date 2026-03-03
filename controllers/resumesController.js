// controllers/resumesController.js - Resume Management Controller
const { query } = require('../config/database');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Helper to get candidate profile ID from user ID
const getCandidateId = async (userId) => {
    const { rows } = await query(
        'SELECT id FROM candidate_profiles WHERE user_id = $1',
        [userId]
    );
    return rows[0]?.id;
};

// Get all resumes for the current candidate
exports.getResumes = async (req, res) => {
    try {
        const candidateId = await getCandidateId(req.user.id);
        
        if (!candidateId) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const { rows } = await query(
            `SELECT id, file_name, original_name, file_size, mime_type, is_primary, 
                    is_parsed, created_at, updated_at
             FROM resumes 
             WHERE candidate_id = $1 
             ORDER BY created_at DESC`,
            [candidateId]
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (err) {
        logger.error('Get resumes error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resumes'
        });
    }
};

// Get single resume by ID
exports.getResumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const candidateId = await getCandidateId(req.user.id);

        const { rows } = await query(
            `SELECT * FROM resumes 
             WHERE id = $1 AND candidate_id = $2`,
            [id, candidateId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        logger.error('Get resume by ID error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resume'
        });
    }
};

// Upload a new resume
exports.uploadResume = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const candidateId = await getCandidateId(req.user.id);
        
        if (!candidateId) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const { originalname, filename, size, mimetype } = req.file;
        
        // Check if this is the first resume - make it primary
        const existingResumes = await query(
            'SELECT COUNT(*) FROM resumes WHERE candidate_id = $1',
            [candidateId]
        );
        const isPrimary = parseInt(existingResumes.rows[0].count) === 0;

        // If not primary, check if user wants to set this as primary
        const isPrimaryParam = req.body.is_primary === 'true';

        const result = await query(
            `INSERT INTO resumes (
                candidate_id, file_name, original_name, file_path, 
                file_size, mime_type, is_primary
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                candidateId,
                filename,
                originalname,
                req.file.path,
                size,
                mimetype,
                isPrimary || isPrimaryParam
            ]
        );

        logger.info(`Resume uploaded: ${originalname} by user ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Upload resume error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to upload resume'
        });
    }
};

// Update resume (set as primary, etc.)
exports.updateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_primary } = req.body;
        const candidateId = await getCandidateId(req.user.id);

        // Check if resume exists and belongs to candidate
        const existing = await query(
            'SELECT id FROM resumes WHERE id = $1 AND candidate_id = $2',
            [id, candidateId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        // If setting as primary, first unset all other primaries
        if (is_primary) {
            await query(
                'UPDATE resumes SET is_primary = false WHERE candidate_id = $1',
                [candidateId]
            );
        }

        const { rows } = await query(
            `UPDATE resumes 
             SET is_primary = COALESCE($1, is_primary), updated_at = NOW()
             WHERE id = $2 
             RETURNING *`,
            [is_primary, id]
        );

        logger.info(`Resume updated: ${id}`);

        res.json({
            success: true,
            message: 'Resume updated successfully',
            data: rows[0]
        });
    } catch (err) {
        logger.error('Update resume error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update resume'
        });
    }
};

// Delete resume
exports.deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const candidateId = await getCandidateId(req.user.id);

        // Get resume details before deletion
        const existing = await query(
            'SELECT * FROM resumes WHERE id = $1 AND candidate_id = $2',
            [id, candidateId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        const resume = existing.rows[0];

        // Delete file from filesystem
        if (resume.file_path && fs.existsSync(resume.file_path)) {
            try {
                fs.unlinkSync(resume.file_path);
            } catch (fileErr) {
                logger.warn('Could not delete file:', fileErr.message);
            }
        }

        // Delete from database
        await query('DELETE FROM resumes WHERE id = $1', [id]);

        // If deleted resume was primary, set another as primary
        if (resume.is_primary) {
            await query(
                `UPDATE resumes SET is_primary = true 
                 WHERE candidate_id = $1 
                 ORDER BY created_at DESC LIMIT 1`,
                [candidateId]
            );
        }

        logger.info(`Resume deleted: ${id}`);

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (err) {
        logger.error('Delete resume error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete resume'
        });
    }
};

// Download resume
exports.downloadResume = async (req, res) => {
    try {
        const { id } = req.params;
        const candidateId = await getCandidateId(req.user.id);

        const { rows } = await query(
            'SELECT * FROM resumes WHERE id = $1 AND candidate_id = $2',
            [id, candidateId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        const resume = rows[0];

        if (!fs.existsSync(resume.file_path)) {
            return res.status(404).json({
                success: false,
                error: 'Resume file not found'
            });
        }

        res.download(resume.file_path, resume.original_name);
    } catch (err) {
        logger.error('Download resume error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to download resume'
        });
    }
};

