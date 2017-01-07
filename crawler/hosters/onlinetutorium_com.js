var BRAINLOVERS = require("./../brainlovers");
var hosters = new BRAINLOVERS.hosters();

var onlinetutorium_com = new BRAINLOVERS.hoster("www.onlinetutorium.com", {
    analyseSite: function(urlString){
        var vParam = BRAINLOVERS.helperGetParameterByName("products_id", urlString);

        var isLeaf = (vParam != false);
        var siteId = vParam;

        return {isLeaf: isLeaf, siteId: siteId};
    },
    getTutorialLinks: function($){
        var tutorialLinks = [];
        var base = this;

        $("a").each(function(index,elem){
            var cUrlString = $(elem).attr('href');
            var vParam = BRAINLOVERS.helperGetParameterByName("products_id", cUrlString);

            if(cUrlString.indexOf("onlinetutorium.com") === -1 &&
                (cUrlString.indexOf(".")) != -1) return true;
            //if(!vParam ) return true;

            if(cUrlString.indexOf("void") != -1) return true;

            if(vParam && base.hasPage(vParam)){
                return true;
            }

            if(cUrlString.indexOf(("http")) === -1){
                var cHref = "http://www.onlinetutorium.com/" + cUrlString;
            } else{
                var cHref = cUrlString;
            }

            tutorialLinks.push(cHref);
        });

        return tutorialLinks;
    },
    analyseTutorial: function($, result, siteId){
        var title = $('.cont_heading_td .left_part').first().text().split('»');
        title = title[title.length -1];

        var description = $("*:contains('Beschreibung des Tutoriums:')").parents('div').first().text();
        description = description.replace("<strong>Beschreibung des Tutoriums:</strong>", "");
        description = description.replace("Beschreibung des Tutoriums:", "");
        description = description.replace("<br/>", "");


        var youtube = BRAINLOVERS.helperSearchYoutubeLink($);

        var id = siteId;
        var url = result.uri;

        var page = new BRAINLOVERS.page(id, url, "www.onlinetutorium.com");
        page.setTitle(title);
        page.setDescription(description);
        page.setYoutube(youtube);

        return page;
    }
});


module.exports = onlinetutorium_com;
