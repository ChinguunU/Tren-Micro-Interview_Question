const readline = require('readline'),
{ google }     = require('googleapis'),
fs             = require('fs'),
util           = require('util'),
readFile       = util.promisify(fs.readFile),
writeFile      = util.promisify(fs.writeFile)

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

/**
 * This file is generated the first time you run the code and 
 * stores the access token to Google Spread Sheet API
 */
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials
 * @param {Object} credentials The authorization client credentials.
 */
async function getSpreadSheetAuth(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    var oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])
    
    try {
        let token = await readFile(TOKEN_PATH)
        oAuth2Client.setCredentials(JSON.parse(token))
    } catch (err) {
        oAuth2Client = await getNewToken(oAuth2Client)
    } 

    return oAuth2Client
}

/**
 * Get and store new token after prompting for user authorization 
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })

    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    
    console.log('Enter the code from that page here: ')
    const it = rl[Symbol.asyncIterator]();
    const code = await it.next();
    rl.close()
    try {
        let token = await oAuth2Client.getToken(code.value)
        oAuth2Client.setCredentials(token.tokens)
        await writeFile(TOKEN_PATH, JSON.stringify(token.tokens))
        console.log('Token stored to', TOKEN_PATH)
    } catch (err) {
        throw ('Error while trying to retrieve access token')
    }

    return oAuth2Client
}

module.exports = getSpreadSheetAuth