var Crawler = require("crawler").Crawler;
var BRAINLOVERS = {};

var hosters = new BRAINLOVERS.hosters();
hosters.list.add("oberprima.com", new BRAINLOVERS.hoster("oberprima.com"));

var stats = {
    pagesFound: 0

};

BRAINLOVERS.hosters = function(){
    this.list = new BRAINLOVERS.list();

    this.addHoster = this.list.add;
    this.hasHoster = this.list.has;
    this.getHoster = this.list.get;
};

BRAINLOVERS.list = function(){
    this.all = {};

    this.add = function(id, object){
        this.all[id] = object;
    };


    this.has = function(id){
        return this.all[id] != false;
    };

    this.get = function(id){
        if(this.hasPage(id)) return this.all[id];
        else                 return false;
    };
};

BRAINLOVERS.hoster = function(hostName){
    this.hostName = hostName;
    this.pages = new BRAINLOVERS.pages();
};

BRAINLOVERS.pages = function(){
    this.list = new BRAINLOVERS.list();

    this.addPage = this.list.add;
    this.hasPage = this.list.has;
    this.getPage = this.list.get;

};

BRAINLOVERS.page = function(id, href, host){
    this.id = id;
    this.href = href;
    this.host = host;

    this.title = false;
    this.description = false;

    this.setTitle = function(title){
        this.title = title.trim().substr(0, 50);
    };

    this.setDescription = function(description){
        this.description = description.trim().substr(0, 150);
    };
};

BRAINLOVERS.helperGetParameterByName = function(name, url){
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

hosters.oberprima = new BRAINLOVERS.hoster("oberprima.com");

var c = new Crawler({
    "maxConnections" : 10,

    "callback" : function(error, result, $){

        analyseSite(result, $);

    }


});

function analyseSite(result, $ ){
    if(stats.pagesFound >= 3) return false;

    var host = result.window.location.host;
    var urlString = result.uri;
    var isLeaf = false;
    var siteId = false;

    switch(host){
        case "oberprima.com":
            var vParam = BRAINLOVERS.helperGetParameterByName("v", urlString);

            if(vParam) isLeaf = true;
            siteId = vParam;

            break;
        default: return false;
    }

    console.log("=================");
    console.log("Analyse site " + result.uri);
    console.log("Host: " + host);

    var tutorialLinks = getTutorialLinks($, host);

    if(isLeaf){
        console.log("Leaf: TRUE");

        var tutorial = analyseTutorial($, host, result, siteId);

        console.log("Tutorial found: " + tutorial.title);

        stats.pagesFound++;

        if(stats.pagesFound == 3){
            console.log(hosters.oberprima.pages.pages);
            return false;
        }

        hosters.list.get(host).pages.list.add(siteId, tutorial);

    } else {
        console.log("Leaf: FALSE");

        console.log("Links: " + $("a").length + " / " + tutorialLinks.length);
    }



    for(var id in tutorialLinks){
        var tutorialLink = tutorialLinks[id];
        c.queue(tutorialLink);
    };


}

function analyseTutorial($, host, result, siteId){
    var page = false;

    switch (host){
        case "oberprima.com":
            var title = $('h1').first().text();
            var description = $('.page-text article').first().text();
            var id = siteId;
            var url = result.uri;
            var urlParameterString = url.split(host);
            urlParameterString = urlParameterString[1];

            var selfLink = $("a[href='" + urlParameterString + "']");
            if(selfLink.length > 0){
                title = selfLink.first().text();
            }

            page = new BRAINLOVERS.page(id, url, host);
            page.setTitle(title);
            page.setDescription(description);
            break;
    }

    return page;
};

function getTutorialLinks($, host){
    var tutorialLinks = [];

    switch(host){
        case "oberprima.com":
            $("a").each(function(index,elem){
                var cUrlString = $(elem).attr('href');
                var vParam = BRAINLOVERS.helperGetParameterByName("v", cUrlString);

                if(!vParam) return true;

                if(cUrlString.indexOf(("http")) === -1){
                    var cHref = "https://" + host + cUrlString;
                } else{
                    var cHref = cUrlString;
                }

                tutorialLinks.push(cHref);

            });
            break;
    }

    return tutorialLinks;
}

c.queue("https://oberprima.com/mathematik/");