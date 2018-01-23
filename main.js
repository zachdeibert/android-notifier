require("amd-loader");
global.window = new (require("jsdom").JSDOM)().window;
define(["googleapis", "jquery", "jquery/src/ajax"], (google, $) => {
    const SCOPES = "https://www.googleapis.com/auth/firebase.messaging";

    function getAccessToken() {
        return new Promise(function(resolve, reject) {
            var key = require('./service-account.json');
            var jwtClient = new google.auth.JWT(
                key.client_email,
                null,
                key.private_key,
                SCOPES,
                null
            );
            jwtClient.authorize(function(err, tokens) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(tokens.access_token);
            });
        });
    }
    
    getAccessToken().then(accessToken => {
        $.ajax({
            "contentType": "application/json",
            "data": JSON.stringify({
                "message": {
                    "data": {
                        "title": process.argv[2],
                        "body": process.argv[3]
                    },
                    "token": process.argv[4]
                }
            }),
            "dataType": "json",
            "headers": {
                "Authorization": `Bearer ${accessToken}`
            },
            "method": "POST",
            "url": "https://fcm.googleapis.com/v1/projects/android-notifier-67ce5/messages:send"
        }).then(() => {
            console.log("Sent!");
        }).catch(err => {
            console.error(err);
        });
    }).catch(err => {
        console.error(err);
    });
});
