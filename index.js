const express        = require('express'),
app                  = express(),
fs                   = require('fs'),
util                 = require('util'),
readFile             = util.promisify(fs.readFile),
constants            = require('./constants.js'),
schedule             = require('node-schedule'),
cronoperations       = require('./cron-operations.js'),
{ getSheetAuthUrl, 
    saveAuthToken }  = require('./google-sheets/google-sheets-oauth.js')

/**
 * NOTE:// FURTHER IMPROVEMENTS
 * Should implement a logger file to log all activites and errors in a file.
 * May be able to improve querying google sheets.
 * Improve Documentation/Commenting
 * Not entirely sure if i have implemented it in the most efficient way may be able 
 * to hit lower time complexity algorithms in cron-operations.js(That said time may not be that important for this utility)
 */

// Cron Job scheduled to be run every week Monday 9 AM
var weeklyRule = new schedule.RecurrenceRule()
weeklyRule.dayOfWeek = 1
weeklyRule.hour = 9
weeklyRule.minute = 0
weeklyRule.tz = constants.TIMEZONE
schedule.scheduleJob(weeklyRule, function () {
    Promise.all([
        cronoperations.cronNotifyTicketClosure()
    ]).then(function (results) {
        console.log('CRONS RAN')
    }).catch(function (errs) {
        console.log('CRON ERROR:')
        console.log(errs)
    })
})

app.post('/', async function (req, res) {
    await cronoperations.cronNotifyTicketClosure()
})

app.get('/getGoogleSheetAuthUrl', async function (req, res) {
    try {
        // Getting google sheet credentials
        let content = await readFile(constants.GOOGLE_CREDENTIALS)
        // Getting google sheet auth url
        let url = await getSheetAuthUrl(JSON.parse(content))
        res.send(url)
    } catch (err) {
        res.status(500).send('Internal error')
    }
})

app.post('/setGoogleToken', async function (req, res) {
    try {
        if (req.query && req.query.code) {
            // Getting google sheet credentials
            let content = await readFile(constants.GOOGLE_CREDENTIALS)
            // Saving token
            await saveAuthToken(req.query.code, JSON.parse(content))
            res.send('Success')
        } else {
            res.send('Please provide code in query params')
        }
    } catch (err) {
        res.status(500).send('Internal error')
    }
})
   
app.listen(constants.PORT, () => {
    console.log(`Server running on port ${constants.PORT}`);
})