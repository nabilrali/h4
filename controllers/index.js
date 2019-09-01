let Instagram = require('instagram-nodejs-without-api');
Instagram = new Instagram(),
fs = require('fs');




module.exports = {
  login: (cb) => {
    Instagram.getCsrfToken().then((csrf) =>
    {
      console.log('csrf', csrf);
      Instagram.csrfToken = csrf;
    }).then(() =>
    {
      return Instagram.auth('boudlalnabil', 'hello_insta').then(sessionId =>
      {
        console.log('sessionId', sessionId);
        Instagram.sessionId = sessionId
        let data = {
          csrfToken: Instagram.csrfToken,
          sessionId: Instagram.sessionId
        }
        fs.writeFile("../config.json", JSON.stringify(data), (err) => {
          if (err) cb({success: false, message: "enable to login"});
          console.log("Successfully Written to File.");
          cb(null, {success: true, ...data})
        });

      })
    }).catch(console.error);
  }
}
