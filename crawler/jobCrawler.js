// crawler/jobCrawler.js - Job crawler for scraping government and private job portals
const axios = require('axios');
const cheerio = require('cheerio');
const { query } = require('../config/database');
const logger = require('../utils/logger');

// Authentic Government Job Portal URLs
const JOB_SOURCES = {
    // Central Government Jobs
    UPSC: 'https://www.upsc.gov.in',
    SSC: 'https://ssc.gov.in',
    RRB: 'https://www.rrbcdg.gov.in',
    IBPS: 'https://www.ibps.in',
    
    // State Government Jobs (Example: Maharashtra)
    MAHA_PSC: 'https://www.mpsc.gov.in',
    
    // Aggregator Sites (More reliable for scraping)
    EMPLOYMENT_NEWS: 'https://www.employmentnews.gov.in',
    SARKARI_RESULT: 'https://www.sarkariresult.com',
    
    // Private Sector - IT Jobs
    NAUKRI_IT: 'https://www.naukri.com/it-jobs',
    LINKEDIN_JOBS: 'https://www.linkedin.com/jobs'
};

// Sample job data for demonstration (since real scraping requires DOM inspection)
const SAMPLE_JOBS = [
    {
        title: 'SSC CGL 2024 - Combined Graduate Level Examination',
        category: 'Government',
        type: 'full-time',
        location: 'All India',
        description: 'SSC Combined Graduate Level Examination 2024 for various posts in ministries and departments of Government of India.',
        eligibilityCriteria: 'Bachelor\'s degree from recognized university. Age: 18-32 years.',
        feesStructure: '₹100 (SC/ST/PwD exempted)',
        lastDate: new Date('2024-12-31'),
        source: 'SSC',
        sourceUrl: 'https://ssc.gov.in/cgl-2024',
        experienceRequired: 'Freshers',
        educationRequired: 'Bachelor\'s Degree'
    },
    {
        title: 'UPSC Civil Services Examination 2024',
        category: 'Government',
        type: 'full-time',
        location: 'All India',
        description: 'UPSC Civil Services Examination for Indian Administrative Service, Indian Police Service, and other Group A services.',
        eligibilityCriteria: 'Bachelor\'s degree. Age: 21-32 years (General), relaxation for reserved categories.',
        feesStructure: '₹100 (Female/SC/ST/PwD exempted)',
        lastDate: new Date('2024-11-30'),
        source: 'UPSC',
        sourceUrl: 'https://www.upsc.gov.in/cse-2024',
        experienceRequired: 'Freshers',
        educationRequired: 'Bachelor\'s Degree'
    },
    {
        title: 'Railway Recruitment Board - NTPC 2024',
        category: 'Government',
        type: 'full-time',
        location: 'All India',
        description: 'RRB NTPC Graduate and Undergraduate posts including Clerk, Typist, Station Master, etc.',
        eligibilityCriteria: '12th pass or Graduate depending on post. Age: 18-33 years.',
        feesStructure: '₹500 (SC/ST/PwD/Ex-Servicemen: ₹250)',
        lastDate: new Date('2024-12-15'),
        source: 'RRB',
        sourceUrl: 'https://www.rrbcdg.gov.in/ntpc-2024',
        experienceRequired: 'Freshers',
        educationRequired: '12th/Graduate'
    },
    {
        title: 'IBPS PO/Clerk 2024 - Banking Jobs',
        category: 'Banking',
        type: 'full-time',
        location: 'All India',
        description: 'IBPS Probationary Officer and Clerk recruitment for Public Sector Banks.',
        eligibilityCriteria: 'Graduate in any discipline. Age: 20-30 years for PO, 20-28 for Clerk.',
        feesStructure: '₹850 (SC/ST/PwD: ₹175)',
        lastDate: new Date('2024-11-25'),
        source: 'IBPS',
        sourceUrl: 'https://www.ibps.in/crp-po-xiv/',
        experienceRequired: 'Freshers',
        educationRequired: 'Graduate'
    },
    {
        title: 'Software Engineer - TCS Recruitment 2024',
        category: 'IT',
        type: 'full-time',
        location: 'Multiple Locations',
        description: 'TCS is hiring Software Engineers for various positions across India.',
        eligibilityCriteria: 'B.E/B.Tech/MCA/M.Sc (CS/IT). Freshers and experienced welcome.',
        feesStructure: 'No fees',
        lastDate: new Date('2024-12-31'),
        source: 'TCS',
        sourceUrl: 'https://www.tcs.com/careers',
        experienceRequired: '0-5 years',
        educationRequired: 'B.E/B.Tech/MCA'
    },
    {
        title: 'Infosys Systems Engineer Trainee',
        category: 'IT',
        type: 'full-time',
        location: 'Multiple Locations',
        description: 'Infosys is hiring Systems Engineer Trainees for 2024 batch.',
        eligibilityCriteria: 'B.E/B.Tech (CS/IT/EEE/ECE/Mech/Civil). Minimum 60% throughout academics.',
        feesStructure: 'No fees',
        lastDate: new Date('2024-12-20'),
        source: 'INFOSYS',
        sourceUrl: 'https://www.infosys.com/careers',
        experienceRequired: 'Freshers',
        educationRequired: 'B.E/B.Tech'
    },
    {
        title: 'DRDO Scientist B Recruitment 2024',
        category: 'Defence',
        type: 'full-time',
        location: 'All India',
        description: 'DRDO Scientist B positions in various defense research laboratories.',
        eligibilityCriteria: 'B.Tech/BE in relevant discipline with valid GATE score. Age: 28 years max.',
        feesStructure: 'No fees',
        lastDate: new Date('2024-11-15'),
        source: 'DRDO',
        sourceUrl: 'https://www.drdo.gov.in/drdo-recruitment',
        experienceRequired: 'Freshers',
        educationRequired: 'B.E/B.Tech with GATE'
    },
    {
        title: 'Indian Army Technical Entry Scheme (TES) 2024',
        category: 'Defence',
        type: 'full-time',
        location: 'All India',
        description: 'Indian Army Technical Entry Scheme for 10+2 passed candidates to join as Lieutenant.',
        eligibilityCriteria: '10+2 with Physics, Chemistry, Mathematics. Age: 16.5-19.5 years.',
        feesStructure: 'No fees',
        lastDate: new Date('2024-12-10'),
        source: 'INDIAN ARMY',
        sourceUrl: 'https://www.joinindianarmy.nic.in',
        experienceRequired: 'Freshers',
        educationRequired: '10+2 with PCM'
    }
];

