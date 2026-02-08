const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../db');

// Example: scrape a government job portal
async function scrapeGovJobs() {
    try {
        const url = 'https://example.gov/jobs';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        $('div.job-posting').each(async (i, el) => {
            const title = $(el).find('h2.title').text().trim();
            const category = $(el).find('span.category').text().trim();
            const type = $(el).find('span.type').text().trim();
            const apply_link = $(el).find('a.apply').attr('href');
            const criteria = $(el).find('div.criteria').text().trim();
            const fees_structure = $(el).find('div.fees').text().trim();
            const last_date_text = $(el).find('span.last-date').text().trim();
            const last_date = new Date(last_date_text); // convert string to date

            await pool.query(
                `INSERT INTO jobs 
                (title, category, type, apply_link, criteria, fees_structure, last_date) 
                VALUES ($1,$2,$3,$4,$5,$6,$7)
                ON CONFLICT (title) DO NOTHING`,
                [title, category, type, apply_link, criteria, fees_structure, last_date]
            );
        });
        console.log('Crawler finished');
    } catch (err) {
        console.error('Crawler error:', err);
    }
}

module.exports = { scrapeGovJobs };
