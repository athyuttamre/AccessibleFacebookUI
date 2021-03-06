var user;

var feedItems = [];

var nextFeedLink;
var previousFeedLink;

var currentItemIndex = 0;
var currentItemID = 0;

/*
* start
* 
* start is executed once the document is ready (equivalent to $('document').ready()), and
* the FB object is loaded. All document functions should be defined in this document,
* and functionality should start within this function.
*/
function start(FB) {
	console.log('Welcome to newsfeed.js!');
	console.log('start has been called with FB object: ' + FB);
	// var w = (window.innerWidth * .6).toString();
	// var h = (window.innerHeight * .6).toString();



	$('#back_button').dwell(1000, true);
	$('#back_button').click(function(){
		parent.history.back();
		console.log("Back was clicked.");
		// alert('clicked');
	});
	$('#home_button').dwell(1000, true);
	$('#home_button').click(function(){
		window.location.href="/";
		console.log("Home was clicked.");
		// alert('clicked');
	});
	$('#like').dwell(1000, true);		
	$('#comment').dwell(1000, true);
	$('#form_input').dwell(1000, true, '#ffffff');


	FB.api('/me', function(response) {
				user = response;
				console.log('Doing this in newsfeed.js, ' + response.name + '.');
			});

	refreshNewsfeed();

	function refreshNewsfeed() {
		FB.api('/me/home', function(response) {
			if(response && !response.error) {
				renderNewsfeed(response);
			} else {
				console.log('Error: could not retrieve newsfeed');
			}
		});
	}

	function renderNewsfeed(newsfeed) {
		console.log(newsfeed);

		nextFeedLink = newsfeed.paging.next;
		previousFeedLink = newsfeed.paging.previous;

		feedItems = newsfeed.data;
		console.log(feedItems);
		renderItem(currentItemIndex);
	}

	function renderNext() {
		currentItemIndex = 0;
		request("GET", nextFeedLink, "", renderNewsfeed, "Couldn't load next feed.");
	}

	function renderPrevious(feedItems) {
		currentItemIndex = 0;
		request("GET", previousFeedLink, "", renderNewsfeed, "Couldn't load previous feed.");
	}

	function request(type, url, body, callback, message) {
		var req = new XMLHttpRequest();
		req.open(type, url, true);

		req.addEventListener('load', function(e) {
			if(req.status == 200) {
				var content = req.responseText;
				callback(JSON.parse(content));
			}
			else {
				console.log(message);
			}
		});

		req.send(body);
	}

	function renderItem(index) {
		$('#loading').hide();
		var item = feedItems[index];
		console.log("Rendering item " + index);
		console.log(item);
		currentItemID = (item.object_id) ? item.object_id : item.id;

		if(item.from) {
			var from_id = item.from.id
			var from_name = item.from.name
			var from_photo;

			FB.api("/" + from_id + "/picture",{"type": "large"}, function(response) {
				if (response && !response.error) {
					from_photo = response.data.url;
					$('#from_photo').html("<img src='" + from_photo + "'/>");
					$('#from_name').html(from_name);
				}
				else {
			    	console.log("Error fetching profile picture.");
			      	console.log(response);
			    }
			});
		}

		renderLikes(item);

		var story = (item.story) ? item.story : "";
		var description = (item.description) ? item.description : "";
		var message = (item.message) ? item.message : "";
		var picture = (item.picture) ? item.picture : "";
		
		if(picture.endsWith("_s.jpg")) {
			picture = picture.substring(0, picture.length - 5) + "n.jpg";
		}

		console.log('PICTURE ' + picture);

		$("#from").html(from.name);
		$("#story").html(story);
		$("#description").html(description);
		$("#message").html(message);
		$("#image").html("<img id='inner_img' src='" + picture + "'>");



		//dynamically formats image
		// var w = '600px';
		// var h = '480px';
		
		// var w = (window.innerWidth * .6).toString()+'px';
		// var h = (window.innerHeight * .4).toString()+'px';
		// // var w2 = (window.innerWidth * .4).toString()+'px';
		// var h2 = (window.innerHeight * .6).toString()+'px';

		// $('#from').css('height', h2);
		// $('#image > img').css('max-height', h);
		// $('#from').css('width', w);
		// $('#image > img').css('max-width', w);
		// console.log('height: '+h);

		// if(picture){
		// 	$('#image > img').css('min-height', h2);
		// 	$('#image > img').css('min-width', w2);
		// }
		
	}

	function renderLikes(item) {
		if(item.likes) {
			FB.api(
			    "/" + currentItemID + "/likes?summary=true",
			    function (response) {
			      if (response && !response.error) {
			        var likes = response;
			        console.log(likes);
			        var total_count = likes.summary.total_count;

			        var likesText = "";

			        if(likes.data.length > 3) {
			        	for(var i = 0; i < 3; i++) {
			        		likesText += likes.data[i].name;
			        		if(i != 2) likesText += ", ";
			        	}

			        	var leftoverLikes = total_count - 3;
			        	likesText += " and " + leftoverLikes;

			        	if(leftoverLikes == 1) likesText += " other person like this post.";
			        	else likesText += " others like this post.";
			        } else {
			        	if(likes.data.length == 1) {
			        		likesText += likes.data[0].name + " likes this post.";
			        	} else if(likes.data.length == 2) {
			        		likesText += likes.data[0].name + " and " + likes.data[1].name + " like this post.";
			        	} else {
			        		for(var i = 0; i < likes.data.length; i++) {
				        		if(i != likes.data.length - 1) {
				        			likesText += likes.data[i].name + ", ";
				        		} else {
				        			likesText += " and " + likes.data[i].name + " like this post.";
				        		} 
				        	}
			        	}
			        }

			        $("#likes").html(likesText);
			      }
			      else {
			      	console.log("Error retrieving likes.")
			      	$("#likes").html("");
			      	console.log(response);
			      }
			    }
			);
		} else {
			$('#likes').html("");
		}
	}

	$('#like').click(function(e) {
		e.preventDefault();
		var postID = currentItemID;
		FB.api("/" + postID + "/likes", "POST", function(response) {
			if(response && !response.error) {
				console.log("Succesfully liked post " + postID);
				console.log(response);
				renderLikes(feedItems[currentItemIndex]);
			} else {
				console.log("Error in liking.");
				console.log(response);
			}
		})
	});

	var originalLayoutElements = $('#feedItem, #top_bar, #bottom_bar, #like, #comment, #back_button')
	var commentLayoutElements = $('#commentBox, #submitComment, #comment_back_button')

	$('#comment').click(function(e) {
		e.preventDefault();

		originalLayoutElements.hide();
		commentLayoutElements.show();
		$('#form_input').focus();

		console.log("Comment was clicked.");
	});

	$('#comment_back_button').dwell(1000, true);
	$('#comment_back_button').click(function(e) {
		e.preventDefault();
		console.log("Comment Back was called.");
		commentLayoutElements.hide();
		originalLayoutElements.show();
	});

	$('#submitComment').dwell(1000, true);
	$('#submitComment').click(function(e) {
		e.preventDefault();
		$('#comment_form').submit();
	});

	$('#comment_form').submit(function(e) {
		e.preventDefault();
		var commentBody = $('#form_input').val();
		console.log("Attempting to comment '" + commentBody +"'...");

		FB.api("/" + currentItemID + "/comments", "post", {message:commentBody},  function(response) {
			if(response && !response.error) {
				console.log("Succesfully posted comment.");
				console.log(response);
			} else {
				console.log("Error posting comment!");
				console.log(response);
			}
		});

		$('#form_input').val("");
	});

	$('.next').dwell(1000, true);
	$('.next').click(function(e) {
		e.preventDefault();
		currentItemIndex = (currentItemIndex + 1) % 25;

		if(currentItemIndex == 0) {
			// Get next 25 posts
			renderNext();
		} else {
			renderItem(currentItemIndex);
		}
	});

	$('.previous').dwell(1000, true);
	$('.previous').click(function(e) {
		e.preventDefault();
		currentItemIndex = (currentItemIndex - 1);

		if(currentItemIndex < 0) {
			renderPrevious();
		} else {
			renderItem(currentItemIndex);
		}
	});

	$('#refresh').dwell(1000, true);
	$('#refresh').click(function(e) {
		e.preventDefault();
		currentItemIndex = 0;
		refreshNewsfeed();
	});

	String.prototype.endsWith = function(suffix) {
    	return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}