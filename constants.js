function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    })
}

define('TIMEZONE', 'Australia/Sydney')
define('WEBHOOK', 'https://webhook.site/2725fb0e-9906-45d9-a712-16ae4551fe48')
define('HOSTNAME', 'localhost')
define('PORT', 3001)
define('GOOGLE_CREDENTIALS', 'credentials.json')
define('GOOGLE_TOKEN', 'token.json')
define('SHEET_OFFSET', 'offset.json')
define('DEFAULT_SHEET', '1rXXWQdneb0d4dDQw4LOeLpa8YDTOwvlQl0Ad2xzswXc')