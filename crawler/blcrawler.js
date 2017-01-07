var Crawler = require("crawler").Crawler;
var hosters = require("./hosters");
var database = require("./database");
var BRAINLOVERS = require("./brainlovers");

if(require.main === module){
	console.log('Please call main.js directly to start the crawler');
	process.exit();
}

function Blcrawler(settings){
	this.correct = "this is blcrawler";
	this.crawler = null;
	this.settings = settings;
	this.running = false;
	this.queuedUrls = [];
	this.savedTutorials = null;
	this.tasks = new BRAINLOVERS.tasks();
	
	this.init = function(callback){
		var base = this;
		
		this.settings.callback = function(error, result, $){
			base.callback(error, result, $);
		};
		
		this.settings.onDrain = function(){
			base.onDrain();
		};
		
		database.savedTutorials(function(tutorialsList){
		
			base.savedTutorials = tutorialsList;
			bl.info('Found tutorials for ' + Object.keys(tutorialsList).length +
					" hoster inside the database.");	
			
			base.afterSavedPagesReceived(callback);			
		});

		
	};
	
	this.afterSavedPagesReceived = function(callback){
		this.crawler = new Crawler(this.settings);
		
		bl.info('Brainlovers crawler booted.');	
		this.running = true;
		callback();
	};	

	
	this.findHoster = function(result){
		var host = result.window.location.host;
	    var urlString = result.uri;

	    var hoster = hosters.get(host);
	    if(!hoster){
	        console.log(clc.red("HOSTER UNKNOWN " + host));
	        return false;
	    }
	    
	    return hoster;
	};
	
	this.onDrain = function(){
		bl.success('Page is completely crawled');
	};

	this.callback = function(error, result, $){		
		var base = this;
	    var hoster = this.findHoster(result);
	    if(!hoster) return false;

	    //Analyse site: is it a leaf? and get siteid
	    var siteAnalyse = hoster.analyseSite(result.uri);

	    var siteId = siteAnalyse.siteId;
	    var isLeaf = siteAnalyse.isLeaf;
	        
	    var allreadySaved = siteId && this.isAllreadySaved(hoster.hostName, siteId);
	    
	    if(allreadySaved){
	    	bl.log('Tutorial allready saved ' + siteId);
	    	return false;
	    }
	    
	    var consoleOutput = "Analyse site " + result.uri;	    

	    var tutorialLinks = hoster.getTutorialLinks($);

	    if(isLeaf){
	        consoleOutput += " Leaf: TRUE";

	        var tutorial = hoster.analyseTutorial($, result, siteId);

	        consoleOutput += " Tutorial found: " + tutorial.title;
	        
	        //stats.pagesFound++;
	        tutorial.save(function() {  base.afterTutorialSave(tutorial); } );

	        hoster.addPage(siteId, tutorial);
	    } else {
	        consoleOutput += " Leaf: FALSE";
	        consoleOutput += " - Links: " + $("a").length + " / " + tutorialLinks.length;

	    }

	    bl.log(consoleOutput);

	    
	    for(var id in tutorialLinks){
	        var tutorialLink = tutorialLinks[id];          
	        
	        this.queue(tutorialLink, hoster.hostName);
	    };
	    
	    var doneTask = this.tasks.findByUrl(result.uri);
	    if(doneTask) doneTask.finish();
	    
	    
	};
	
	this.isAllreadySaved = function(hostName, pageKey){
		if(bl.isNormalInteger(pageKey)) pageKey = parseInt(pageKey);
		
		var tutorialsList = this.savedTutorials[hostName];
		
		if(!tutorialsList) return false;
		
		return tutorialsList.indexOf(pageKey) != -1;
	};
	
	this.afterTutorialSave = function(tutorial){
		bl.success('Tutorial saved: ' + tutorial.hoster + ' ' + tutorial.pageKey + ' | ' + tutorial.title);
	};
	
	this.queue = function(url, hostName){
		//bl.log('Crawler queued: ' + url);	
		if(this.queuedUrls.indexOf(url) != -1){
			//bl.error('URL allready checked ' + this.queuedUrls.length);
			return false;
		}		
		
		var task = this.tasks.findByUrl(url);
		
		if(task && task.analysed){
			bl.error('Task allready analysed');
			return false;
		}
		
		var currentTask = new BRAINLOVERS.task(url, hostName, null);        
	    currentTask.save(function(dbObject){ 
	    	// task saved	    	
	    });
	    
	    this.tasks.add(currentTask.url, currentTask);
		
		this.queuedUrls.push(url);
		this.crawler.queue(url);
	};
};

var defaultSettings = {
	"maxConnections" : 10,
	"forceUTF8": true,
	"cache" : false,
	"skipDuplicates": false,
	"userAgent" : "blcrawler"
};

var blcrawler = new Blcrawler(defaultSettings);

module.exports = blcrawler;