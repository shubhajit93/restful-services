const crypto = require('crypto');

exports.createSignature = async function(secret_key, appended_string)
{
    return crypto.createHmac('SHA256', secret_key).update(appended_string).digest('base64');
}
