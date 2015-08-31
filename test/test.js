var postcss = require('postcss');
var expect  = require('chai').expect;
var fs      = require('fs');

var plugin  = require('../');

// Testing structure from postcss-media-minmax
// @link https://github.com/postcss/postcss-media-minmax
//
function filename(name) {
    return 'test/' + name + '.css';
}
function read(name) {
    return fs.readFileSync(name, 'utf8');
}

var test = function (input, opts, done) {
    var postcssOpts    = { from: filename('fixtures/' + input) };
    opts               = opts || {};
    var output         = read(filename('fixtures/' + input + '.output'));

    postcss([ plugin(opts) ]).process(
        read(postcssOpts.from), postcssOpts
    ).then(function (result) {
        expect(result.css).to.eql(output);
        expect(result.warnings()).to.be.empty;
        done();
    }).catch(function (error) {
        done(error);
    });
};

describe('postcss-mqwidth-to-class', function () {


    it('converts min-width (ignores non-width stuff e.g. screen only)', function (done) {
        test('min-width', { }, done);
    });

    it('converts max-width (ignores non-width stuff e.g. print)', function (done) {
        test('max-width', { }, done);
    });

    it('converts min-width AND max-width (ignores non-width stuff e.g. orientation)', function (done) {
        test('min-max-width', { }, done);
    });

    it('converts multiple media queries', function (done) {
        test('multiple-min-max-width', { }, done);
    });
    
    it('converts single media query in a list', function (done) {
        test('query-in-list', { }, done);
    });
    
    it('leaves non-min-/max-width media queries alone', function (done) {
        test('no-width-no-touch', { }, done);
    });
    
    it('supports NOT', function (done) {
        test('not', { }, done);
    });

});
