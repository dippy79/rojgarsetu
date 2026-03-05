// services/jobFetcher.js - Fixed with correct database schema
// Fetches data from multiple sources, categorizes, and seeds the database

const axios = require('axios');
const { query } = require('../config/database');
const logger = require('../utils/logger');

// ============================================
// SEED DATA - Government Jobs
// ============================================
const GOVERNMENT_JOB_SEEDS = [
    {
        title: 'SSC CGL 2024 - Combined Graduate Level Examination',
        organization: 'Staff Selection Commission (SSC)',
        category: 'Government',
        type: 'full-time',
        location: 'All India',
        description: 'SSC Combined Graduate Level Examination 2024 for various posts in ministries and departments of Government of India. Graduate candidates can apply for positions like Assistant, Inspector, Sub-Inspector, and more.',
        eligibility_criteria: "Bachelor's degree from recognized university. Age: 18-32 years (relaxation for SC/ST/OBC).",
        fees_structure: '₹100 (SC/ST/PwD exempted)',
        salary_min: 25000,
        salary_max: 90000,
        experience_required: 'Freshers',
        education_required: "Bachelor's Degree",
        last_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        apply_link: 'https://ssc.gov.in/cgl-2024',
        source: 'SSC',
        is_featured: true,
        is_government: true
    },
    {
        title: 'UPSC Civil Services Examination 2024',
        organization: 'Union Public Service Commission (UPSC)',
        category: 'Government',
        type: 'full-time',
        location: 'All India',
        description: 'UPSC Civil Services Examination for Indian Administrative Service (IAS), Indian Police Service (IPS), and other Group A services of Government of India.',
        eligibility_criteria: "Bachelor's degree. Age: 21-32 years (General), relaxation for SC/ST/OBC/PH categories.",
        fees_structure: '₹100 (Female/SC/ST/PwD exempted)',
        salary_min: 56100,
        salary_max: 250000,
        experience_required: 'Freshers',
        education_required: "Bachelor's Degree",
        last_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.upsc.gov.in/cse-2024',
        source: 'UPSC',
        is_featured: true,
        is_government: true
    },
    {
        title: 'Railway Recruitment Board - RRB NTPC 2024',
        organization: 'Railway Recruitment Board (RRB)',
        category: 'Government',
        type: 'full-time',
        location: 'All India',
        description: 'RRB NTPC Graduate and Undergraduate posts including Clerk, Typist, Station Master, Commercial Apprentice, and Traffic Assistant across Indian Railways.',
        eligibility_criteria: '12th pass or Graduate depending on post. Age: 18-33 years.',
        fees_structure: '₹500 (SC/ST/PwD/Ex-Servicemen: ₹250)',
        salary_min: 19900,
        salary_max: 63200,
        experience_required: 'Freshers',
        education_required: '12th/Graduate',
        last_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.rrbcdg.gov.in/ntpc-2024',
        source: 'RRB',
        is_featured: true,
        is_government: true
    },
    {
        title: 'IBPS PO/Clerk 2024 - Banking Jobs',
        organization: 'Institute of Banking Personnel Selection (IBPS)',
        category: 'Banking',
        type: 'full-time',
        location: 'All India',
        description: 'IBPS Probationary Officer (PO) and Clerk recruitment for Public Sector Banks including SBI, PNB, BOB, and other nationalized banks.',
        eligibility_criteria: 'Graduate in any discipline. Age: 20-30 years for PO, 20-28 for Clerk.',
        fees_structure: '₹850 (SC/ST/PwD: ₹175)',
        salary_min: 36000,
        salary_max: 98000,
        experience_required: 'Freshers',
        education_required: 'Graduate',
        last_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.ibps.in/crp-po-xiv/',
        source: 'IBPS',
        is_featured: true,
        is_government: true
    },
    {
        title: 'DRDO Scientist B Recruitment 2024',
        organization: 'Defence Research & Development Organisation (DRDO)',
        category: 'Defence',
        type: 'full-time',
        location: 'All India',
        description: 'DRDO Scientist B positions in various defense research laboratories across India. Work on cutting-edge defense technology.',
        eligibility_criteria: 'B.Tech/BE in relevant discipline with valid GATE score. Age: 28 years max (relaxation for SC/ST/OBC).',
        fees_structure: 'No fees',
        salary_min: 67700,
        salary_max: 180000,
        experience_required: 'Freshers',
        education_required: 'B.E/B.Tech with GATE',
        last_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.drdo.gov.in/drdo-recruitment',
        source: 'DRDO',
        is_featured: false,
        is_government: true
    },
    {
        title: 'Indian Army Technical Entry Scheme (TES) 2024',
        organization: 'Indian Army',
        category: 'Defence',
        type: 'full-time',
        location: 'All India',
        description: 'Indian Army Technical Entry Scheme for 10+2 passed candidates to join as Lieutenant in Corps of Engineers, Signals, Electrical, Mechanical.',
        eligibility_criteria: '10+2 with Physics, Chemistry, Mathematics (60% minimum). Age: 16.5-19.5 years.',
        fees_structure: 'No fees',
        salary_min: 56100,
        salary_max: 177500,
        experience_required: 'Freshers',
        education_required: '10+2 with PCM',
        last_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.joinindianarmy.nic.in/ContentPage?Id=141',
        source: 'INDIAN ARMY',
        is_featured: false,
        is_government: true
    },
    {
        title: 'State PSC - Maharashtra MPSC 2024',
        organization: 'Maharashtra Public Service Commission',
        category: 'Government',
        type: 'full-time',
        location: 'Maharashtra',
        description: 'Maharashtra PSC recruitment for various Group A and B posts in Maharashtra Government departments.',
        eligibility_criteria: "Bachelor's degree from recognized university. Age: 19-38 years.",
        fees_structure: '₹394 (SC/ST: ₹94)',
        salary_min: 41800,
        salary_max: 132300,
        experience_required: 'Freshers',
        education_required: "Bachelor's Degree",
        last_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.mpsc.gov.in',
        source: 'MPSC',
        is_featured: false,
        is_government: true
    },
    {
        title: 'Neyveli Lignite Corporation (NLC) India Recruitment 2024',
        organization: 'NLC India Limited',
        category: 'Government',
        type: 'full-time',
        location: 'All India',
        description: 'NLC India Limited (A Navratna Government Enterprise) recruitment for Graduate Executive Trainee and other posts.',
        eligibility_criteria: 'BE/B.Tech/MBA/CA depending on post. Age: 21-30 years.',
        fees_structure: '₹854 + GST',
        salary_min: 50000,
        salary_max: 160000,
        experience_required: 'Freshers',
        education_required: 'B.E/B.Tech/Graduate',
        last_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.nlcindia.in/careers',
        source: 'NLC',
        is_featured: false,
        is_government: true
    }
];

