//quobit_index.js

// PROJECTS TO DO
// Create "Develop" subdomain
// Make things look pretty
// User handling - Set in "Events", triggered in "Event" if doesn't exist


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




