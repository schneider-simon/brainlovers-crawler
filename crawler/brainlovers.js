var BRAINLOVERS = {};
var database = require("./database");

BRAINLOVERS.hosters = function(){
    this.list = new BRAINLOVERS.list();

    this.add  = function(id, hoster, options){
        return this.list.add(id, hoster, options);
    };
    this.get = function(id){
        return this.list.get(id);
    };
};

BRAINLOVERS.hoster = function(hostName, options){
    this.hostName = hostName;
    this.pages = new BRAINLOVERS.pages();

    this.analyseSite = function(urlString){
        return {isLeaf: false, siteId: false};
    };

    this.getTutorialLinks = function($){
        return [];
    };

    this.analyseTutorial = function($, result, siteId){
        return false;
    };

    if(options.analyseSite) this.analyseSite = options.analyseSite;
    if(options.getTutorialLinks) this.getTutorialLinks = options.getTutorialLinks;
    if(options.analyseTutorial) this.analyseTutorial = options.analyseTutorial;


    this.addPage = function(index,page){ return this.pages.add(index,page); };
    this.hasPage = function(index){ return this.pages.has(index); };

    this.dump = function(){
        console.log("::DUMP HOSTER: " + this.hostName + " - " + this.pages.count() + " pages");
        var pages = this.pages.getAll();
        for(var pageId in pages){
            var page = pages[pageId];
            page.dump();
        }
    };

};

BRAINLOVERS.pages = function(){
    this.list = new BRAINLOVERS.list();

    this.getAll = function(){
        return this.list.all;
    };

    this.count = function(){
        var all = this.getAll();

        if(all)
            return Object.keys(all).length ;
        else
            return 0;
    };

    this.add = function(id, page){
      return this.list.add(id, page);
    };

    this.has = function(id){
        return this.list.has(id);
    };
};

BRAINLOVERS.tasks = function(){
    this.list = new BRAINLOVERS.list();

    this.getAll = function(){
        return this.list.all;
    };
    
    this.findByUrl = function(url){
    	 var allTasks = this.getAll();
    	 
    	 if(!allTasks) return false;
    	 
    	 if(allTasks[url]) 	return allTasks[url];
    	 else				return false;   	 
    	
    };

    this.count = function(){
        var all = this.getAll();

        if(all)
            return Object.keys(all).length ;
        else
            return 0;
    };

    this.add = function(id, page){
      return this.list.add(id, page);
    };

    this.has = function(id){
        return this.list.has(id);
    };
};

BRAINLOVERS.list = function(){
    this.all = {};

    this.add = function(id, object){
        this.all[id] = object;
    };


    this.has = function(id){
        return typeof(this.all[id]) === "object";
    };

    this.get = function(id){
        if(this.has(id))       return this.all[id];
        else                   return false;
    };
};



BRAINLOVERS.page = function(id, url, hoster){	
    this.id = id;
    
    this.url = url;
    this.hoster = hoster;

    this.pageKey = id;
    this.title = false;
    this.description = false;
    this.youtube = false;

    this.setTitle = function(title){
        this.title = title.trim().substr(0, 100);
    };

    this.setDescription = function(description){
        this.description = description.trim().substr(0, 1500);
    };

    this.setYoutube = function(youtubeKey){
      this.youtube = youtubeKey;
    };

    this.dump = function(){
      console.log("Page #" + this.id + " " + this.title);
    };

    this.save = function(callback){
    	database.save('Tutorial', this, callback);
    };
};

BRAINLOVERS.task = function(url, hoster , analysed){	  
	this.id = null;
    this.url = url;
    this.hoster = hoster;
    this.analysed = analysed;
    this.dbObject = null;

    this.save = function(callback){
    	database.save('Task', this, callback);
    };
    
    this.finish = function(){
    	if(!this.dbObject) return false;
    	
    	this.analysed = Date.now();
    	this.dbObject.analysed = this.analysed;
    	
    	database.updateObject('Task', this.dbObject, ['analysed']);

    };
};

BRAINLOVERS.channel = function(title, description, image, channelKey, hoster){
	
};

BRAINLOVERS.helperGetParameterByName = function(name, url){
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};


BRAINLOVERS.helperSearchYoutubeLink = function($){
    var youtubeKey = false;

    $('iframe[src*="youtube.com"]').each(function() {
        var url = $(this).attr("src");
        var id =  BRAINLOVERS.helperYoutubeParser(url);

        if(id){
            youtubeKey = id;
            return false;
        }
    });

    return youtubeKey;
};


BRAINLOVERS.helperYoutubeParser = function(url){
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[2].length==11){
        return match[2].trim();
    }else{
        return false;
    }
};



module.exports = BRAINLOVERS;