
async function startUp (login, app, port, ip)
{
    await login.smsLogin();
    await login.dppLogin();

    app.listen(port, ip, function() {
        console.log(`\n\n\n.....APPLICATION IS LISTENING @ IP: ${ip}  AND PORT ${port} .....\n\n\n`);
    });

}

module.exports = startUp;
