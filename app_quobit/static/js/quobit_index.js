//index.js

// PROJECTS TO DO
// --> Register and sign in
//			--> Appears to work.  Need to do more testing
// Remember user by cookie
// Encrypt password
// Add events concept


// 		TABLE OF CONTENTS
// 		0. Global Variables
// 		1. Event Handlers
// 		2. Main
// 		3. Auxiliary Functions



// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// 				0. Global Variables
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------


// Constants
var base_url = "/projects/quobit/";
var INITIAL_TIMEOUT = 500;
var POLL_TIMEOUT = 1000;

// Page state
var qposts = {};
var qpost_ids = [];
var update_timeout = null;
var update_request = null;
var current_chat_id = -1;
var last_update_id = 0;
var last_server_qpost_id = -1; // tells us the id's to look at for in the server call
var last_qreply_update_id = 0;
var current_time = -1;

// Help page state

// User state
var autoscroll = true;

// Time formatting array
var phrase = ['minute', 'hour', 'day', 'week', 'month', 'year', 'decade'];
var timelength = [60, 3600, 86400, 604800, 2630880, 31570560, 315705600];

// May be set in index.php
var username = null;

var collapse_seconds = 50;

// variables for dealing with new post notifications

// variables for dealing with rebuilding the chat area
var rebuild_chat = false;


// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// 				1. Event Handlers
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------


// Page ready handler
function init() {

	// Set up event handlers
	$("#signin_btn").click(signin_clicked);
	$("#register_btn").click(register_clicked);
	$("#qposts_postbtn").click(post_clicked);
	$("#qreplies_replybtn").click(reply_clicked);
	$("#signout_link").click(signout_clicked);

	// Download the initial posts
	setTimeout(function() { request_update(true, initial_callback) }, INITIAL_TIMEOUT);

	// Check if username is set
	if (username == null) {
		show_login();
	} else {
		hide_login();
	}

	bind_to_enter("#qposts_posttext", "#qposts_postbtn");
	bind_to_enter("#qreplies_replytext", "#qreplies_replybtn");
  
	$.ajaxSetup({"error":function(xhr,textStatus, errorThrown) {   
	// If we get an ajax error, renew the update.
	if (xhr.status != 0) {
		setTimeout(function() { request_update(true) }, POLL_TIMEOUT);
	}
	}});
}
$(document).ready(init);


// Event handler for clicking the register button
function register_clicked(){
	var email_text = escape($("#register_email")[0].value);
	var password_text = escape($("#register_password")[0].value);
	var name_text = escape($("#register_username")[0].value);

	var error_msg = "";

	// Return if something is missing
	if ((email_text == '') || (password_text == '') || (name_text == '')) {
		error_msg = "Error: Please fill out all of the fields";
		$("#register_error").html(error_msg);
		return;
	}

	// Return if email is in improper format
	if (verifyEmail(email_text) == false) {
		error_msg = "Error: Please enter a valid email address";
		$("#register_error").html(error_msg);
		return;
	}

	// Add user to database
	$.post(base_url + "register/", "email=" + email_text + "&password=" + password_text + "&username=" + name_text, function(data, status, xhr) {
		
		if (data['error_code'] == 0) {
			$("#register_email")[0].value = '';
			$("#register_password")[0].value = '';
			$("#register_username")[0].value = '';
			signin(email_text, password_text);
		} else if (data['error_code'] == 1) {
			error_msg = "Error: Email already registered";
		} else {
			error_msg = "Error: Unknown";
		}

		$("#register_error").html(error_msg);

	}, "json");
}

// Event handler for clicking the signin button
function signin_clicked(){
	var email = escape($("#signin_email")[0].value);
	var password = escape($("#signin_password")[0].value);
	signin(email, password);
}

function signin(email, password){
	// Return if there is no text
	if ((email == '') || (password == '')) {
		error_msg = "Error: Please fill out all of the fields";
		$("#signin_error").html(error_msg);
		return;
	}

	// Check if the user is in the database
	$.post(base_url + "signin/", "email=" + email + "&password=" + password, function(data, status, xhr) {
		var error_msg = "";
		if (data['error_code'] == 0) {
			// Update username
			username = data['username'];

			// Hide login area
			$("#signin_email")[0].value = '';
			$("#signin_password")[0].value = '';
			hide_login();
		} else if (data['error_code'] == 1) {
			error_msg = "Error: Email is not registered";
		} else if (data['error_code'] == 2) {
			error_msg = "Error: Incorrect password";
		} else {
			error_msg = "Error: Unknown";
		}

		$("#signin_error").html(error_msg);

	}, "json");

}

function signout_clicked(){
	username = null;
	show_login();
}

// Event handler for clicking the post button
function post_clicked(){
	var qpost_text = escape($("#qposts_posttext")[0].value);
	var raw_qpost_text = $("#qposts_posttext")[0].value;

	// Return if there is no text
	if (qpost_text == '') { return;}

	// Add qpost to database
	$.post(base_url + "send_qpost/", "new_qpost_text=" + qpost_text + "&username=" + username, function(data, status, xhr) {
		// change id of the qpost added above to the one given to it by the server
		if (data['qpost_id'] >= 0) {
			var actual_qpost_id = data['qpost_id'];
			var qpost = new QPost(actual_qpost_id, username, raw_qpost_text, get_unixtime_js());
			qposts[actual_qpost_id] = qpost;
			qpost_ids.push(actual_qpost_id);

			qposts_changed();
			$("#qposts_posttext")[0].value = ""; // only clears if the qpost went through OK
		} else {

		}

		update_request = null;
		update_timeout = window.setTimeout(function() { request_update(); }, POLL_TIMEOUT);
	}, "json");
}

// Event handler for clicking the reply button
function reply_clicked(){
	var qpost_id_here = current_chat_id;

	var qreply_text = escape($("#qreplies_replytext")[0].value);
	var raw_qreply_text = $("#qreplies_replytext")[0].value;

	// Return if there is no text
	if (qreply_text == "") { return;}

	// let something happen if there is a current chat id
	if (current_chat_id != -1) {
		// Add qreply to the database
		$.post(base_url + "send_qreply/", "qpost_id=" + qpost_id_here + "&new_qreply_text=" + qreply_text + "&username=" + username, function(data, status, xhr) {
			// change id of qreply added above to the one given to it by the server
			if (data['qreply_id'] >= 0) {
				var actual_qreply_id = data['qreply_id'];
				
				var qreply = new QReply(actual_qreply_id, qpost_id_here, username, raw_qreply_text, get_unixtime_js());

				var new_qreplies_objects = [];
				new_qreplies_objects.push(qreply);
				//qposts[qpost_id_here].add_qreplies(new_qreplies_objects);

				qposts_changed();
			} else {

			}
			update_request = null;
			update_timeout = window.setTimeout(function() { request_update(); }, POLL_TIMEOUT);
		}, "json");
		$("#qreplies_replytext")[0].value = "";
	}
}


// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// 				2. Main
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

function initial_callback() {
	if (qpost_ids.length > 0) {
		set_current_qpost(qpost_ids[qpost_ids.length - 1]);
		return true;
	} else {
		setTimeout(function() {
			request_update(true, initial_callback);
		},
		POLL_TIMEOUT
		);
		return false;
	}
}

// Show login overlay
function show_login() {
	$("#login_area").fadeIn();
}

// Hide login overlay
function hide_login() {
	$("#login_area").fadeOut();
}


// TODO
function request_update(interrupt, callback) {
	// TODO: multiple event handling stuff...

	if (update_request && interrupt) {
		update_request.abort();
		update_request = null;
	}

	if (update_timeout) {
		window.clearTimeout(update_timeout);
		update_timeout == null;
	}
	get_updates(callback);
}

// function to clear the update_timeout
function abort_update() {
	window.clearTimeout(update_timeout);
	update_timeout = null;
}

