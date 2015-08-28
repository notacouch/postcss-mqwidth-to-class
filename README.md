# PostCSS mqwidth-to-class [![Build Status][ci-img]][ci]

[PostCSS] plugin converts min/max-width media queries to classes, useful for clients that do not support media queries e.g. IE8.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/notacouch/postcss-mqwidth-to-class.svg
[ci]:      https://travis-ci.org/notacouch/postcss-mqwidth-to-class

## Examples

```css
/* Input example */
@media (min-width: 768px) and (max-width: 991px) {
    .foo {
        float: left;
    }
}
```

```css
/* Output example */
.min-width-768px.max-width-991px .foo {
    float: left;
}
```

## Usage

```js
postcss([ require('postcss-mqwidth-to-class') ])
```

See [PostCSS] docs for examples for your environment.

## Notes

* Only supports `px` units.
* Ignores anything else in the query, e.g. screen, print, orientation.
* You'd need JavaScript to add the classes to the `<html>` or `<body>` tags.
* For IE8, off the bat you can have the `<html>` tag via conditional comments.

## Credit

I used the PostCSS Boilerplate and these two projects as a base:
* [CSS MQPacker](https://github.com/hail2u/node-css-mqpacker)
* [PostCSS Media Minmax](https://github.com/postcss/postcss-media-minmax)

## [Changelog](CHANGELOG.md)

## [License](LICENSE)