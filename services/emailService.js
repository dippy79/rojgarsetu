// services/emailService.js - Email notification service
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Email templates
const templates = {
    welcome: {
        subject: 'Welcome to RojgarSetu!',
        body: `
            <h1>Welcome to RojgarSetu!</h1>
            <p>Dear {{name}},</p>
            <p>Thank you for joining RojgarSetu - your gateway to government jobs and professional courses.</p>
            <p>Get started by:</p>
            <ul>
                <li>Completing your profile</li>
                <li>Searching for jobs that match your skills</li>
                <li>Exploring relevant courses</li>
            </ul>
            <p>Best regards,<br>The RojgarSetu Team</p>
        `
    },
    
    applicationReceived: {
        subject: 'Application Received - {{jobTitle}}',
        body: `
            <h1>Application Received</h1>
            <p>Dear {{candidateName}},</p>
            <p>Your application for <strong>{{jobTitle}}</strong> at {{companyName}} has been received.</p>
            <p>We will review your application and get back to you soon.</p>
            <p>Best regards,<br>The RojgarSetu Team</p>
        `
    },
    
    applicationStatusUpdate: {
        subject: 'Application Status Update - {{jobTitle}}',
        body: `
            <h1>Application Status Update</h1>
            <p>Dear {{candidateName}},</p>
            <p>Your application status for <strong>{{jobTitle}}</strong> has been updated to: <strong>{{status}}</strong>.</p>
            {{#if notes}}
            <p>Note: {{notes}}</p>
            {{/if}}
            <p>Best regards,<br>The RojgarSetu Team</p>
        `
    },
    
    newApplication: {
        subject: 'New Application for {{jobTitle}}',
        body: `
            <h1>New Application Received</h1>
            <p>Dear {{companyName}},</p>
            <p>You have received a new application for <strong>{{jobTitle}}</strong>.</p>
            <p>Candidate: {{candidateName}}</p>
            <p>Login to your company dashboard to review the application.</p>
            <p>Best regards,<br>The RojgarSetu Team</p>
        `
    },
    
    jobDeadline: {
        subject: 'Reminder: Job Application Deadline - {{jobTitle}}',
        body: `
            <h1>Application Deadline Reminder</h1>
            <p>Dear {{candidateName}},</p>
            <p>This is a reminder that the last date to apply for <strong>{{jobTitle}}</strong> is {{deadline}}.</p>
            <p>Don't miss this opportunity!</p>
            <p><a href="{{applyLink}}">Apply Now</a></p>
            <p>Best regards,<br>The RojgarSetu Team</p>
        `
    },
    
    newJobAlert: {
        subject: 'New Job Alert: {{jobTitle}}',
        body: `
            <h1>New Job Alert</h1>
            <p>Dear {{candidateName}},</p>
            <p>A new job matching your preferences has been posted!</p>
            <h2>{{jobTitle}}</h2>
            <ul>
                <li>Company: {{companyName}}</li>
                <li>Location: {{location}}</li>
                <li>Type: {{type}}</li>
            </ul>
            <p><a href="{{jobLink}}">View Job Details</a></p>
            <p>Best regards,<br>The RojgarSetu Team</p>
        `
    }
};

// Helper function to replace template variables
const replaceVariables = (template, variables) => {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
};

// Send email function
const sendEmail = async (to, templateName, variables) => {
    // Check if email service is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('Email service not configured. Skipping email send.');
        return { success: false, reason: 'Email service not configured' };
    }

    try {
        const template = templates[templateName];
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }

        const html = replaceVariables(template.body, variables);
        const subject = replaceVariables(template.subject, variables);

        const info = await transporter.sendMail({
            from: `"RojgarSetu" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });

        logger.info(`Email sent: ${info.messageId} to ${to}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Failed to send email to ${to}:`, error);
        return { success: false, error: error.message };
    }
};

// Email service functions
exports.sendWelcomeEmail = async (email, name) => {
    return sendEmail(email, 'welcome', { name });
};

exports.sendApplicationReceivedEmail = async (email, candidateName, jobTitle, companyName) => {
    return sendEmail(email, 'applicationReceived', {
        candidateName,
        jobTitle,
        companyName
    });
};

exports.sendApplicationStatusUpdateEmail = async (email, candidateName, jobTitle, status, notes) => {
    return sendEmail(email, 'applicationStatusUpdate', {
        candidateName,
        jobTitle,
        status,
        notes: notes || ''
    });
};

exports.sendNewApplicationEmail = async (email, companyName, jobTitle, candidateName) => {
    return sendEmail(email, 'newApplication', {
        companyName,
        jobTitle,
        candidateName
    });
};

exports.sendJobDeadlineReminder = async (email, candidateName, jobTitle, deadline, applyLink) => {
    return sendEmail(email, 'jobDeadline', {
        candidateName,
        jobTitle,
        deadline: new Date(deadline).toLocaleDateString(),
        applyLink
    });
};

exports.sendNewJobAlert = async (email, candidateName, jobTitle, companyName, location, type, jobLink) => {
    return sendEmail(email, 'newJobAlert', {
        candidateName,
        jobTitle,
        companyName,
        location,
        type,
        jobLink
    });
};

module.exports = exports;
