var BRAINLOVERS = require("./../brainlovers");
var hosters = new BRAINLOVERS.hosters();

var oberprima_com =  new BRAINLOVERS.hoster("oberprima.com", {
    analyseSite: function(urlString){
        var vParam = BRAINLOVERS.helperGetParameterByName("v", urlString);

        var isLeaf = (vParam != false);
        var siteId = vParam;

        return {isLeaf: isLeaf, siteId: siteId};
    },
    getTutorialLinks: function($){
        var tutorialLinks = [];
        var base = this;

        $("a").each(function(index,elem){
            var cUrlString = $(elem).attr('href');
            var vParam = BRAINLOVERS.helperGetParameterByName("v", cUrlString);

            if(cUrlString.indexOf("oberprima.com") === -1 &&
                (cUrlString.indexOf(".")) != -1) return true;
            //if(!vParam ) return true;

            if(vParam && base.hasPage(vParam)){
                return true;
            }

            if(cUrlString.indexOf(("http")) === -1){
                var cHref = "https://oberprima.com" + cUrlString;
            } else{
                var cHref = cUrlString;
            }

            tutorialLinks.push(cHref);
        });

        return tutorialLinks;
    },
    analyseTutorial: function($, result, siteId){
        var title = $('h1').first().text();
        var description = $('.page-text article').first().text();
        var id = siteId;
        var url = result.uri;
        var urlParameterString = url.split("oberprima.com");
        urlParameterString = urlParameterString[1];

        var selfLink = $("a[href='" + urlParameterString + "']");
        if(selfLink.length > 0){
            title = selfLink.first().text();
        }

        var page = new BRAINLOVERS.page(id, url, "oberprima.com");
        page.setTitle(title);
        page.setDescription(description);

        return page;
    }
});

module.exports = oberprima_com;