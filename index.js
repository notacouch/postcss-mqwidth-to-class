var postcss = require('postcss');

module.exports = postcss.plugin('postcss-mqwidth-to-class', function (opts) {
    opts = opts || {};

    // Work with options here

    return function (css, result) {

        // Transform CSS AST here
        result;

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

            // If min-width and/or max-width
            if (/\(\s*m(in|ax)-width\s*:\s*\d+px\s*\)/i.test(mediaRule.params)) {

                // There can be multiple media queries via a comma
                var params                  = mediaRule.params.split(',');

                // Container for new rules
                var classifiedMediaRule     = postcss.parse('');
                var classifiedSelectors     = [];

                // Prepare selector for each media query
                params.forEach( function (param) {
                    if (/\(\s*m(in|ax)-width\s*:\s*\d+px\s*\)/i.test(param)) {
                        var hasMinWidth     = /\(\s*min-width\s*:\s*\d+px\s*\)/i
                            .test(param);
                        var hasMaxWidth     = /\(\s*max-width\s*:\s*\d+px\s*\)/i
                            .test(param);
                        var minWidth        = !hasMinWidth ? false : param
                            .match(/\(\s*min-width\s*:\s*(\d+)px\s*\)/i)[1];
                        var maxWidth        = !hasMaxWidth ? false : param
                            .match(/\(\s*max-width\s*:\s*(\d+)px\s*\)/i)[1];
                        var widthSelector   = hasMinWidth ? '.min-width-' +
                            minWidth + 'px' : '';
                        // If both min- and max-width, presume AND
                        //
                        // Also don't forget trailing space for descendants
                        widthSelector      += hasMaxWidth ?  '.max-width-' +
                            maxWidth + 'px ' : ' ';

                        classifiedSelectors.push(widthSelector);
                    }
                });

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
                            classifiedSelectors.forEach(
                                function (classifiedSelector) {
                                    newSelector.push(selector
                                        .replace(/(\S)/,
                                            classifiedSelector +
                                            '$1')
                                    );
                                }
                            );
                        }

                    });

                    node.selector = newSelector.join(',');
                    classifiedMediaRule.append(node);
                });

                mediaRule.replaceWith(classifiedMediaRule);
            }

        });


        return css;
    };
});
