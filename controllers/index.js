let Instagram = require('instagram-nodejs-without-api');
Instagram = new Instagram(),
fs = require('fs');
const request = require('request');
const moment = require('moment');
const async = require('async');
var schedule = require('node-schedule');
const cheerio = require('cheerio');
Order = require('../models/Order');

let time_rest = 6,
time_to_complete = 1


const hash = 'mjw4NzA9O0o_-_9_r-6I9W1gf9YJF8J3BVhSXhC56V'


module.exports = {
  login: (data, cb) => {
    console.log('login', 'data', data);
    Instagram.getCsrfToken().then((csrf) =>
    {
      console.log('csrf', csrf);
      Instagram.csrfToken = csrf;
    }).then(() =>
    {
      return Instagram.auth(data.username, data.password).then(sessionId =>
      {
        console.log('sessionId', sessionId);
        Instagram.sessionId = sessionId
        let data = {
          "csrfToken": Instagram.csrfToken,
          "sessionId": Instagram.sessionId
        }
        cb(null, {success: true, ...data})
        console.log('data', data);
        fs.writeFile("./config.json", JSON.stringify(data), (err) => {
          if (err) cb({success: false, message: "enable to login"});
          console.log("Successfully Written to File.");
        });

      })
    }).catch(console.error);
  },

  getFollowers: (data, cb) => {
    console.log('data', data);
    let payload = {
      user_id: data.user_id,
      total_followers: data.quantity,
      followers_sent: data.quantity <= 200 ? data.quantity : 200,
      previous_order_time: moment().format("YYYY-MM-DD HH:mm:ss"),
      next_order_time: moment().add(time_to_complete, "hours").format("YYYY-MM-DD HH:mm:ss"),
      done: false
    }

    Order.create(payload).then((result) => {
      console.log('resutl', result);
      request(`http://microks.ir/api/instagram?hash=${hash}&type=order_user&follow_id=${data.user_id}&buy=${payload.followers_sent}`, (err, res, body) => {
        if (err) return cb({success: false, err: err});
      console.log('body', body);

        if (result.total_followers > 200) {
          console.log('total_followers', result.total_followers);

          result.total_followers = result.total_followers - result.followers_sent;

          //if new total_followers < 200
          if (result.total_followers <= 200) {
            let date = moment(result.next_order_time).toDate()
            console.log('date', date);
            console.log('date', result.next_order_time);
            console.log('new date', new Date());
            var j = schedule.scheduleJob(date, function(){
              console.log('The answer to life, the universe, and everything!');
              module.exports.sendRequest({user_id: data.user_id, quantity: result.total_followers}, (err, resp) => {
                console.log('done');
                console.log('result.id', result.id, result._id);
                Order.updateOne({_id: result.id}, {done: true}).then(async (update) => {
                  let order = await Order.findOne({_id: result.id})
                  console.log('order', update, order);
                });
              });
            });

          } else {
            console.log('total_followers', result.total_followers);
            let for_length = Math.ceil((result.total_followers / 200) + 1)
            for (var i = 1; i < for_length; i++) {//need do fix length
              console.log('start for');
              console.log('start for------------------------------');
              console.log('total_followers', result.total_followers);
              let date = moment().add(time_to_complete * i , "hours").toDate()
              console.log('date', date);
              console.log('new date', new Date());
              let obj = Object.assign({}, {
                total_followers: result.total_followers,
                key: i,
                date: date
              });

              var j = schedule.scheduleJob(date, function(){
                console.log('The answer to life, the universe, and everything!');
                console.log('result.total_followers >= 200 ', obj.total_followers >= 200 , obj.total_followers);
                let quantity = obj.total_followers >= 200 ? 200 : obj.total_followers
                console.log('quantity', quantity);
                module.exports.sendRequest({user_id: result.user_id, quantity: quantity}, async (err, resp) => {
                  console.log('for_length', for_length, obj.key+1);
                  if (for_length == obj.key+1) {
                    console.log('done');
                    console.log('result.id', result.id, result._id);
                    Order.updateOne({_id: result.id}, {done: true}).then(async (update) => {
                      let order = await Order.findOne({_id: result.id})
                      console.log('order', update, order);
                    });
                  }else {
                    let order = await Order.findOne({_id: result.id})
                    Order.updateOne({_id: result.id}, {
                      followers_sent: quantity+order.followers_sent,
                      previous_order_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                      next_order_time: moment(order.next_order_time).add(time_to_complete , "hours").format("YYYY-MM-DD HH:mm:ss")
                    }).then(async (update) => {
                      let order = await Order.findOne({_id: result.id})
                      console.log('order',  order);
                    });
                  }
                });
              });
              if (result.total_followers >= 200) {
                result.total_followers = result.total_followers - 200
              } else {
                result.total_followers = result.total_followers - result.total_followers
              }
            }
          }


        }
        cb(null, {success: true})


      })


    }).catch((err) => {
      console.log('err', err);
      // if (err) return cb({success: false, err: err});
    });


  },

  sendRequest: (data, cb) => {
    // setTimeout(() => {
    //   console.log('sendRequest', data);
    //     cb(null, {success: true})
    //
    // }, 200);
    request(`http://microks.ir/api/instagram?hash=${hash}&type=order_user&follow_id=${data.user_id}&buy=${data.quantity}`, (err, res, body) => {
      if (err) cb({success: false, err: err});

      cb(null, {success: true})

      // cb(null, {success: true, body: body})
    })
  },

  cron: async (cb) => {

    // console.log('running a task every minute');
    let orders = await Order.find({done: false});
    async.eachOf(orders, (order, index, nextOrder) =>{
      let followers = order.total_followers - order.followers_sent
      if (followers <= 200) {
        let date = moment(order.next_order_time).toDate()

        if (moment() > date) {
          //past
          module.exports.sendRequest({user_id: order.user_id, quantity: followers}, async (err, resp) => {

            Order.updateOne({_id: order.id}, {done: true}).then(async (update) => {
              let element = await Order.findOne({_id: order.id})
            });
          })
        } else {
          var j = schedule.scheduleJob(date, function(){
            console.log('The answer to life, the universe, and everything!');
            module.exports.sendRequest({user_id: order.user_id, quantity: followers}, (err, resp) => {

              Order.updateOne({_id: order.id}, {done: true}).then(async (update) => {
                console.log('update', update);
              });
            });
          });
        }
        nextOrder()

      } else {
        let for_length = Math.ceil((followers / 200) + 1)
        for (var i = 1; i < for_length; i++) {//need do fix length

          let date = moment().add(time_to_complete * i , "hours").toDate()
          let obj = Object.assign({}, {
            total_followers: followers,
            key: i,
            date: date
          });

          var j = schedule.scheduleJob(date, function(){

            let quantity = obj.total_followers >= 200 ? 200 : obj.total_followers
            module.exports.sendRequest({user_id: order.user_id, quantity: quantity}, async (err, resp) => {
              if (for_length == obj.key+1) {
                console.log('done');
                Order.updateOne({_id: order.id}, {done: true}).then(async (update) => {
                  console.log('update', update);
                });
              }else {
                let element = await Order.findOne({_id: order.id})
                Order.updateOne({_id: order.id}, {
                  followers_sent: quantity+element.followers_sent,
                  previous_order_time: moment().format("YYYY-MM-DD HH:mm:ss"),
                  next_order_time: moment().add(time_to_complete , "hours").format("YYYY-MM-DD HH:mm:ss")
                }).then(async (update) => {
                  console.log('update', update);
                });
              }
            });
          });
          if (followers >= 200) {
            followers = followers - 200
          } else {
            followers = followers - followers
          }
        }
        nextOrder()

      }
    })
    // let date = moment("2019-09-03 22:18:40").toDate();
    // console.log('date', date);
    // console.log('new date', new Date());
    //
    // var j = schedule.scheduleJob(date, function(){
    //   console.log('The answer to life, the universe, and everything!');
    //   j.reschedule(date)
    // });
    // console.log('j', j);

  },

  getUserId: (username, cb) => {
    const BASE_URL = `https://www.instagram.com/${username}/`;
    /* Send the request and get the html content */
    // let response = await request(
    //     BASE_URL,
    //     {
    //         'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    //         'accept-encoding': 'gzip, deflate, br',
    //         'accept-language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
    //         'cache-control': 'max-age=0',
    //         'upgrade-insecure-requests': '1',
    //         'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
    //     }
    // );

    request(BASE_URL,
      {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
        'cache-control': 'max-age=0',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
      }, (err, response, body) => {

        /* Initiate Cheerio with the response */
        // console.log(JSON.parse(response));
        let $ = cheerio.load(body);



        /* Get the proper script of the html page which contains the json */
        let array = [4, 3]

        for (var i = 0; i < array.length; i++) {
          let script = $('script').eq(array[i]).html();
          try {
            let { entry_data: { ProfilePage : {[0] : { graphql : {user} }} } } = JSON.parse(/window\._sharedData = (.+);/g.exec(script)[1]);
            console.log(user.id);
            /* Output the data */

            return cb(null, {success: true, id: user.id})
          } catch (e) {
            if (array.length === i+1) {
              return cb({success: false, message: "something wrong with: "+username})
            }
          }
        }
        // console.log('script', script);
        /* Traverse through the JSON of instagram response */


      })
  },
}
