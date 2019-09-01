const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
let Instagram = require('instagram-nodejs-without-api');
Instagram = new Instagram(),
fs = require('fs');
const controller = require('./controllers/');


//get Instagram auth info

(function () {
  fs.readFile('./config.json', (err, data) => {
    if (err) console.log('err', err);
    if (data.csrfToken && data.sessionId) {
      data = JSON.parse(data);
      Instagram.csrfToken = data.csrfToken
      Instagram.sessionId = data.sessionId
    }else {
      controller.login((err, result) => {
        if (err) console.log('err', err);
        Instagram.csrfToken = result.csrfToken,
        Instagram.sessionId = result.sessionId
      })
    }
  })
})()




const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


app.listen(3000, () => {
  console.log(`The App is running in localhost: 3000`);
})


app.get('/', (req, res) => {
  console.log(req.query);
  return Instagram.getUserDataByUsername(req.query.target_user).then((t) =>
  {
    console.log('t----', t);
    // return Instagram.getUserFollowers(t.graphql.user.id).then((t) =>
    // {
    //   console.log(t); // - instagram followers for user "username-for-get"
    // })
  })
})
