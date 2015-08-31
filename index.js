var postcss = require('postcss');

module.exports = postcss.plugin('postcss-mqwidth-to-class', function (opts) {
    opts = opts || {};

    // Work with options here

    return function (css) { // , result) {

        // Transform CSS AST here
        // result;

        css.walkAtRules('media', function (mediaRule) {
            // @link https://github.com/postcss/postcss-media-minmax/
            if (mediaRule.name !== 'media' &&
                mediaRule.name !== 'custom-media') {
                return;
            }


            // Matching min-width
            //
            // Looking for:
            // ( min-width: ###px )
            //
            // Regex:
            // /\(\s*min-width\s*:\s*\d+px\s*\)/
            //

            // !If min-width and/or max-width
            if (/\(\s*m(in|ax)-width\s*:\s*\d+px\s*\)/i.test(mediaRule.params)) {

                // There can be multiple media queries via a comma (serves as an OR).
                //
                // If there are multiple queries but they are not all width-related,
                // then the non-width should be left alone
                // and the width stuff "extracted" from it.
                var params                  = mediaRule.params.split(',');
                var affectedParams          = 0;
                var neglectedParams         = [];

                // Build the string to prepend to selectors
                var classifiedSelectors     = [];

                // !Prepare selector for each media query
                params.forEach( function (param) {

                    if (/\(\s*m(in|ax)-width\s*:\s*\d+px\s*\)/i.test(param)) {
                        ++affectedParams;
                        
                        
                        // Support for NOT
                        //
                        // Impossible:
                        // not (min-width: 100px) and (max-width: 200px)
                        //  viewport  < 100px && > 200px
                        // 
                        // Possible:
                        // not (min-width: 100px),
                        //  viewport < 100px
                        // not (max-width: 200px)
                        //  viewport > 200px
                        //
                        // Therefore `not` can be expressed by
                        // `.not-*`
                        // 
                        // Don't bother with evaluating impossible vs possible,
                        // that onus is on the developer.
                        //
                        var selectorStart   = /not[\s\(]*/i.test(param) ? '.not-' : '.';                        
                        var hasMinWidth     = /\(\s*min-width\s*:\s*\d+px\s*\)/i.test(param);
                        var hasMaxWidth     = /\(\s*max-width\s*:\s*\d+px\s*\)/i.test(param);
                        var minWidth        = !hasMinWidth ? false : param.match(/\(\s*min-width\s*:\s*(\d+)px\s*\)/i)[1];
                        var maxWidth        = !hasMaxWidth ? false : param.match(/\(\s*max-width\s*:\s*(\d+)px\s*\)/i)[1];
                        var widthSelector   = hasMinWidth ? selectorStart + 'min-width-' + minWidth + 'px' : '';
                        
                        // If both min- and max-width, presume AND
                        //
                        // Also don't forget trailing space for descendants
                        widthSelector      += hasMaxWidth ?  selectorStart + 'max-width-' + maxWidth + 'px ' : ' ';

                        classifiedSelectors.push(widthSelector);
                        
                    } else if (param.trim().length) {
                        neglectedParams.push(param); // keep track of the non-width queries
                    }

                });
                
                // Container for new rules (clone to retain source)
                var classifiedMediaRule = mediaRule.clone({ type: 'root' });
                classifiedMediaRule.removeAll();
                
                // It's no longer an atRule/media query, just a container
                delete classifiedMediaRule.name;
                delete classifiedMediaRule.params;

                // !Modify selectors
                mediaRule.walkRules( function (mediaNodeRule) {

                    var selectors   = mediaNodeRule.selector.split(',');
                    var node        = mediaNodeRule.clone(); // maintain source
                    var newSelector = [];

                    selectors.forEach( function (selector) {

                        // In case there's a trailing comma,
                        // trim the selector and ignore empty selectors.
                        var formattedSelector = selector.trim();
                        if (formattedSelector.length) {
                            // Iterate through the prepared selectors
                            // and prepend them to each actual selector
                            classifiedSelectors.forEach( function (classifiedSelector) {
                                newSelector.push( selector.replace(/(\S)/, classifiedSelector + '$1') );
                            });
                        }

                    });

                    node.selector = newSelector.join(',');
                    classifiedMediaRule.append(node);
                });
                
                // !Introduce new rules into stylesheet
                
                // If there are parts of the @rule that are non-width,
                // leave them alone.
                if (neglectedParams.length) {
                    mediaRule.params = neglectedParams.join(',');
                    classifiedMediaRule.moveAfter(mediaRule);
                    
                // Otherwise... swap it out with the new rule.
                } else { // if (affectedParams === params.length) {
                    mediaRule.replaceWith(classifiedMediaRule);
                }
            }

        });


        return css;
    };
});