// ============================================
// SEED DATA - Private Jobs
// ============================================
const PRIVATE_JOB_SEEDS = [
    {
        title: 'Software Engineer - TCS Recruitment 2024',
        organization: 'Tata Consultancy Services (TCS)',
        category: 'IT',
        type: 'full-time',
        location: 'Bangalore, Hyderabad, Chennai, Pune, Mumbai',
        description: 'TCS is hiring Software Engineers for various positions across India. Work with cutting-edge technologies and global clients.',
        eligibility_criteria: 'B.E/B.Tech/MCA/M.Sc (CS/IT) with 60% throughout. 0-5 years experience.',
        fees_structure: 'No fees',
        salary_min: 350000,
        salary_max: 800000,
        experience_required: '0-5 years',
        education_required: 'B.E/B.Tech/MCA',
        last_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.tcs.com/careers',
        source: 'TCS',
        is_featured: true,
        is_government: false
    },
    {
        title: 'Infosys Systems Engineer Trainee 2024',
        organization: 'Infosys',
        category: 'IT',
        type: 'full-time',
        location: 'Bangalore, Hyderabad, Chennai, Pune, Mysore',
        description: 'Infosys is hiring Systems Engineer Trainees for 2024 batch. Join one of India\'s leading IT services companies.',
        eligibility_criteria: 'B.E/B.Tech (CS/IT/EEE/ECE/Mech/Civil). Minimum 60% throughout academics.',
        fees_structure: 'No fees',
        salary_min: 250000,
        salary_max: 400000,
        experience_required: 'Freshers',
        education_required: 'B.E/B.Tech',
        last_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.infosys.com/careers',
        source: 'INFOSYS',
        is_featured: true,
        is_government: false
    },
    {
        title: 'Wipro Turbo Hiring - Software Engineer',
        organization: 'Wipro',
        category: 'IT',
        type: 'full-time',
        location: 'Bangalore, Hyderabad, Chennai, Kolkata',
        description: 'Wipro Turbo Hiring for experienced professionals. Excellent career growth opportunities.',
        eligibility_criteria: 'B.E/B.Tech in any discipline. 1-5 years experience.',
        fees_structure: 'No fees',
        salary_min: 300000,
        salary_max: 700000,
        experience_required: '1-5 years',
        education_required: 'B.E/B.Tech',
        last_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        apply_link: 'https://careers.wipro.com',
        source: 'WIPRO',
        is_featured: false,
        is_government: false
    },
    {
        title: 'Amazon Customer Service Associate',
        organization: 'Amazon',
        category: 'Customer Service',
        type: 'full-time',
        location: 'Bangalore, Hyderabad, Pune',
        description: 'Amazon is hiring Customer Service Associates to join our world-class customer service team.',
        eligibility_criteria: 'Any graduate. Excellent communication skills. 0-2 years experience.',
        fees_structure: 'No fees',
        salary_min: 250000,
        salary_max: 400000,
        experience_required: '0-2 years',
        education_required: 'Graduate',
        last_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.amazon.jobs',
        source: 'AMAZON',
        is_featured: true,
        is_government: false
    },
    {
        title: 'HCLTech Graduate Engineer Trainee 2024',
        organization: 'HCLTech',
        category: 'IT',
        type: 'full-time',
        location: 'Bangalore, Chennai, Noida, Pune',
        description: 'HCLTech is hiring Graduate Engineer Trainees for various technical roles.',
        eligibility_criteria: 'B.E/B.Tech (CS/IT/ECE/EEE). Minimum 60% in 10th, 12th, and Engineering.',
        fees_structure: 'No fees',
        salary_min: 250000,
        salary_max: 450000,
        experience_required: 'Freshers',
        education_required: 'B.E/B.Tech',
        last_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.hcltech.com/careers',
        source: 'HCL',
        is_featured: false,
        is_government: false
    },
    {
        title: 'Accenture Java Developer',
        organization: 'Accenture',
        category: 'IT',
        type: 'full-time',
        location: 'Bangalore, Hyderabad, Mumbai, Chennai, Gurgaon',
        description: 'Accenture is seeking Java Developers to work on enterprise applications for global clients.',
        eligibility_criteria: 'B.E/B.Tech in relevant discipline. 2-5 years Java development experience.',
        fees_structure: 'No fees',
        salary_min: 400000,
        salary_max: 900000,
        experience_required: '2-5 years',
        education_required: 'B.E/B.Tech',
        last_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.accenture.com/careers',
        source: 'ACCENTURE',
        is_featured: false,
        is_government: false
    },
    {
        title: 'Flipkart Business Development Manager',
        organization: 'Flipkart',
        category: 'E-commerce',
        type: 'full-time',
        location: 'Bangalore, Delhi, Mumbai',
        description: 'Flipkart is hiring Business Development Managers to drive seller acquisition and growth.',
        eligibility_criteria: 'MBA preferred. 2-5 years in e-commerce/retail/BD. Excellent analytical skills.',
        fees_structure: 'No fees',
        salary_min: 500000,
        salary_max: 1200000,
        experience_required: '2-5 years',
        education_required: 'MBA/Graduate',
        last_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www.flipkart.com/careers',
        source: 'FLIPKART',
        is_featured: false,
        is_government: false
    },
    {
        title: 'Deloitte Audit Associate',
        organization: 'Deloitte',
        category: 'Finance',
        type: 'full-time',
        location: 'Mumbai, Bangalore, Delhi, Chennai, Hyderabad',
        description: 'Deloitte is hiring Audit Associates to join our audit and assurance practice.',
        eligibility_criteria: 'CA Inter/Degree in Commerce. 0-3 years experience.',
        fees_structure: 'No fees',
        salary_min: 400000,
        salary_max: 800000,
        experience_required: '0-3 years',
        education_required: 'CA/Commerce Graduate',
        last_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        apply_link: 'https://www2.deloitte.com/global/en/careers',
        source: 'DELOITTE',
        is_featured: false,
        is_government: false
    }
];

