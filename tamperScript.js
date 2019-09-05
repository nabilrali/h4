let element = $('tbody > tr').eq(0).find("td")
let username, quantity;


//get Username
if (element.eq(4).find("a").attr("href")) {
  username = element.eq(4).find("a").attr("href")
  console.log('username', username);
} else if (element.eq(4).text()) {
  username = element.eq(4).text()
  console.log('username', username);
} else {
  alert("cannot get username")
}

//get quantity

if (element.eq(6).text()) {
  quantity = element.eq(6).text()
}



console.log(username, quantity);

$.ajax({url: "http://localhost:3000?target_user="+username+"&quantity="+quantity, success: function(result){
  console.log('result', result);
  if (result.success) {
    let link;
    for (var i = 0; i < 5; i++) {
      if (element.eq(12).html()) {
        link = element.eq(12).find("div").find("ul").find("li").eq(i).find("ul").find("li").eq(0).find("a").attr("data-href")
        console.log("link", link)
        if (link) {
          return window.location.href = "https://kl200.com"+link
        }else {
          alert('cannot find In progress button');
        }
      }

    }
  } else {

    alert(result.message)
  }


}});
