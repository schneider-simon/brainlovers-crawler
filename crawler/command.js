var prompt = require('prompt');
var database = require("./database");
var blcrawler = require("./blcrawler");
var BRAINLOVERS = require("./brainlovers");

prompt.message = "Whats up doc?";
prompt.delimiter = " > ";


var commandPanel = {
	paused : false,		
	init : function(){
		bl.log('Welcome to commandpanel, master');
		
		commandPanel.command();
	},
	command : function(){
		prompt.get(['command'], function (err, result) {
			if(err){
				bl.info('');
				bl.info('Programm canceled ... Good night');
				bl.info('================================');
				return false;
			}
			
			//Do the work
			commandPanel.runCommand(result.command);
			
			if(commandPanel.paused) return false;
			
			//Repeat
			commandPanel.command();
		});
	},
	unpause : function(){
		if(commandPanel.paused){
			commandPanel.paused = false;
			commandPanel.command();
		}
	},
	runCommand : function(command){
		switch(command){
			case "crawl":
				bl.info('Start the crawl :D');
				commandPanel.paused = true;
				blcrawler.queue("https://oberprima.com", "oberprima.com");
				//blcrawler.queue("http://www.onlinetutorium.com", "www.onlinetutorium.com");
				
				break;			
			case "database:test":
				var i = 0;
				setInterval(function() {
			        i++;
			        bl.info('Start saving ' + i);
			        
			        var currentTask = new BRAINLOVERS.task(bl.randomString(150), null);        
				    currentTask.save(function(dbObject){ 
				    	
				    	bl.info('task saved ' + dbObject.id);				    	
				    });
			    }, 1 );				
				break;
			case "database:state":
				database.savedTutorials( function(tutorialsList){
					bl.dump(tutorialsList);
				});
				break;
			case "database:tasks":
				database.analysedTasks(function( tasks){
					bl.dump(tasks.length);
				});
				
				break;
			case ".exit":
				process.exit();
				break;
			default: 
				bl.error('Unknown command.');
		}
	}
};

module.exports = commandPanel;
