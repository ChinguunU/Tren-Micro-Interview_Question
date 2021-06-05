fs             = require('fs'),
{ google }     = require('googleapis'),
util           = require('util'),
readFile       = util.promisify(fs.readFile),
writeFile      = util.promisify(fs.writeFile),
constants      = require('../constants.js')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

/**
 * This file is generated the first time you run the code and 
 * stores the access token to Google Spread Sheet API
 */
const TOKEN_PATH = constants.GOOGLE_TOKEN;

/**
 * Create an OAuth2 client with the given credentials
 * @param {Object} credentials The authorization client credentials.
 * @returns OAuth2 client
 */
async function getSpreadSheetAuth (credentials) {
    let oAuth2Client = getClient(credentials)
    
    try {
        // Read token from file
        let token = await readFile(TOKEN_PATH)
        // Set token
        oAuth2Client.setCredentials(JSON.parse(token))
    } catch (err) {
        throw 'Token file does not exist'
    } 

    return oAuth2Client
}

/**
 * @param {Object} credentials google sheet credentials
 * @returns url to get OAuth token code
 */
async function getSheetAuthUrl(credentials) {
    let oAuth2Client = getClient(credentials)
    
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })

    return authUrl
}

/**
 * @param {String} code code to get token
 * @param {Object} credentials google sheet credentials
 */
async function saveAuthToken(code, credentials) {
    try {
        let oAuth2Client = getClient(credentials)
        let token = await oAuth2Client.getToken(code)
        oAuth2Client.setCredentials(token.tokens)
        await writeFile(TOKEN_PATH, JSON.stringify(token.tokens))
        console.log('Token stored to', TOKEN_PATH)
    } catch (err) {
        console.log(err)
        throw ('Error while trying to retrieve access token')
    }
}

/**
 * @param {Object} credentials google sheet credentials
 * @returns oAuth2 client object
 */
function getClient (credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    var oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])
    return oAuth2Client
}

module.exports = { getSpreadSheetAuth, getSheetAuthUrl, saveAuthToken }