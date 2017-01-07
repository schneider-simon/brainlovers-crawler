var BRAINLOVERS = require("./brainlovers");
var hosters = new BRAINLOVERS.hosters();

hosters.add("oberprima.com", require('./hosters/oberprima_com'));
hosters.add("www.onlinetutorium.com", require('./hosters/onlinetutorium_com'));

module.exports = hosters;