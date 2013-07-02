define([
    'streamhub-sdk/jquery',
    'streamhub-sdk/view',
    'streamhub-sdk/content/content'
], function($, View, Content) {
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
        var id = parseInt($(content.body).text());

        if (id != NaN && !content.parentId) {
            this.children[id] = this.children[id] || {};
            this.children[id].content = content;
            this.children[id].contentView = this.createContentView(content);
            this.children[id].contentView.render();  
        } else {
            this.children.map(function(c) { return c.render() });
        }
    };
    
    ContextualCommentView.prototype.write = function(content, opts, cb) {
        this.streams.get(this.streamName).write(content, opts, cb);
    };

    ContextualCommentView.prototype.renderActions = function() {
        var self = this;
        var paragraphs = this.$el.find(this.selector);

        for (var i = 0; i < paragraphs.length; i++) {
            var action = $('<i style="width:19px;height:17px;display:inline-block;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAARCAYAAAA/mJfHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJFJREFUeNpi/DlPzYGBgWEBEMszkA8msiXeLGAEGvYByOFnoBwEMlHJIBAwYGKgIhg1bNQwPIZdpJJZG1iARAAQTwBiATRJEF8fTewhED/AYtAEYN68wPj//3+s1vyarw4qAPYjCS0E4gKgpg+4nMZChPM/Qg1ZQEghIcNA4ZkA8gIxgYbPMJABDvi8hQ4AAgwA1hYiQRmxJUsAAAAASUVORK5CYII=);"></i>')
                .addClass('streamhub-action')
                .attr('data-action-id', i)
                .click(function() {
                    var index = parseInt($(this).attr('data-action-id'));
                    self.clickHandler(index);
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
			    'opacity': '0',
			    'overflow-y': 'scroll',
			    'overflow-x': 'hidden'
            });
                
        this.$el.append(this.$pane);
    };
    
    ContextualCommentView.prototype.clickHandler = function(index) {
	    var self = this;
	    var prevIndex = parseInt(this.$pane.attr('data-action-id'));
	    prevIndex = prevIndex != NaN ? prevIndex : -1;
	    var child = this.children[index] || {};
        var right = parseInt(this.$pane.css('right'));
	    	    
	    if (right === 0 && index == prevIndex) {
	        this.$pane.css({'right':'-400px', 'opacity':''});
	    } else {
	        var sendReply = function(parentContent, text) {
	            try {
	                var content = new Content(text);
	                content.parentId = parentContent.id;
		            self.write(content, {lftoken: self.lftoken}, function(err, newContent) {
		               console.log('got here', arguments);
		            });  
	            } catch (ex) {
	               console.log(ex);
	            }         
	        };
	        
	        var replyElement = $('<a>Reply</a>')
	            .click(function() {
	                if (child.content) {
	                    //just send reply
	                    sendReply(child.content, $('input.replyInput').val());
	                } else {
	                    // first write a parent
		                child.content = new Content(index.toString() + " " + Date.now());
		                child.contentView = self.createContentView(child.content);
		                child.contentView.render();
		                
	                    self.write(child.content, {lftoken: self.lftoken}, function(err, newContent) {
	                        child.content = newContent;
	                        child.contentView = self.createContentView(newContent);
	                        child.contentView.render();
	                        self.$pane.prepend(child.contentView.el);
	                        sendReply(child.content);
	                    });
	                } 
	            });
	        this.$pane.empty();
		    this.$pane.attr('data-action-id', index.toString());
	        this.$pane.append((child.contentView || {}).el);
	        this.$pane.append($('<input class="replyInput"></input>'));
	        this.$pane.append(replyElement);
		    
	        this.$pane.css('right','0px');
	        this.$pane.css('opacity', '1');
	    }
    };
    
    ContextualCommentView.prototype._createContentView = ContextualCommentView.prototype.createContentView;
    ContextualCommentView.prototype.createContentView = function(content) {
        var self = this;
        window.self = this;

        var contentView = self._createContentView(content);
        
        contentView.template = function(context) {
            window.content = content;
            window.context = context;
            window.createCV = self._createContentView;
            
            return context.replies.map(function(c) {
                return self._createContentView(c).render().el.innerHTML;
            }).join("");
        };
        
        return contentView;
    };
    
    return ContextualCommentView;
});
