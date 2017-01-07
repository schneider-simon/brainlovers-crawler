var clc = require('cli-color');

var helpers = {};


helpers.log = function(text, mode){
	var color = null;
	
	switch(mode){
		case 'success':
			color = clc.white.bgXterm(22);
			break;
		case 'error':
			color = clc.white.bgXterm(88);
			break;
		case 'notice':
			color = clc.xterm(245);
			break;
		case 'info':
			color = clc.yellowBright;
			break;
		default:
			helpers.log(text, 'notice');	
			return false;
			break;
	}
	
	console.log(color('- ' + text));
};

helpers.success = function(text){
	return helpers.log(text, 'success');
};

helpers.error = function(text){
	return helpers.log(text, 'error');
};

helpers.notice = function(text){
	return helpers.log(text, 'notice');
};

helpers.info = function(text){
	return helpers.log(text, 'info');
};

helpers.dump = function(variable, title){	
	var dumpStart = clc.cyanBright("==========DUMP START ");
	dumpStart += clc.magentaBright(title);
	dumpStart += " : ";
	dumpStart += clc.bgMagenta.white(" " + typeof(variable) + ":" + variable.length + " ");
	dumpStart += clc.cyanBright(" ============");
	
	console.log();
	console.log(dumpStart);
	console.log(variable);
	console.log(clc.cyanBright("===========DUMP END============="));
};


helpers.isNormalInteger = function(str) {
	return /^\+?(0|[1-9]\d*)$/.test(str);
};

helpers.randomString = function(length){
	var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

module.exports = helpers;