var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');
var APIkeys = require('./API_keys.js');
var mandrill_client = new mandrill.Mandrill(APIkeys.mandrillAPI);

// Authenticate via OAuth
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: APIkeys.consumer_key,
  consumer_secret: APIkeys.consumer_secret,
  token: APIkeys.token,
  token_secret: APIkeys.token_secret
});

client.posts('johnmlenehan.tumblr.com',function(error,blog){
	latestPosts = []
	var blogPosts = blog.posts;
	for(var key in blogPosts){
		var timeDiff = ((new Date().getTime())-(Date.parse(blogPosts[key].date)))
		var convert = (1000*60*60*24);
		if(timeDiff/convert < 7){
			latestPosts.push(blogPosts[key]);
		}
	};
	console.log(latestPosts.length);
	if(latestPosts.length > 0){
	templateFunc(csvParse(csvFile),latestPosts);
	};
});




var csvFile = fs.readFileSync("friend_list.csv","utf8");
//console.log(csvFile);
var emailTemplate = fs.readFileSync("email_template.html","utf8");



var csvParse = function(csvFile){
	var fileToArray = csvFile.split("\n");
	var headers = fileToArray[0].split(",");
	var arrayOfObj = [];

	for(var i = 1; i < fileToArray.length-1; i++){
		var contact = fileToArray[i].split(",");
		var tempObj = {};
		for(var j = 0; j < contact.length; j++){
			tempObj[headers[j]] = contact[j];
		}
		arrayOfObj.push(tempObj);
	}

return arrayOfObj;
}

//console.log(csvParse(csvFile));

var templateFunc = function(friends,latest) {
	var emailArray = []

	for(var key in friends){
		var firstName = friends[key].firstName;
		var toEmail = friends[key].emailAddress;

		var customizedTemplate = ejs.render(emailTemplate,{
			firstName: firstName,
			numMonthsSinceContact: friends[key].numMonthsSinceContact,
			latestPosts: latest
		});
		sendEmail(firstName,toEmail,"John L","john.m.lenehan@gmail.com","test",customizedTemplate);
		console.log("Sent to "+toEmail);
	}	
}


  function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }










