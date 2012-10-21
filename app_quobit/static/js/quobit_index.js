//index.js


// Constants

// Page state

// Help page state

// User state

// Time formatting array

// May be set in index.php


// variables for dealing with new post notifications

// variables for dealing with rebuilding the chat area

// Page ready handler
function init() {

	// Set up event handlers
	$("#qposts_postbtn").click(post_clicked);
	$("#qreplies_replybtn").click(reply_clicked);

	// NOT SURE WHAT IS GOING ON HERE?????
	$.ajaxSetup({"error":function(xhr,textStatus, errorThrown) {   
	    // If we get an ajax error, renew the update.
	    if (xhr.status != 0) {
	      setTimeout(function() { request_update(true) }, POLL_TIMEOUT);
	    }
	}});
}
$(document).ready(init);

// Update posts
function posts_changed() {}

// Event handler for clicking the post button
function post_clicked(){
	var post_text = escape($("#qposts_posttext")[0].value);
	var raw_post_text = $("#qposts_posttext")[0].value;

	var curr_post_id = -1; // usable in outside scope
	var curr_position = -1;



	// Add post to database
	$.post("/projects/quobit/send_qpost/", "new_qpost_text=" + post_text, function(data, status, xhr) {
		if (data[0] >= 0) {
			// Update posts displayed
			//...
			posts_changed();

			// Clear qposts textbox (if post went through ok)
			$("#qposts_posttext")[0].value = "";
		}
		else{

		}
	}, "json");

	
}

// Event handler for clicking the reply button
function reply_clicked(){}






















