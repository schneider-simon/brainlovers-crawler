function YoutubeCrawler(){
	this.youtube = require("youtube-api");;
	
	this.authentication = {
			type: "key",
			key: "AIzaSyCQLoU5UTEDZIEQrxS0sZ4x3UBBxf5TSi0"
	};
	
	this.init = function(){
		this.youtube.authenticate(this.authentication);		
		bl.log('Youtube crawler authenticated..');
	};
	
	this.crawlChannel = function(channel){
		var base = this;
		var listOptions = { "part" : "snippet,contentDetails" };
		
		if(channel.id) 			listOptions.id = channel.id;
		if(channel.forUsername)	listOptions.forUsername = channel.forUsername;
		
		this.youtube.channels.list(listOptions, function(err, data){
			base.channelcrawlResult(err, data);
		});
	};
	
	this.channelcrawlResult = function(err, data){
		var base = this;
		var channelInfo = data.items[0];
		
		var channel = {};
		channel.id			= channelInfo.id;
		channel.title		= channelInfo.snippet.title;
		channel.description	= channelInfo.snippet.description;
		channel.image		= channelInfo.snippet.thumbnails.high.url;
		channel.hoster		= "youtube.com";

		
	    var playlistId = channelInfo.contentDetails.relatedPlaylists.uploads;
	   
	    this.readPlaylist(playlistId, function(videos){
	    	base.channelCrawled(channel, videos);
	    });	    
	   
	};
	
	this.channelCrawled = function(channel, videos){
		console.log(channel);		
		
		console.log(videos);
	};
	
	this.readPlaylist = function(playlistId, callback){
		this.readPlaylistPart(playlistId, false, 0, function(videosRaw){
			var videos = [];

			for(videoKey in videosRaw){
				var videoRaw = videosRaw[videoKey];
				
				var video = {};
				video.id = videoRaw.snippet.resourceId.videoId;
				video.title = videoRaw.snippet.title;
				video.description = videoRaw.snippet.description;
				video.image = videoRaw.snippet.thumbnails.high.url
				video.url = "http://youtu.be/" + video.id;
				
				videos.push(video);
			}
			
			callback(videos);
		});
	};
	
	this.readPlaylistPart = function(playlistId, pageToken, pageCounter, callback, totalItems){
		var base = this;
		
		if(!totalItems) totalItems = [];

		bl.log("get playlist " + pageCounter);
		
		var restOptions = {
		    "part": "snippet",
		    "playlistId": playlistId,
		    "maxResults" : 50
		};
		
		if(pageToken) restOptions.pageToken = pageToken;
		
		base.youtube.playlistItems.list(restOptions, function (err, data) {
		    if(err){ bl.error(err); return false;}
		
		    var info = data.pageInfo;
		    var items = data.items;
		    var nextPage = data.nextPageToken;
		
		    console.log("found " + items.length + " total " + totalItems.length  + " next is " + nextPage);
		
		    totalItems = totalItems.concat(items);
		
		    if(nextPage){
		        totalItems.concat(base.readPlaylistPart(playlistId, nextPage, pageCounter +1, callback, totalItems));
		    } else {
		        callback(totalItems);
		    }
		
		});
	};
	
}

var youtubeCrawler = new YoutubeCrawler();

module.exports = youtubeCrawler;

