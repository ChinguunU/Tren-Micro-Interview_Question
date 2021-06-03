

const { google }  = require('googleapis')
/** 
 * This class/function contains all operations regarding a spread sheet
 * @see https://docs.google.com/spreadsheets/d/1rXXWQdneb0d4dDQw4LOeLpa8YDTOwvlQl0Ad2xzswXc
 * @param spreadsheetId the spreadsheet id to operate on. 
 */
module.exports = function GoogleSheet(spreadsheetId='1rXXWQdneb0d4dDQw4LOeLpa8YDTOwvlQl0Ad2xzswXc') {
    this.spreadsheetId = spreadsheetId
    this.version = 'v4'

    
}