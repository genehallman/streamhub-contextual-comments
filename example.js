define(function(require) {
    var Hub = require('streamhub-sdk');
    var View = require('streamhub-contextual-comments');

    return function(el) {
        var streams = Hub.StreamManager.create.livefyreStreams({
            network: "labs-t402.fyre.co",
            environment: "t402.livefyre.com",
            siteId: "303827",
            articleId: 'contextual_1'
        });
        window.streams = streams;
        var view = new View({
            el: el,
            streams: streams,
            streamName: 'main',
            lftoken: "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJkb21haW4iOiAibGFicy10NDAyLmZ5cmUuY28iLCAiZXhwaXJlcyI6IDEzNzUwNjEwNTguNjkwOTg3LCAidXNlcl9pZCI6ICJzeXN0ZW0ifQ.IPFGGW0TjjPa0Wx12aGfwUqXaMNgixeOIComNQgOV58"
        });
        
        streams.bind(view).start();
         
        return view;
    };
});
