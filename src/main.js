define(['streamhub-sdk/jquery', 'streamhub-sdk/view', 'streamhub-sdk/content/content'], function($, View, Content) {
    var ContextualCommentView = function(opts) {
        opts = opts || {};
        View.call(this, opts);
        this.selector = opts.selector || 'p';
        this.streams = opts.streams;
        this.streamName = opts.streamName;
        this.lftoken = opts.lftoken || null;
        this.$el = $(this.el).addClass('streamhub-contextual-comments'); 
        this.children = [];

        this.renderActions();
        this.renderCommentPane();
    };
    $.extend(ContextualCommentView.prototype, View.prototype);
    
    ContextualCommentView.prototype.add = function(content, stream) {
        var id = parseInt(content.body);
        if (id) {
            this.children[id] = this.children[id] || {};
            this.children[id].content = content;
            this.children[id].contentView = this.createContentView(content);
        }
    };
    
    ContextualCommentView.prototype.write = function(content, opts, cb) {
        this.streams.get(this.streamName).write(content, opts, cb);
    };

    ContextualCommentView.prototype.renderActions = function() {
        var self = this;
        var paragraphs = this.$el.find(this.selector);

        for (var i = 0; i < paragraphs.length; i++) {
            var j = i;
            var action = $('<i>*</i>')
                .addClass('streamhub-action')
                .attr('data-action-id', i)
                .click(function() {
                    self.clickHandler(j);
                })
                .appendTo(paragraphs[i]);
            this.children[i] = this.children[i] || {};
            this.children[i].action = action;
            this.children[i].paragraph = paragraphs[i];
        }
    };

    ContextualCommentView.prototype.renderCommentPane = function() {
        this.$pane = $('<div></div>')
            .css({
                'position': 'fixed',
			    'right': '-400px',
			    'width': '400px',
			    'top': '0px',
			    'bottom': '0px',
			    'background-color': 'grey',
			    'transition': 'all 300ms ease',
			    'opacity': '0'
            });
                
        this.$el.append(this.$pane);
    };
    
    ContextualCommentView.prototype.clickHandler = function(index) {
	    var self = this;
	    var prevIndex = parseInt(this.$pane.attr('data-action-id')) || -1;
	    var child = this.children[index];
	    
	    if (right === 0 && index == prevIndex) {
	        this.$pane.css({'right':'', 'opacity':''});
	    } else {
		    if (!child.content) {
		        child.content = new Content(index.toString());
		        child.contentView = this.createContentView(child.content);
		    }
	        
	        var sendReply = function(parentContent) {
	            try {
		            self.write("asdf", {lftoken: self.lftoken}, function(err, newContent) {
		               console.log('got here', arguments);
		            });  
	            } catch (ex) {
	               console.log(ex);
	            }         
	        };
	        
	        var replyElement = $('<a>Reply</a>')
	            .click(function() {
	                if (typeof child.content == "LivefyreContent") {
	                    //just send reply
	                    sendReply(child.content);
	                } else {
	                    // first write a parent
	                    self.write(child.content, {lftoken: self.lftoken}, function(err, newContent) {
	                        child.content = newContent;
	                        child.contentView = self.createContentView(newContent);
	                        sendReply(child.content);
	                    });
	                } 
	            });
	        this.$pane.empty();
		    this.$pane.attr('data-action-id', index);
	        this.$pane.append(child.contentView.el);
	        this.$pane.append(replyElement);
		    console.log('here');
		    
		    var right = parseInt(this.$pane.css('right'));
	        this.$pane.css('right','0px');
	        this.$pane.css('opacity', '1');
	    }
    };
    
    return ContextualCommentView;
});
