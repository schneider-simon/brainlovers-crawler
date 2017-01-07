var BRAINLOVERS = require("./brainlovers");
GLOBAL.bl = require('./brainloversHelpers');


var database = require("./database");
var taskmanager = require("./taskmanager");
var commandPanel = require("./command");
var blcrawler = require("./blcrawler");
var youtubecrawler = require("./youtube");


var stats = {
	pagesFound: 0
};

var settings = {
	maxPages: 10000
};

/**
 * 
 * Start the crawler
 * 
 */

/**
 * Step 0: Say hello
 */
bl.info('::::::: Welcome to the brainlovers.com crawler :::::::');

/**
 * Step 1: Connect to the database
 */
database.init(afterDatabaseInit);

/**
 * Step 2: Load hoster files
 */
var hosters = require("./hosters");

/**
 * Step 3: Load tasks from database into the taskmanager
 */
function afterDatabaseInit(){
	taskmanager.init(afterTaskmanagerInit);
}

/**
 * Step 3: Init crawler
 */
function afterTaskmanagerInit(){
	blcrawler.init(afterCrawlerInit);
	youtubecrawler.init();
}

/**
 * Step 2: Start Command panel
 */
function afterCrawlerInit(){	
	commandPanel.init();
}