// Update posts
function get_updates(callback) {
	var last_qreply_id = 0;
	if (current_chat_id != -1) {
		last_qreply_id = qposts[current_chat_id].last_update_qreply_id;
	}

	update_request = $.getJSON(base_url + "get_all_qposts_and_qreplies/", "current_chat_id=" + current_chat_id + "&last_qreply_id=" + last_qreply_id,
		function(data, status, xhr) {
			var latest_qposts_list = data['qposts'];
			var latest_qreplies_list = data['qreplies'];

			// TODO: Add new posts
			for (var i = 0; i < latest_qposts_list.length; ++i) {
				var curr_qpost = latest_qposts_list[i];
				var curr_id = curr_qpost['qpost_id'];
				var curr_author = curr_qpost['author'];
				var curr_content = curr_qpost['content'];
				var curr_published_on = curr_qpost['published_on'];

				// if post id doesn't exist, add the new post
				if (!qposts[curr_id]){
					var qpost = new QPost(curr_id, curr_author, curr_content, curr_published_on);
					qposts[curr_id] = qpost;
					qpost_ids.push(curr_id);
				} else { // a post by current user, might want to update details (post_ids array should already contain this)
				}

				if (curr_id > last_server_qpost_id) {
					last_server_qpost_id = curr_id; // update count to be used in later update calls
				}
			}

			// Add new replies
			var new_qreplies_objects = [];
			for (var i = 0; i < latest_qreplies_list.length; ++i) {
				var curr_qreply = latest_qreplies_list[i];
				var curr_id = curr_qreply['qreply_id'];
				var curr_qpost_id = curr_qreply['qpost_id'];
				var curr_author = curr_qreply['author'];
				var curr_content = curr_qreply['content'];
				var curr_published_on = curr_qreply['published_on'];

				// check if this qreply id already exists
				var alreadythere = false;

				// remnant of update during post and switch
				if (curr_qpost_id != current_chat_id){ continue;}

				for (var j = 0; j < qposts[curr_qpost_id].qreplies.length; ++j){
					if (qposts[curr_qpost_id].qreplies[j].qreply_id == curr_id){
						alreadythere = true;
						break;
					}
				}

				// add this if this is a new qreply
				if (!alreadythere){
					var qreply = new QReply(curr_id, curr_qpost_id, curr_author, curr_content, curr_published_on);
					new_qreplies_objects.push(qreply);
				}
				if (curr_id > qposts[current_chat_id].last_update_qreply_id) {
					qposts[current_chat_id].last_update_qreply_id = curr_id;
				}
			}
			
			if (new_qreplies_objects.length > 0) {
				var qpost_id = new_qreplies_objects[0].qpost_id;
				if (qposts[qpost_id]) {
					qposts[qpost_id].add_qreplies(new_qreplies_objects);
				}
			}

			// TODO: (like stuff) update using any reply updates if current post id is set

			// We might have changed some data, so trigger an update.
			qposts_changed();

			// Fire the callback if there is one
			var continue_updating = true;
			if (callback) {
				continue_updating = callback();
			}

			// Set a timeout for the next update
			if (continue_updating) {
				if (update_timeout) {
					if (window.DEBUG) {
						//DEBUG.assert(false, "Got multiple timeouts set.");
					}
					window.clearTimeout(update_timeout);
					update_timeout = null;
				}
				update_request = null;
				update_timeout = window.setTimeout(function() { request_update(); }, POLL_TIMEOUT);
			}
		})
	.success(function() {})
	.error(function() { $("#qposts_posttext")[0].value += " error"; })
	.complete(function() {});
}

