

const { google }  = require('googleapis'),
constants         = require('../constants.js')

/** 
 * This class/function contains all operations regarding a google spread sheet
 * @see https://docs.google.com/spreadsheets/d/1rXXWQdneb0d4dDQw4LOeLpa8YDTOwvlQl0Ad2xzswXc
 * @param spreadsheetId the spreadsheet id to operate on. 
 */
module.exports = function GoogleSheet(spreadsheetId=constants.DEFAULT_SHEET, sheet='Sheet1') {

    this.spreadsheetId = spreadsheetId
    this.version = 'v4'
    this.sheet = sheet

    /**
     * Returns google sheet in 2D array format based on specifie offset
     * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
     * @param {string} offsetStart offset of where to start 
     * @param {string} offsetEnd offset of where to end
     */
    this.fetchSheet = async function fetchSheet (auth, offsetStart='A2', offsetEnd='F') {
        const sheets = google.sheets({version: this.version, auth})
        try {
            let response = await sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheet}!${offsetStart}:${offsetEnd}`,
            })
            const rows = response.data.values
            
            return rows
        } catch(err) {
            throw `The API returned an error: ${err}`
        }
    }
}