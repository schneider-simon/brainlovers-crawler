var database = require("./database");
var BRAINLOVERS = require("./brainlovers");

function Taskmanager(){
	this.savedTasks = null;
	
	this.init = function(callback){
		database.analysedTasks(function( tasks){
			bl.log('Taskmanager loaded, ' + tasks.length + " tasks are in the database");
			this.savedTasks = tasks;
			callback();
		});
	}
}

var taskmanager = new Taskmanager();

module.exports = taskmanager;