// Helper function to generate slug
const generateSlug = (title) => {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
};

// Main crawler function - inserts sample jobs for demo
async function scrapeGovJobs() {
    logger.info('Starting job crawler...');
    logger.info('Target sources:', Object.keys(JOB_SOURCES).join(', '));
    
    try {
        let insertedCount = 0;
        let skippedCount = 0;
        
        for (const job of SAMPLE_JOBS) {
            try {
                // Check if job already exists by title and source URL
                const existing = await query(
                    'SELECT id FROM jobs WHERE title = $1 AND source = $2',
                    [job.title, job.source]
                );
                
                if (existing.rows.length === 0) {
                    // Generate unique slug
                    const slug = generateSlug(job.title);
                    
                    await query(
                        `INSERT INTO jobs 
                        (title, slug, description, category, type, location, 
                         eligibility_criteria, fees_structure, last_date, 
                         source, source_url, experience_required, education_required,
                         is_active, is_featured) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, false)`,
                        [
                            job.title,
                            slug,
                            job.description,
                            job.category,
                            job.type,
                            job.location,
                            job.eligibilityCriteria,
                            job.feesStructure,
                            job.lastDate,
                            job.source,
                            job.sourceUrl,
                            job.experienceRequired,
                            job.educationRequired
                        ]
                    );
                    insertedCount++;
                    logger.info(`✓ Inserted: ${job.title} (${job.source})`);
                } else {
                    skippedCount++;
                    logger.info(`○ Skipped (duplicate): ${job.title}`);
                }
            } catch (err) {
                logger.error(`Error inserting job "${job.title}":`, err.message);
            }
        }
        
        logger.info(`\nCrawler finished. Inserted ${insertedCount} new jobs, skipped ${skippedCount} duplicates.`);
        return { success: true, inserted: insertedCount, skipped: skippedCount };
    } catch (err) {
        logger.error('Crawler error:', err);
        return { success: false, error: err.message };
    }
}

// Real scraping function (template for future implementation)
async function scrapeFromURL(url, selectors) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const jobs = [];
        
        // Generic scraping logic - needs customization per site
        $(selectors.container).each((i, el) => {
            const job = {
                title: $(el).find(selectors.title).text().trim(),
                category: $(el).find(selectors.category).text().trim() || 'General',
                type: $(el).find(selectors.type).text().trim() || 'Full-time',
                apply_link: $(el).find(selectors.link).attr('href'),
                criteria: $(el).find(selectors.criteria).text().trim(),
                fees_structure: $(el).find(selectors.fees).text().trim() || 'Check official site',
                last_date: $(el).find(selectors.lastDate).text().trim()
            };
            jobs.push(job);
        });
        
        return jobs;
    } catch (err) {
        logger.error(`Error scraping ${url}:`, err.message);
        return [];
    }
}

// Manual job addition (for admin use)
async function addJobManually(jobData) {
    try {
        const slug = generateSlug(jobData.title);
        
        const result = await query(
            `INSERT INTO jobs 
            (title, slug, description, category, type, location, 
             eligibility_criteria, fees_structure, last_date, 
             source, source_url, is_active) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
            RETURNING id`,
            [
                jobData.title,
                slug,
                jobData.description,
                jobData.category,
                jobData.type,
                jobData.location,
                jobData.eligibilityCriteria,
                jobData.feesStructure,
                jobData.lastDate,
                jobData.source,
                jobData.sourceUrl
            ]
        );
        
        return { success: true, id: result.rows[0].id };
    } catch (err) {
        logger.error('Error adding job manually:', err);
        return { success: false, error: err.message };
    }
}

// Get job sources info
function getJobSources() {
    return JOB_SOURCES;
}

module.exports = { 
    scrapeGovJobs, 
    scrapeFromURL, 
    addJobManually,
    getJobSources,
    JOB_SOURCES 
};
