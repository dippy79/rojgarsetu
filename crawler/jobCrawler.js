const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../db');

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
        type: 'Full-time',
        apply_link: 'https://ssc.gov.in/cgl-2024',
        criteria: 'Bachelor\'s degree from recognized university. Age: 18-32 years.',
        fees_structure: '₹100 (SC/ST/PwD exempted)',
        last_date: '2024-12-31',
        source: 'SSC'
    },
    {
        title: 'UPSC Civil Services Examination 2024',
        category: 'Government',
        type: 'Full-time',
        apply_link: 'https://www.upsc.gov.in/cse-2024',
        criteria: 'Bachelor\'s degree. Age: 21-32 years (General), relaxation for reserved categories.',
        fees_structure: '₹100 (Female/SC/ST/PwD exempted)',
        last_date: '2024-11-30',
        source: 'UPSC'
    },
    {
        title: 'Railway Recruitment Board - NTPC 2024',
        category: 'Government',
        type: 'Full-time',
        apply_link: 'https://www.rrbcdg.gov.in/ntpc-2024',
        criteria: '12th pass or Graduate depending on post. Age: 18-33 years.',
        fees_structure: '₹500 (SC/ST/PwD/Ex-Servicemen: ₹250)',
        last_date: '2024-12-15',
        source: 'RRB'
    },
    {
        title: 'IBPS PO/Clerk 2024 - Banking Jobs',
        category: 'Banking',
        type: 'Full-time',
        apply_link: 'https://www.ibps.in/crp-po-xiv/',
        criteria: 'Graduate in any discipline. Age: 20-30 years for PO, 20-28 for Clerk.',
        fees_structure: '₹850 (SC/ST/PwD: ₹175)',
        last_date: '2024-11-25',
        source: 'IBPS'
    },
    {
        title: 'Software Engineer - TCS Recruitment 2024',
        category: 'IT',
        type: 'Full-time',
        apply_link: 'https://www.tcs.com/careers',
        criteria: 'B.E/B.Tech/MCA/M.Sc (CS/IT). Freshers and experienced welcome.',
        fees_structure: 'No fees',
        last_date: '2024-12-31',
        source: 'NAUKRI'
    },
    {
        title: 'Infosys Systems Engineer Trainee',
        category: 'IT',
        type: 'Full-time',
        apply_link: 'https://www.infosys.com/careers',
        criteria: 'B.E/B.Tech (CS/IT/EEE/ECE/Mech/Civil). Minimum 60% throughout academics.',
        fees_structure: 'No fees',
        last_date: '2024-12-20',
        source: 'NAUKRI'
    },
    {
        title: 'DRDO Scientist B Recruitment 2024',
        category: 'Defence',
        type: 'Full-time',
        apply_link: 'https://www.drdo.gov.in/drdo-recruitment',
        criteria: 'B.Tech/BE in relevant discipline with valid GATE score. Age: 28 years max.',
        fees_structure: 'No fees',
        last_date: '2024-11-15',
        source: 'EMPLOYMENT_NEWS'
    },
    {
        title: 'Indian Army Technical Entry Scheme (TES) 2024',
        category: 'Defence',
        type: 'Full-time',
        apply_link: 'https://www.joinindianarmy.nic.in',
        criteria: '10+2 with Physics, Chemistry, Mathematics. Age: 16.5-19.5 years.',
        fees_structure: 'No fees',
        last_date: '2024-12-10',
        source: 'EMPLOYMENT_NEWS'
    }
];

// Main crawler function - inserts sample jobs for demo
async function scrapeGovJobs() {
    console.log('Starting job crawler...');
    console.log('Target sources:', Object.keys(JOB_SOURCES).join(', '));
    
    try {
        let insertedCount = 0;
        
        for (const job of SAMPLE_JOBS) {
            try {
                // Check if job already exists
                const existing = await pool.query(
                    'SELECT id FROM jobs WHERE title = ?',
                    [job.title]
                );
                
                if (existing.rows.length === 0) {
                    await pool.query(
                        `INSERT INTO jobs 
                        (title, category, type, apply_link, criteria, fees_structure, last_date, is_active) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            job.title,
                            job.category,
                            job.type,
                            job.apply_link,
                            job.criteria,
                            job.fees_structure,
                            job.last_date,
                            1
                        ]
                    );
                    insertedCount++;
                    console.log(`✓ Inserted: ${job.title} (${job.source})`);
                } else {
                    console.log(`○ Skipped (duplicate): ${job.title}`);
                }
            } catch (err) {
                console.error(`Error inserting job "${job.title}":`, err.message);
            }
        }
        
        console.log(`\nCrawler finished. Inserted ${insertedCount} new jobs.`);
        return { success: true, inserted: insertedCount };
    } catch (err) {
        console.error('Crawler error:', err);
        return { success: false, error: err.message };
    }
}

// Real scraping function (template for future implementation)
async function scrapeFromURL(url, selectors) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
        console.error(`Error scraping ${url}:`, err.message);
        return [];
    }
}

// Manual job addition (for admin use)
async function addJobManually(jobData) {
    try {
        const result = await pool.query(
            `INSERT INTO jobs 
            (title, category, type, apply_link, criteria, fees_structure, last_date, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                jobData.title,
                jobData.category,
                jobData.type,
                jobData.apply_link,
                jobData.criteria,
                jobData.fees_structure,
                jobData.last_date,
                1
            ]
        );
        return { success: true, id: result.rows[0].id };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

module.exports = { 
    scrapeGovJobs, 
    scrapeFromURL, 
    addJobManually,
    JOB_SOURCES 
};