// ============================================
// SEED DATA - Courses
// ============================================
const COURSE_SEEDS = [
    {
        name: 'Complete Government Job Preparation Course 2024',
        provider: 'RojgarSetu',
        category: 'Government Exams',
        description: 'Comprehensive video course covering all topics for SSC CGL, CHSL, UPSC, and State PSC exams. Includes mock tests, previous year papers, and expert guidance.',
        duration: '6 months',
        duration_weeks: 24,
        mode: 'online',
        fees_amount: 499,
        eligibility: 'Any graduate or undergraduate',
        apply_link: 'https://rojgarsetu.com/courses/govt-prep',
        is_featured: true
    },
    {
        name: 'Full Stack Web Development Bootcamp',
        provider: 'RojgarSetu',
        category: 'IT',
        description: 'Learn HTML, CSS, JavaScript, React, Node.js, MongoDB and build real-world projects. 100+ hours of content with hands-on projects.',
        duration: '4 months',
        duration_weeks: 16,
        mode: 'online',
        fees_amount: 799,
        eligibility: 'Basic computer knowledge',
        apply_link: 'https://rojgarsetu.com/courses/web-dev',
        is_featured: true
    },
    {
        name: 'Data Science & Machine Learning Masterclass',
        provider: 'RojgarSetu',
        category: 'IT',
        description: 'Master Python, Data Analysis, Machine Learning, Deep Learning and AI. Includes real-world datasets and projects.',
        duration: '6 months',
        duration_weeks: 24,
        mode: 'online',
        fees_amount: 999,
        eligibility: 'Basic programming knowledge',
        apply_link: 'https://rojgarsetu.com/courses/data-science',
        is_featured: true
    },
    {
        name: 'Banking & Insurance Exam Preparation',
        provider: 'RojgarSetu',
        category: 'Banking',
        description: 'Complete preparation for IBPS PO, Clerk, SBI PO, RBI Assistant, and Insurance exams. Includes live classes and mock tests.',
        duration: '5 months',
        duration_weeks: 20,
        mode: 'online',
        fees_amount: 599,
        eligibility: 'Any graduate',
        apply_link: 'https://rojgarsetu.com/courses/banking',
        is_featured: false
    },
    {
        name: 'Digital Marketing Master Course',
        provider: 'RojgarSetu',
        category: 'Marketing',
        description: 'Learn SEO, SEM, Social Media Marketing, Email Marketing, Content Marketing and Google Analytics. Get certified by Google and HubSpot.',
        duration: '3 months',
        duration_weeks: 12,
        mode: 'online',
        fees_amount: 449,
        eligibility: 'No prior experience needed',
        apply_link: 'https://rojgarsetu.com/courses/digital-marketing',
        is_featured: false
    },
    {
        name: 'Python Programming for Beginners',
        provider: 'RojgarSetu',
        category: 'IT',
        description: 'Start your programming journey with Python. Learn fundamentals, data structures, OOP, and build small projects.',
        duration: '2 months',
        duration_weeks: 8,
        mode: 'online',
        fees_amount: 199,
        eligibility: 'No prior programming experience',
        apply_link: 'https://rojgarsetu.com/courses/python',
        is_featured: false
    },
    {
        name: 'English Communication & Soft Skills',
        provider: 'RojgarSetu',
        category: 'Skills',
        description: 'Improve your English speaking, writing, and soft skills. Perfect for interview preparation and corporate success.',
        duration: '2 months',
        duration_weeks: 8,
        mode: 'online',
        fees_amount: 249,
        eligibility: 'Basic English knowledge',
        apply_link: 'https://rojgarsetu.com/courses/english',
        is_featured: false
    },
    {
        name: 'SSC CGL Tier-1 Complete Course',
        provider: 'RojgarSetu',
        category: 'Government Exams',
        description: 'Focused preparation for SSC CGL Tier-1. Covers Quantitative Aptitude, English, Reasoning, and General Awareness.',
        duration: '4 months',
        duration_weeks: 16,
        mode: 'online',
        fees_amount: 399,
        eligibility: '12th pass or graduate',
        apply_link: 'https://rojgarsetu.com/courses/ssc-cgl',
        is_featured: true
    }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate content hash for duplicate detection
function generateContentHash(data) {
    const crypto = require('crypto');
    const content = `${data.title}-${data.organization}-${data.location}-${data.last_date}`;
    return crypto.createHash('md5').update(content).digest('hex');
}

// ============================================
// MAIN FUNCTIONS
// ============================================

// Insert job into database (with duplicate check)
async function insertJob(jobData) {
    try {
        // Check for duplicate by apply_link
        const existing = await query(
            'SELECT id FROM jobs WHERE apply_link = $1',
            [jobData.apply_link]
        );

        if (existing.rows.length > 0) {
            return { success: false, reason: 'duplicate', id: existing.rows[0].id };
        }

        const result = await query(
            `INSERT INTO jobs 
            (title, organization, category, type, location, description, eligibility_criteria, fees_structure, 
             salary_min, salary_max, last_date, apply_link, source, is_featured, is_active, is_government, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
            RETURNING id`,
            [
                jobData.title,
                jobData.organization,
                jobData.category,
                jobData.type,
                jobData.location,
                jobData.description,
                jobData.eligibility_criteria,
                jobData.fees_structure,
                jobData.salary_min || null,
                jobData.salary_max || null,
                jobData.last_date,
                jobData.apply_link,
                jobData.source,
                jobData.is_featured || false,
                true,
                jobData.is_government || false
            ]
        );

        return { success: true, id: result.rows[0].id };
    } catch (err) {
        logger.error(`Error inserting job "${jobData.title}":`, err.message);
        return { success: false, reason: err.message };
    }
}

// Insert course into database (with duplicate check)
async function insertCourse(courseData) {
    try {
        // Check for duplicate by apply_link
        const existing = await query(
            'SELECT id FROM courses WHERE apply_link = $1',
            [courseData.apply_link]
        );

        if (existing.rows.length > 0) {
            return { success: false, reason: 'duplicate', id: existing.rows[0].id };
        }

        const result = await query(
            `INSERT INTO courses 
            (name, provider, category, description, duration, duration_weeks, mode, 
             fees_amount, eligibility, apply_link, is_active, is_featured) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11)
            RETURNING id`,
            [
                courseData.name,
                courseData.provider,
                courseData.category,
                courseData.description,
                courseData.duration,
                courseData.duration_weeks || null,
                courseData.mode || 'online',
                courseData.fees_amount || null,
                courseData.eligibility,
                courseData.apply_link,
                courseData.is_featured || false
            ]
        );

        return { success: true, id: result.rows[0].id };
    } catch (err) {
        logger.error(`Error inserting course "${courseData.name}":`, err.message);
        return { success: false, reason: err.message };
    }
}

// Fetch Government Jobs
async function fetchGovernmentJobs() {
    logger.info('Fetching government jobs...');

    let insertedCount = 0;
    let skippedCount = 0;

    for (const job of GOVERNMENT_JOB_SEEDS) {
        const result = await insertJob(job);

        if (result.success) {
            insertedCount++;
            logger.info(`✓ Inserted government job: ${job.title}`);
        } else if (result.reason === 'duplicate') {
            skippedCount++;
        } else {
            logger.error(`✗ Failed to insert: ${job.title} - ${result.reason}`);
        }
    }

    logger.info(`Government Jobs: Inserted ${insertedCount}, Skipped ${skippedCount} duplicates`);
    return { inserted: insertedCount, skipped: skippedCount };
}

// Fetch Private Jobs
async function fetchPrivateJobs() {
    logger.info('Fetching private jobs...');

    let insertedCount = 0;
    let skippedCount = 0;

    for (const job of PRIVATE_JOB_SEEDS) {
        const result = await insertJob(job);

        if (result.success) {
            insertedCount++;
            logger.info(`✓ Inserted private job: ${job.title}`);
        } else if (result.reason === 'duplicate') {
            skippedCount++;
        } else {
            logger.error(`✗ Failed to insert: ${job.title} - ${result.reason}`);
        }
    }

    logger.info(`Private Jobs: Inserted ${insertedCount}, Skipped ${skippedCount} duplicates`);
    return { inserted: insertedCount, skipped: skippedCount };
}

// Fetch Courses
async function fetchCourses() {
    logger.info('Fetching courses...');

    let insertedCount = 0;
    let skippedCount = 0;

    for (const course of COURSE_SEEDS) {
        const result = await insertCourse(course);

        if (result.success) {
            insertedCount++;
            logger.info(`✓ Inserted course: ${course.name}`);
        } else if (result.reason === 'duplicate') {
            skippedCount++;
        } else {
            logger.error(`✗ Failed to insert: ${course.name} - ${result.reason}`);
        }
    }

    logger.info(`Courses: Inserted ${insertedCount}, Skipped ${skippedCount} duplicates`);
    return { inserted: insertedCount, skipped: skippedCount };
}

// Main fetch function - runs all fetchers
async function fetchAllJobsAndCourses() {
    logger.info('===========================================');
    logger.info('Starting Job & Course Fetch Process...');
    logger.info('===========================================');

    try {
        // Fetch government jobs
        const govResult = await fetchGovernmentJobs();

        // Fetch private jobs
        const privResult = await fetchPrivateJobs();

        // Fetch courses
        const courseResult = await fetchCourses();

        const totalJobsInserted = govResult.inserted + privResult.inserted;
        const totalJobsSkipped = govResult.skipped + privResult.skipped;

        logger.info('===========================================');
        logger.info('JOB FETCH SUMMARY:');
        logger.info(`  Government Jobs: ${govResult.inserted} inserted, ${govResult.skipped} duplicates`);
        logger.info(`  Private Jobs: ${privResult.inserted} inserted, ${privResult.skipped} duplicates`);
        logger.info(`  Courses: ${courseResult.inserted} inserted, ${courseResult.skipped} duplicates`);
        logger.info(`  TOTAL: ${totalJobsInserted} new records inserted`);
        logger.info(`  TOTAL: ${totalJobsSkipped} duplicates skipped`);
        logger.info('===========================================');

        return {
            success: true,
            governmentJobs: govResult,
            privateJobs: privResult,
            courses: courseResult,
            totalInserted: totalJobsInserted,
            totalSkipped: totalJobsSkipped
        };
    } catch (err) {
        logger.error('Job fetch error:', err);
        return { success: false, error: err.message };
    }
}

// Seed data if database is empty
async function seedIfEmpty() {
    try {
        // Check if jobs table is empty
        const jobsCount = await query('SELECT COUNT(*) FROM jobs');
        const jobsTotal = parseInt(jobsCount.rows[0].count);

        // Check if courses table is empty
        const coursesCount = await query('SELECT COUNT(*) FROM courses');
        const coursesTotal = parseInt(coursesCount.rows[0].count);

        logger.info(`Current database status: ${jobsTotal} jobs, ${coursesTotal} courses`);

        // Seed if empty
        if (jobsTotal === 0 || coursesTotal === 0) {
            logger.info('Database is empty. Running initial seed...');
            return await fetchAllJobsAndCourses();
        } else {
            logger.info('Database already has data. Skipping seed.');
            return { success: true, message: 'Data already exists', seeded: false };
        }
    } catch (err) {
        logger.error('Seed check error:', err);
        return { success: false, error: err.message };
    }
}

// Get statistics
async function getStats() {
    try {
        // Get total jobs and categorize by government
        const jobsResult = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_government = true THEN 1 ELSE 0 END) as government,
                SUM(CASE WHEN is_government = false OR is_government IS NULL THEN 1 ELSE 0 END) as private
            FROM jobs WHERE is_active = true
        `);

        const coursesResult = await query('SELECT COUNT(*) as total FROM courses WHERE is_active = true');

        return {
            totalJobs: parseInt(jobsResult.rows[0].total) || 0,
            governmentJobs: parseInt(jobsResult.rows[0].government) || 0,
            privateJobs: parseInt(jobsResult.rows[0].private) || 0,
            totalCourses: parseInt(coursesResult.rows[0].total) || 0
        };
    } catch (err) {
        logger.error('Get stats error:', err);
        return { totalJobs: 0, governmentJobs: 0, privateJobs: 0, totalCourses: 0 };
    }
}

module.exports = {
    fetchAllJobsAndCourses,
    fetchGovernmentJobs,
    fetchPrivateJobs,
    fetchCourses,
    seedIfEmpty,
    getStats,
    GOVERNMENT_JOB_SEEDS,
    PRIVATE_JOB_SEEDS,
    COURSE_SEEDS
};

