const fs             = require('fs'),
getSpreadSheetAuth   = require('./google-sheets/google-sheets-oath.js'),
GoogleSheet          = require('./google-sheets/google-sheets-operations.js'),
AWS                  = require('aws-sdk'),
config               = require('./config/config.js'),
util                 = require('util'),
readFile             = util.promisify(fs.readFile),
express              = require('express'),
app                  = express()

const hostname = 'localhost'
const port = 8080

AWS.config.update(config.aws_remote_config)

app.post('/', async function (req, res) {
    let googleSheet = new GoogleSheet()
    try {
        let content = await readFile('credentials.json');
        let auth = await getSpreadSheetAuth(JSON.parse(content))
        // googleSheet.func(auth)
        res.send('worked')
    } catch(err) {
        console.log(err)
    }  
})
   
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
 })