function qposts_changed() {
	// Loop over the posts, looking for any posts that don't have divs, or ones that are marked updated.

	var current_post_changed = false;
	var container = $("#qposts")[0];

	// loop through all posts here
	for (var i = 0; i < qpost_ids.length; ++i) {
		var qpost_id = qpost_ids[i];
		var qpost = qposts[qpost_id];
		if (qpost) {
			if (qpost.div == null) {
				// Create a div
				qpost.div = qpost_to_dom(qpost);
				if (container.childNodes.length == 0) {
					container.appendChild(qpost.div);
				} else {
					container.insertBefore(qpost.div, container.childNodes[0]);
					$(qpost.div).hide().fadeIn(300);
				}
			} else {
				if (qpost.is_updated && qpost.qpost_id == current_chat_id) {
					qpost.is_updated = false;
					current_post_changed = true;
				}
				update_qpost_div(qpost);
			}
		} else if (window.DEBUG) {
			DEBUG.assert(false, "qpost_ids contained an id that qposts didn't.");
		}
	}

	

	// Rebuild the replies for the current post
	if (current_chat_id != -1 && current_post_changed) {
		// Avoid rebuilding the whole chat (only add on the stuff not currently displayed)
		var container = $("#qreplies")[0];
		var qreplies = qposts[current_chat_id].qreplies;

		// Builds the replies
		if (rebuild_chat) {
			$("#qreplies").empty();
			for (var i=0; i < qreplies.length; i++) {
				qreplies[i].div = qreply_to_dom(qreplies[i]);
				container.appendChild(qreplies[i].div);
				qreplies[i].realized = true;
			}
			rebuild_chat = false; // set to true again by a qpost change
		} else {
			for (var i = 0; i < qreplies.length; i++) {
				if (!qreplies[i].realized) {
					qreplies[i].div = qreply_to_dom(qreplies[i]);
					container.appendChild(qreplies[i].div);
					qreplies[i].realized = true;
				} else {
					if (qreplies[i].qreply_id != -1) {
						// update like counts of anything
						update_qreply_div(qreplies[i]);
					}
				}
			}
		}

		// If autoscroll, we move to the new bottom
		var scroller = document.getElementById("qreplies_scroller");
		var height = scroller.clientHeight;
		var scroll = scroller.scrollHeight;
		var position = scroller.scrollTop;

		// right now have a tolerance. If close enough to the bottom, will move you back
		// issue is with this getting called right after a new chat is loaded in
		// in reality, just want to check for position + height == scroll
	    if (position + height + 150 >= scroll) {
	    	scroller.scrollTop = scroller.scrollHeight;
	    }
	}
}

// Takes a post and builds a div that represents it in the feed.
function qpost_to_dom(qpost) {
	var this_qpost = document.createElement("div");
	this_qpost.id = "qpost_" + qpost.qpost_id;
	$(this_qpost).addClass("qpost");

	var content = document.createElement("div");
	$(content).addClass("qpost_content");
	$(content).html(detect_links(qpost.content));

	// text below content in qpost bubble
	var bottom_text = document.createElement("div");
	$(bottom_text).addClass("qpost_details");

	var posted_by = document.createElement("span");
	posted_by.appendChild(document.createTextNode(qpost.author));
	$(posted_by).addClass("qpost_author");

	var timestamp = document.createElement("span");
	$(timestamp).addClass("qpost_date");
	timestamp.appendChild(document.createTextNode(ShowDate(qpost.published_on)));

	bottom_text.appendChild(posted_by);
	bottom_text.appendChild(timestamp);

	// TODO: Like stuff...
	// TODO: Reply count stuff...
	// TODO: Profile picture stuff...

	this_qpost.appendChild(content);
	this_qpost.appendChild(bottom_text);

	var spacer = document.createElement("div");
	$(spacer).addClass("spacer");
	this_qpost.appendChild(spacer);

	$(this_qpost).mousedown(function() {
		set_current_qpost(qpost.qpost_id);
		$("#qreplies_replytext")[0].focus();
		return false;
	})

	if (current_chat_id == qpost.qpost_id) {
		$(this_qpost).addClass("selected");
	}

	return this_qpost;
}

