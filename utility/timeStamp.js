
async function serverTimeStamp()
{
    let timeStamp = new Date();
    let timeStampString = `${timeStamp.getFullYear()}-${timeStamp.getMonth()}-${timeStamp.getDate()} ${timeStamp.getHours()}:${timeStamp.getMinutes()}:${timeStamp.getSeconds()}`;
    return timeStampString;

}

async function _24HoursFormat()
{
    let timeStamp = new Date();
    let timeStampString = `${timeStamp.getFullYear()}${timeStamp.getUTCMonth()}${timeStamp.getUTCDate()}${timeStamp.getUTCHours()}${timeStamp.getUTCMinutes()}${timeStamp.getUTCSeconds()}`;
    return timeStampString;
    
}


const timeStamp = {
    serverTimeStamp : serverTimeStamp,
    _24HoursFormat : _24HoursFormat
}


module.exports = timeStamp;