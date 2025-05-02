// Scheduler for resource scraper with fixed daily times
const schedule = require('node-schedule');
const { runScrapers } = require('./scraper');

// Log startup
console.log(`Resource scraper scheduler initializing...`);

// Schedule scraper to run at 12:00 AM (midnight)
const midnightJob = schedule.scheduleJob('0 0 * * *', function() {
    console.log(`[${new Date().toISOString()}] Running 12:00 AM scheduled scrape...`);
    runScrapers();
});

// Schedule scraper to run at 12:00 PM (noon)
const noonJob = schedule.scheduleJob('0 12 * * *', function() {
    console.log(`[${new Date().toISOString()}] Running 12:00 PM scheduled scrape...`);
    runScrapers();
});

// Calculate and log the next run times
const nextMidnightRun = midnightJob.nextInvocation();
const nextNoonRun = noonJob.nextInvocation();

console.log(`Resource scraper successfully scheduled:`);
console.log(`- Next midnight (12:00 AM) run: ${nextMidnightRun}`);
console.log(`- Next noon (12:00 PM) run: ${nextNoonRun}`);

// Run an initial scrape at startup
console.log(`[${new Date().toISOString()}] Running initial scrape on startup...`);
runScrapers(); 