// post changed
function set_current_qpost(qpost_id) {
	var qpost = qposts[qpost_id];
	qpost.is_updated = false;
	qpost.new_qreplies = 0;

	if (qpost_id == current_chat_id) {
		// Nothing to do
		return;
	}

	// update the time of the last update for previous selected post
	// so that there isn't an immediate collapse...
	if (current_chat_id > 0){
		qposts[current_chat_id].last_update_time = Math.round((new Date()).getTime() / 1000);
	}

	$(".selected").removeClass("selected");
	$(qpost.div).addClass("selected");
	$(qpost.div).removeClass("updated");

	qpost.is_updated = true;
	rebuild_chat = true; // tell updater to rebuild the chat

	current_chat_id = qpost_id;

	qposts_changed();
	$("#qreplies_scroller")[0].scrollTop = $("#qreplies_scroller")[0].scrollHeight;

	request_update(true, function() {
		$("#qreplies_scroller")[0].scrollTop = $("#qreplies_scroller")[0].scrollHeight;
		return true;
	});
}

function update_qpost_div(qpost){
	$("#" + qpost.div.id + " .timestamp").text(ShowDate(qpost.published_on));

	// TODO: Update the like count

	if (qpost.is_updated) {
		// TODO: Replycount stuff...

		$(qpost.div).addClass("updated");
	} else {
		$(qpost.div).removeClass("updated");
	}
}

function qreply_to_dom(qreply) {
	var this_qreply = document.createElement("div");
	this_qreply.id = "qreply_" + qreply.qreply_id;
	$(this_qreply).addClass("qreply");
	$(this_qreply).addClass("row-fluid");

	var content = document.createElement("div")
	$(content).addClass("qreply_content");
	$(content).addClass("span9");
	$(content).html(detect_links(qreply.content));

	// TODO: YouTube stuff...

	var posted_by = document.createElement("div");
	$(posted_by).addClass("qreply_author");
	$(posted_by).addClass("span3");

	var author_name = document.createTextNode(qreply.author);
	posted_by.appendChild(author_name);

	// TODO: Like button stuff...

	this_qreply.appendChild(content);
	this_qreply.appendChild(posted_by);
	return this_qreply;

}

function update_qreply_div(qreply){
	// TODO: Like count stuff...
}



// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
// 				3. Auxiliary Functions
// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------

// Takes two jquery selectors for text fields and buttons and maps the
// enter key for those fields to click the buttons.
function bind_to_enter(text, button) {
	$(text).keypress(function(e) {
		if (e.which == 13) {
		$(button)[0].click();
		return false;
		}
	});
}

// Replaces hyperlinks in a string with <a href> tags
function detect_links(text){
	var result = "";
	var p = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?������]))/i;

	while (true) {
		var matcharray = text.match(p);

		if (matcharray == null || matcharray.length == 0) {
			result = result + text;
			break;
		}

		result = result + RegExp.leftContext;

		var link = RegExp.$1;
        if (link.substr(0,7) == "http://" || link.substr(0,8) == "https://") {
            result = result + "<a href='" + link + "' target='_blank'>" + link + "</a>";
        } else {
            result = result + "<a href='" + "http://" + link + "' target='_blank'>" + link + "</a>";
        }

        text = RegExp.rightContext;
	}
	return result;
}

// date formatting function
function ShowDate(unixtime) // $date -->  time(); value
{
  var a;
  if (current_time < 0) {
    a = new Date();
  } else {
    a = new Date(parseInt(current_time) * 1000);
  }
  var b = new Date(parseInt(unixtime) * 1000)
  var diff = Math.floor((a - b) / 1000) // get number of seconds difference

  // loop through the array to figure out where the difference fits in
  var i = 0;
  for (i = timelength.length - 1; diff < timelength[i] && i >= 0; i--) { }

  if (i < 0) {
    return "less than a " + phrase[0] + " ago";
  }

  var time = a - (diff % length[i]);
  var no = Math.floor(diff / timelength[i]);

  var extra = "";
  if (no != 1) {
    extra = "s";
  }

  return no.toString() + " " + phrase[i] + extra + " " + "ago";
}

function get_unixtime_js() {
	var foo = new Date; // Generic JS date object
	var unixtime_ms = foo.getTime(); // Returns milliseconds since the epoch
	var unixtime = parseInt(unixtime_ms / 1000);
	return unixtime;
}

function verifyEmail(email){
	var status = false;     
	var emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
	if (email.search(emailRegEx) == -1) {
	}
	else {
		status = true;
	}
	return status;
}
