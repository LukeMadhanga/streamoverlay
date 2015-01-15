/**
 * @brief Closure for the overlay plugin that lets you add an overlay to any page
 * @param {object(jQuery)} $ The jQuery object
 * @param {int} count A counter in order to set overlay ids
 */
(function ($, count) {
    
    var methods = {
        /**
         * 
         * @param {object(plain)} opts The options for the plugin:
         * {
         *  backgroundCSS: {},      // A plain object compatible with jQuery's .css() function
         *  body: '',               // The body of the overlay
         *  containerCSS: {},       // A plain object compatible with jQuery's .css() function
         *  onBeforeClose: function // The function to run before the instance is closed. Returning false will cancel execution
         *  onBeforeOpen: function  // The function to run before the instance is opened. Returning false will cancel execution
         *  onClose: function       // The function to run when the instance is about to be opened
         *  onOpen: function        // The function to run when the instance is about to be closed
         *  title: ''               // The title to set for the overlay
         * }
         * @returns {object(jQuery)} This jQuery object
         */
        init: function (opts) {
            var T = this;
            if (T.length > 1) {
                // If the length is more than one, apply this function to all objects
                T.each(function() {
                    $(this).ajaxLoading(opts);
                });
                return T;
            } else if (!T.length) {
                // We have no objects return
                return T;
            }
            if (T.data('overlayid')) {
                // We have already been initialised
                return T;
            }
            var ef = function (){},
            s = T.s = $.extend({
                backgroundCSS: {},
                body: '',
                containerCSS: {},
                onBeforeClose: ef,
                onBeforeOpen: ef,
                onClose: ef,
                onOpen: ef,
                title: ''
            }, opts),
            // The default body
            dbody = 
                    '<h1 class="overlay-title">' + s.title + '</h1>' + 
                    '<div class="overlay-body">' + s.body + '</div>' + 
                    '<span class="overlay-close">' + tx('Close') + '</span>',
            /**
             * @brief The function to close the overlay when the background or close link is clicked
             */
            close = function () {T.overlay('hide');};
    
            // Build the overlay
            T.append('<div class="overlay-bg"></div><div class="overlay-content">' + dbody + '</div>' );
            T.css({display: 'none', position: 'fixed', width: '100%', height: '100%', top: 0, left: 0});
            $('.overlay-bg', T).css($.extend({
                width: '100%', height: '100%', position: 'fixed'
            }, s.backgroundCSS)).click(close);
            $('.overlay-content', T).css($.extend({
                position: 'relative', 'max-width': '600px', width: '80%', top: 100, background: '#FFF', padding: '20px', 
                border: 'solid thin #FEFEFE', 'box-shadow': '0px 0px 3px #6B6B6B', margin: 'auto'
            }, s.containerCSS));
            $('.overlay-title', T).css({padding: '10px 0', borderBottom: 'dotted thin #ccc'});
            $('.overlay-body', T).css({'max-height': 500, overflow: 'auto'});
            $('.overlay-close', T).css({cursor: 'pointer', display: 'inline-block', paddingTop: 10}).click(close);
            var alid = ++count;
            T.attr({'data-overlayid': alid});
            cache[alid] = T;
        },
        /**
         * @brief Show the overlay
         * @param {object(plain)} data New data to use to show the overlay
         *  {
         *      title: '',                                                  // A new title
         *      body: ''                                                    // A new body
         *  }
         */
        show: function (data) {
            // Show the overlay and set its content
            var T = this;
            if (T.s.onBeforeOpen.call(T, data) === false) {
                // The caller doesn't want us to continue
                return T;
            }
            T.show();
            if (data.title) {
                // We've been given a new title
                $('.overlay-title', T).html(data.title);
            }
            if (data.title) {
                // We've been given a new body
                $('.overlay-body', T).html(data.body).scrollTop(0);
            }
            T.s.onOpen.call(T, data);
            return T;
        },
        /**
         * @brief Hide the overlay
         */
        hide: function () {
            // Hide the overlay
            var T = this;
            if (T.s.onBeforeClose.call(T) === false) {
                // The caller doesn't want us to continue
                return T;
            }
            this.hide();
            T.s.onClose.call(T);
            return T;
        }
    },
    cache = {};                                                             ///< Cache the objects this function was called by
    
    /**
     * Get this object from the cache
     * @param {object(jQuery)} elem The object to test
     * @returns {object(jQuery)} Either the jQuery object from the cache, or elem if a cache entry does not exist
     */
    function getThis(elem) {
        var index = elem.data('overlayid');
        return index||index===0 ? cache[index] : elem;
    }

    $.fn.overlay = function(methodOrOpts) {
        var T = getThis(this);
        if (methods[methodOrOpts]) {
            // The first option passed is a method, therefore call this method
            return methods[methodOrOpts].apply(T, Array.prototype.slice.call(arguments, 1));
        } else if (Object.prototype.toString.call(methodOrOpts) === '[object Object]' || !methodOrOpts) {
            // The default action is to call the init function
            return methods.init.apply(T, arguments);
        } else {
            // The user has passed us something dodgy, throw an error
            $.error(['The method ', methodOrOpts, ' does not exist'].join(''));
        }
    };
    
})(jQuery, 0);