// qpost.js

function QPost(qpost_id, author, content, published_on) {
	this.qpost_id = qpost_id;
	this.author = author;
	this.content = content;
	this.published_on = published_on;
	this.new_qreplies = 0;
	this.is_updated = false;
	this.div = null;
	this.last_update_time = current_time; // set last update time to page load time
	this.qreplies = [new QReply(-1, qpost_id, author, content)];
	this.last_update_qreply_id = 0;
	this.qreplies_hash = {};
}

QPost.prototype.add_qreplies = function(new_qreplies) {
	for (var i = 0; i < new_qreplies.length; ++i) {
		if (!(new_qreplies[i].qreply_id in this.qreplies_hash)) {
			this.qreplies_hash[new_qreplies[i].qreply_id] = true;
			this.qreplies.push(new_qreplies[i]);
			this.is_updated = true;
		}
	}
}

function QReply(qreply_id, qpost_id, author, content, published_on) {
	this.qreply_id = qreply_id;
	this.qpost_id = qpost_id;
	this.author = author;
	this.content = content;
	this.published_on = published_on;
	this.realized = false;
	this.div = null;
}