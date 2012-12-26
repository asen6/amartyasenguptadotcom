//quobit_index.js

// PROJECTS TO DO
// Add events concept
// --> <> Update models.py to with new "Event" model and connect this to posts
// --> <> Update posting to include event id
// --> <> "Events" page and update urls.py
// --> <> "Create new event" functionality
// --> <> Need to figure out how to send event ID to "Event" page     PRETTY SURE WORKS BUT CAN'T TEST YET
// --> Fix user handling (managing users across pages)
//		--> <> Create "User" in our own database
//		--> <> Save as user in our database (including updating what we get from FB)
//		--> <> Add session tracking to manage user
//		--> <> Update posts to use new user
// --> <> Move login from "Event" to "Events"
// --> Make things look pretty
// --> Make sure valid event was entered ("Create new event" function)
// Create "Develop" subdomain


// 		TABLE OF CONTENTS
// 		0. Global Variables
// 		1. Event Handlers
// 		2. Main



// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// 				0. Global Variables
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------


// Constants
var base_url = "/projects/quobit/";


// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// 				1. Event Handlers
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

// Page ready handler
function init() {
	// Set up event handlers
	$("#signout_link").click(signout_clicked);
}
$(document).ready(init);

function signout_clicked(){
	if (FB.getAuthResponse()) {
		FB.logout(function(response) {
			// TODO: user is now logged out
			window.location.href = base_url;
		});
	}
}

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// 				2. Main
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------


function login() {
	FB.login(function(response) {
		if (response.authResponse) {
			// connected
			set_user();
		} else {
			// cancelled
		}
	},{scope: 'email'});
}

function set_user() {
	FB.api('/me', function(response) {
		temp_username = response.name;
		temp_fbid = response.id;
		temp_email = response.email;

		// Check if user is in database.  If not, add him or her.
		$.post(base_url + "set_user/", "username=" + temp_username + "&fbid=" + temp_fbid + "&email=" + temp_email, function(data, status, xhr) {
			// Do stuff...
			if (data['return_code'] == 1) {
				// error.  more than 1 user with that fbid found...
				return;
			}

		}, "json");
	});
}

function testAPI() {
	console.log('Welcome!  Fetching your information.... ');
	FB.api('/me', function(response) {
		console.log('Good to see you, ' + response.name + '.');
	});
}




