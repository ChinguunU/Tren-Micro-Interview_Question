const fs                = require('fs'),
{ getSpreadSheetAuth }  = require('./google-sheets/google-sheets-oauth.js'),
GoogleSheet             = require('./google-sheets/google-sheets-operations.js'),
moment                  = require('moment-timezone'),
axios                   = require('axios'),
util                    = require('util'),
readFile                = util.promisify(fs.readFile),
writeFile               = util.promisify(fs.writeFile),
constants               = require('./constants.js'),
ManyKeysMap             = require('many-keys-map')

const sheetDateFormat = 'DD/MM/YYYY'

/**
 * Sends email/submits email data to webhook
 * @param {Array} user [f_name, l_name, email]
 * @param {Array} ticketData [ticket_id, closed_date]
 */
async function sendEmail (user, ticketData) {
    // Building message, will have more lines if user has multiple tickets closed.
    // This is done since we can't send more than 1 email to 1 user in a given week.
    let message = ''
    for(let i = 0; i != ticketData.length; i++) {
        message += `\nYour ticket ${ticketData[i].ticket} closed on ${moment(ticketData[i].date, sheetDateFormat).format('dddd Do of MMMM YYYY')}.`
    }

    await axios({
        method: 'post',
        url: constants.WEBHOOK,
        data: {
            full_name: `${user[0]} ${user[1].toUpperCase()}`,
            email_address: user[2],
            ready_to_send: true,
            email: {
                subject: `Ticket(s) Closed`,
                to_address: [user[2]],
                cc_address: [],
                body: `Dear ${user[1].toUpperCase()},
                ${message}
                
                Regards, Trend Micro
                `
            }
    
        }
    })
}

/**
 * Gets all users whose tickets closed in the last 18 months
 * NOTE:// This function is almost the same as getTicketClosedUsers.
 *          It could have been in the same function however it didn't 
 *          make sense to have an extra if condition in the loop when 
 *          we know that 1 condition would only be performed once for 
 *          the entire life of the program.
 * @param {Object} sheetRows google sheet data in 2-D array
 * @returns a map of the form {[f_name, l_name, email]: [ticket_id, closed_date]}
 */
async function getTicketClosedUsersLast18 (sheetRows) {
    // Map for better time complexity
    let emailsToSendTo = new ManyKeysMap()

    for (let i = 0; i != sheetRows.length; i++) {
        let row = sheetRows[i]
        if (row[4] === 'Closed') {
            let currDate = moment().tz(constants.TIMEZONE)
            let date = moment(row[5], sheetDateFormat)

            if (currDate.diff(date, 'months') <= 18) {
                // If ticket is closed and is no longer than 18 months old then store in map
                let user = [row[0], row[1], row[2]]
                let userTicketData = {
                    ticket: row[3], 
                    date: row[5]
                }
                if (emailsToSendTo.has(user)) {
                    // If user exists in map append the ticket and date
                    // We append additional tickets closed so that we don't 
                    // send more than 1 email to a specific user
                    emailsToSendTo.set(user, emailsToSendTo.get(user).append(userTicketData))
                } else {
                    // if user doesn't exist in map then create new key value pair
                    emailsToSendTo.set(user, [userTicketData])
                }
            }
        }
    }
    return emailsToSendTo
}

/**
 * Gets all users whose tickets closed
 * @param {Object} sheetRows google sheet data in 2-D array
 * @returns a map of the form {[f_name, l_name, email]: [ticket_id, closed_date]}
 */
async function getTicketClosedUsers (sheetRows) {
    let emailsToSendTo = new ManyKeysMap()
    for (let i = 0; i != sheetRows.length; i++) {
        let row = sheetRows[i]
        if (row[4] === 'Closed') {
            // If ticket is closed to store in map
            let user = [row[0], row[1], row[2]]
                let userTicketData = {
                    ticket: row[3], 
                    date: row[5]
                }
                if (emailsToSendTo.has(user)) {
                    // If user exists in map append the ticket and date
                    // We append additional tickets closed so that we don't 
                    // send more than 1 email to a specific user
                    emailsToSendTo.set(user, emailsToSendTo.get(user).append(userTicketData))
                } else {
                    // if user doesn't exist in map then create new key value pair
                    emailsToSendTo.set(user, [userTicketData])
                }
        }
    }
    return emailsToSendTo
}


/**
 * Reads new entries from google sheets and notifies customers that their ticket has been closed
 */
async function cronNotifyTicketClosure () {
    let googleSheet = new GoogleSheet()
    let offset = 2
    try {
        // Getting google sheet credentials
        let content = await readFile(constants.GOOGLE_CREDENTIALS)
        // Getting google sheet auth
        let auth = await getSpreadSheetAuth(JSON.parse(content))

        offset = false
        try {
            let offsetFile = await readFile('offset.json')
            offset = JSON.parse(offsetFile).offset
        } catch (err) {
            offset = 2
        }
        
        // Fetching rows depending on offset
        let rows = await googleSheet.fetchSheet(auth, `A${offset}`)

        if(rows) {
            let usersToSend
            // Getting users that need to be notified their ticket has been closed
            if(offset == 2) {
                usersToSend = await getTicketClosedUsersLast18(rows)
            } else  {
                usersToSend = await getTicketClosedUsers(rows)
            }
            
            // Notifying users
            for(const [key, value] of usersToSend) {
                await sendEmail(key, value)
            }

            // Saving offset for next cron job
            let offsetJson = {
                offset: rows.length + offset
            }
            await writeFile(constants.SHEET_OFFSET, JSON.stringify(offsetJson))
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    cronNotifyTicketClosure
}