//var orm = require("orm");
//var BRAINLOVERS = require("./brainlovers");
var clc = require('cli-color');

var Sequelize = require('sequelize');

function Database(database, user, password, models){
	
	this.options = {
		logging: false,
		maxConcurrentQueries: 200,
		dialect: 'mysql',
		pool: { maxConnections: 15, maxIdleTime: 120},
	};
	
	this.running = false;
	
	this.sequelize = new Sequelize(database, user, password, this.options);
	this.rareModels = models;
	this.models = null;

	
	this.init = function(callback){
		var base = this;
		bl.notice('Init database: ' + user +'@'+  database + ' ---- ' );
		
		this.initSchema(function(){
			base.afterSchemaCreated(callback);
		});		
			
	};
	
	this.initSchema = function(callback){
		
		this.sequelize.createSchema('crawl').success(function(){
			bl.log('Schema initialised');
			callback();
		});
	};
	
	this.afterSchemaCreated = function(callback){
		var base = this;
		
		this.connect(function(){
			base.afterConnect(callback);			
		});	
	};
	
	this.afterConnect = function(callback){
		this.readModels(this.rareModels);
		this.sync(callback);
		this.running = true;
	};
	
	this.readModels = function(models){
		var base = this;
		base.models = {};
		
		for(key in models){
			var model = models[key];			
			this.models[key] = this.sequelize.define(key, model);
			this.models[key].schema('crawl', '_');
		};				  
	};
	
	this.save = function(type, object, callback){
		var data = {};
		
		for(key in this.rareModels[type]){
			data[key] = object[key];
		}		
		
		
	
		this.models[type].create(data).success(function(dbObject) {
			object._id = dbObject.id;
			object.dbObject = dbObject;
			callback(dbObject);
		});

	};
	
	this.updateObject = function(type, dbObject, keysToUpdate){
		var updateData = {};
		
		for (var i = 0; i != keysToUpdate.length; i++) {
			var keyToUpdate = keysToUpdate[i];
			updateData[keyToUpdate] = dbObject.dataValues[keyToUpdate];
		}
		
		this.models[type].update(
			updateData,
			{ id: dbObject.id }
		).success(function(){
			bl.log('UPDATED ' + type);
		});
		
	};
	
	this.findAll = function(type, options, callback){
		
		return this.models[type].findAll(options).success(function(objects){
			callback(objects);
		});
	};
	
	this.savedTutorials = function(callback){
		this.findAll("Tutorial", {}, function(tutorials){
			var hosters = {};			
			for(key in tutorials){				
				var tutorial = tutorials[key];
				
				if(!hosters[tutorial.hoster]){
					hosters[tutorial.hoster] = [];
				}
				
				hosters[tutorial.hoster].push(tutorial.pageKey);
			}
			
			callback(hosters);
			
		});
	};
	
	this.analysedTasks = function(callback){
		this.findAll("Task", { where: "analysed IS NOT NULL" }, function(tasks){
			callback(tasks);
		});
	};
	
	this.sync = function(callback){
		this.sequelize
		  .sync({ force: true })
		  .complete(function(err) {
		     if (!!err) {
		       bl.error('An error occurred while creating the table:', err);
		     } else {
		       bl.log('Database models are syncronised');		       
		       callback();	       
		     }
		});	
	};
	
	this.createTestData = function(){
		this.models.User.create({
		    username: 'sdepold',
		    birthday: new Date(1986, 06, 28)
		  }).success(function(sdepold) {
		    console.log(sdepold.values);
		  });
	};
	
	this.connect = function(callback){
		this.sequelize.authenticate()
		  .complete(function(err) {
		    if (!!err) {
		    	bl.error('Unable to connect to the database:', err);
		    } else {
		    	bl.success('Connection has been established successfully.');
		      callback();
		    }
		  });
	};
	
}

var databaseModels = {};

databaseModels.Tutorial = {
	pageKey: Sequelize.INTEGER,
	hoster: Sequelize.STRING,
	title: Sequelize.STRING,
	description: Sequelize.TEXT,
	url: Sequelize.TEXT,
	youtube: Sequelize.STRING	
};

databaseModels.Task = {
	url: Sequelize.TEXT,
	hoster: Sequelize.STRING,
	analysed: Sequelize.DATE
};

databaseModels.User = {
	username: Sequelize.STRING,
	description: Sequelize.STRING,
	birthday: Sequelize.DATE
};


databaseModels.Channel = {
	title: Sequelize.STRING,
	description: Sequelize.TEXT,
	image: Sequelize.STRING,
	channelKey: Sequelize.STRING,
	hoster: Sequelize.STRING
};




var database = new Database('brainlovers', 'brainlovers', 'brainlovers-pw', databaseModels);

module.exports = database;




