/*! markdown-it-div 1.0.1 https://github.com//kickscondor/markdown-it-div @license MIT */
(function(f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.markdownitContainer = f()
    }
})(function() {
    var define, module, exports;
    return (function() {
        function r(e, n, t) {
            function o(i, f) {
                if (!n[i]) {
                    if (!e[i]) {
                        var c = "function" == typeof require && require;
                        if (!f && c) return c(i, !0);
                        if (u) return u(i, !0);
                        var a = new Error("Cannot find module '" + i + "'");
                        throw a.code = "MODULE_NOT_FOUND", a
                    }
                    var p = n[i] = {
                        exports: {}
                    };
                    e[i][0].call(p.exports, function(r) {
                        var n = e[i][1][r];
                        return o(n || r)
                    }, p, p.exports, r, e, n, t)
                }
                return n[i].exports
            }
            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
            return o
        }
        return r
    })()({
        1: [function(require, module, exports) {
            // Process block-level custom containers
            //
            'use strict';


            module.exports = function container_plugin(md, options) {

                function validateDefault() {
                    return true;
                }

                function renderDefault(tokens, idx, _options, env, slf) {

                    // add a class to the opening tag
                    if (tokens[idx].nesting === 1) {
                        var params = tokens[idx].info.split(/\s+/);
                        var id = null,
                            classes = [];
                        for (var i = 0; i < params.length; i++) {
                            var className = params[i];
                            if (className.includes('=')) {
                                var set = className.split('=', 2);
                                tokens[idx].attrJoin(set[0], set[1]);
                            } else if (className[0] === '#') {
                                id = className.slice(1);
                            } else if (className[0] === '.') {
                                classes.push(className.slice(1));
                            } else {
                                classes.push(className);
                            }
                        }
                        if (id) {
                            tokens[idx].attrJoin('id', id);
                        }
                        if (classes.length > 0) {
                            tokens[idx].attrJoin('class', classes.join(' '));
                        }
                    }

                    return slf.renderToken(tokens, idx, _options, env, slf);
                }

                options = options || {};

                var min_markers = 3,
                    marker_str = options.marker || ':',
                    marker_char = marker_str.charCodeAt(0),
                    marker_len = marker_str.length,
                    validate = options.validate || validateDefault,
                    render = options.render || renderDefault;

                function container(state, startLine, endLine, silent) {
                    var pos, nextLine, marker_count, markup, params, token,
                        old_parent, old_line_max,
                        auto_closed = false,
                        start = state.bMarks[startLine] + state.tShift[startLine],
                        max = state.eMarks[startLine];

                    // Check out the first character quickly,
                    // this should filter out most of non-containers
                    //
                    if (marker_char !== state.src.charCodeAt(start)) {
                        return false;
                    }

                    // Check out the rest of the marker string
                    //
                    for (pos = start + 1; pos <= max; pos++) {
                        if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
                            break;
                        }
                    }

                    marker_count = Math.floor((pos - start) / marker_len);
                    if (marker_count < min_markers) {
                        return false;
                    }
                    pos -= (pos - start) % marker_len;

                    markup = state.src.slice(start, pos);
                    params = state.src.slice(pos, max).trim();
                    if (!validate(params)) {
                        return false;
                    }

                    // Since start is found, we can report success here in validation mode
                    //
                    if (silent) {
                        return true;
                    }

                    // Search for the end of the block
                    //
                    nextLine = startLine;

                    for (;;) {
                        nextLine++;
                        if (nextLine >= endLine) {
                            // unclosed block should be autoclosed by end of document.
                            // also block seems to be autoclosed by end of parent
                            break;
                        }

                        start = state.bMarks[nextLine] + state.tShift[nextLine];
                        max = state.eMarks[nextLine];

                        if (start < max && state.sCount[nextLine] < state.blkIndent) {
                            // non-empty line with negative indent should stop the list:
                            // - ```
                            //  test
                            break;
                        }

                        if (marker_char !== state.src.charCodeAt(start)) {
                            continue;
                        }

                        if (state.sCount[nextLine] - state.blkIndent >= 4) {
                            // closing fence should be indented less than 4 spaces
                            continue;
                        }

                        for (pos = start + 1; pos <= max; pos++) {
                            if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
                                break;
                            }
                        }

                        // closing code fence must be at least as long as the opening one
                        if (Math.floor((pos - start) / marker_len) < marker_count) {
                            continue;
                        }

                        // make sure tail has spaces only
                        pos -= (pos - start) % marker_len;
                        pos = state.skipSpaces(pos);

                        if (pos < max) {
                            continue;
                        }

                        // found!
                        auto_closed = true;
                        break;
                    }

                    old_parent = state.parentType;
                    old_line_max = state.lineMax;
                    state.parentType = 'container';

                    // this will prevent lazy continuations from ever going past our end marker
                    state.lineMax = nextLine;

                    token = state.push('container', 'div', 1);
                    token.markup = markup;
                    token.block = true;
                    token.info = params;
                    token.map = [startLine, nextLine];

                    state.md.block.tokenize(state, startLine + 1, nextLine);

                    token = state.push('container', 'div', -1);
                    token.markup = state.src.slice(start, pos);
                    token.block = true;

                    state.parentType = old_parent;
                    state.lineMax = old_line_max;
                    state.line = nextLine + (auto_closed ? 1 : 0);

                    return true;
                }

                md.block.ruler.before('fence', 'container', container, {
                    alt: ['paragraph', 'reference', 'blockquote', 'list']
                });
                md.renderer.rules.container = render;
            };

        }, {}]
    }, {}, [1])(1)
});