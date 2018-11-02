This documentation details the [configuration](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc) of
[eslint](https://eslint.org/).

## Configuration

Recommended rules (if not ignored) appear as *error*.

Rule | Fixable | Level | Parameters | Comment
---- | ---- | ---- | ---- | ----
**Possible Errors** | | | |
[for-direction](https://eslint.org/docs/rules/for-direction) |   | *error* |  | 
[getter-return](https://eslint.org/docs/rules/getter-return) |   | *error* |  | 
[no-async-promise-executor](https://eslint.org/docs/rules/no-async-promise-executor) |   | **-** |  | 
[no-await-in-loop](https://eslint.org/docs/rules/no-await-in-loop) |   | **-** |  | 
[no-compare-neg-zero](https://eslint.org/docs/rules/no-compare-neg-zero) |   | *error* |  | 
[no-cond-assign](https://eslint.org/docs/rules/no-cond-assign) |   | *error* |  | 
[no-console](https://eslint.org/docs/rules/no-console) |   | **ignore** |  | The library offers a [compatibility layer](https://arnaudbuchholz.github.io/gpf/doc/tutorial-COMPATIBILITY.html) that includes [console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console/log), [console.warn](https://developer.mozilla.org/en-US/docs/Web/API/Console/warn) and [console.error](https://developer.mozilla.org/en-US/docs/Web/API/Console/error). 
[no-constant-condition](https://eslint.org/docs/rules/no-constant-condition) |   | *error* |  | 
[no-control-regex](https://eslint.org/docs/rules/no-control-regex) |   | *error* |  | 
[no-debugger](https://eslint.org/docs/rules/no-debugger) |   | *error* |  | 
[no-dupe-args](https://eslint.org/docs/rules/no-dupe-args) |   | *error* |  | 
[no-dupe-keys](https://eslint.org/docs/rules/no-dupe-keys) |   | *error* |  | 
[no-duplicate-case](https://eslint.org/docs/rules/no-duplicate-case) |   | *error* |  | 
[no-empty](https://eslint.org/docs/rules/no-empty) |   | *error* |  | 
[no-empty-character-class](https://eslint.org/docs/rules/no-empty-character-class) |   | *error* |  | 
[no-ex-assign](https://eslint.org/docs/rules/no-ex-assign) |   | *error* |  | 
[no-extra-boolean-cast](https://eslint.org/docs/rules/no-extra-boolean-cast) | &check; | *error* |  | 
[no-extra-parens](https://eslint.org/docs/rules/no-extra-parens) | &check; | **error** |  | 
[no-extra-semi](https://eslint.org/docs/rules/no-extra-semi) | &check; | *error* |  | 
[no-func-assign](https://eslint.org/docs/rules/no-func-assign) |   | *error* |  | 
[no-inner-declarations](https://eslint.org/docs/rules/no-inner-declarations) |   | *error* |  | 
[no-invalid-regexp](https://eslint.org/docs/rules/no-invalid-regexp) |   | *error* |  | 
[no-irregular-whitespace](https://eslint.org/docs/rules/no-irregular-whitespace) |   | *error* |  | 
[no-misleading-character-class](https://eslint.org/docs/rules/no-misleading-character-class) |   | **-** |  | 
[no-negated-in-lhs](https://eslint.org/docs/rules/no-negated-in-lhs) |   | **-** |  | 
[no-obj-calls](https://eslint.org/docs/rules/no-obj-calls) |   | *error* |  | 
[no-prototype-builtins](https://eslint.org/docs/rules/no-prototype-builtins) |   | **-** |  | 
[no-regex-spaces](https://eslint.org/docs/rules/no-regex-spaces) | &check; | *error* |  | 
[no-sparse-arrays](https://eslint.org/docs/rules/no-sparse-arrays) |   | *error* |  | 
[no-template-curly-in-string](https://eslint.org/docs/rules/no-template-curly-in-string) |   | **-** |  | 
[no-unexpected-multiline](https://eslint.org/docs/rules/no-unexpected-multiline) |   | *error* |  | 
[no-unreachable](https://eslint.org/docs/rules/no-unreachable) |   | *error* |  | 
[no-unsafe-finally](https://eslint.org/docs/rules/no-unsafe-finally) |   | *error* |  | 
[no-unsafe-negation](https://eslint.org/docs/rules/no-unsafe-negation) | &check; | *error* |  | 
[require-atomic-updates](https://eslint.org/docs/rules/require-atomic-updates) |   | **-** |  | 
[use-isnan](https://eslint.org/docs/rules/use-isnan) |   | *error* |  | 
[valid-jsdoc](https://eslint.org/docs/rules/valid-jsdoc) | &check; | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L6) | 
[valid-typeof](https://eslint.org/docs/rules/valid-typeof) |   | *error* |  | 
**Best Practices** | | | |
[accessor-pairs](https://eslint.org/docs/rules/accessor-pairs) |   | **error** |  | 
[array-callback-return](https://eslint.org/docs/rules/array-callback-return) |   | **-** |  | 
[block-scoped-var](https://eslint.org/docs/rules/block-scoped-var) |   | **error** |  | 
[class-methods-use-this](https://eslint.org/docs/rules/class-methods-use-this) |   | **-** |  | 
[complexity](https://eslint.org/docs/rules/complexity) |   | **error** | 6 | 
[consistent-return](https://eslint.org/docs/rules/consistent-return) |   | **-** |  | The API extensively uses the [`undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined) value to represent no value. Since a method with no [`return`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return) statement returns [`undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined), many functions are not consistent. 
[curly](https://eslint.org/docs/rules/curly) | &check; | **error** | "all" | 
[default-case](https://eslint.org/docs/rules/default-case) |   | **error** |  | 
[dot-location](https://eslint.org/docs/rules/dot-location) | &check; | **error** | "property" | 
[dot-notation](https://eslint.org/docs/rules/dot-notation) | &check; | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L30) | 
[eqeqeq](https://eslint.org/docs/rules/eqeqeq) | &check; | **error** |  | 
[guard-for-in](https://eslint.org/docs/rules/guard-for-in) |   | **error** |  | 
[max-classes-per-file](https://eslint.org/docs/rules/max-classes-per-file) |   | **-** |  | 
[no-alert](https://eslint.org/docs/rules/no-alert) |   | **error** |  | 
[no-caller](https://eslint.org/docs/rules/no-caller) |   | **error** |  | 
[no-case-declarations](https://eslint.org/docs/rules/no-case-declarations) |   | *error* |  | 
[no-div-regex](https://eslint.org/docs/rules/no-div-regex) |   | **error** |  | 
[no-else-return](https://eslint.org/docs/rules/no-else-return) | &check; | **error** |  | 
[no-empty-function](https://eslint.org/docs/rules/no-empty-function) |   | **-** |  | 
[no-empty-pattern](https://eslint.org/docs/rules/no-empty-pattern) |   | *error* |  | 
[no-eq-null](https://eslint.org/docs/rules/no-eq-null) |   | **error** |  | 
[no-eval](https://eslint.org/docs/rules/no-eval) |   | **error** |  | 
[no-extend-native](https://eslint.org/docs/rules/no-extend-native) |   | **-** |  | Since the library implements [polyfills](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill) to provide a [compatibility layer](https://arnaudbuchholz.github.io/gpf/doc/tutorial-COMPATIBILITY.html), this rule is turned off. However, the general rule is to not extend native classes with non standard methods. 
[no-extra-bind](https://eslint.org/docs/rules/no-extra-bind) | &check; | **error** |  | 
[no-extra-label](https://eslint.org/docs/rules/no-extra-label) | &check; | **-** |  | 
[no-fallthrough](https://eslint.org/docs/rules/no-fallthrough) |   | *error* |  | 
[no-floating-decimal](https://eslint.org/docs/rules/no-floating-decimal) | &check; | **error** |  | 
[no-global-assign](https://eslint.org/docs/rules/no-global-assign) |   | *error* |  | 
[no-implicit-coercion](https://eslint.org/docs/rules/no-implicit-coercion) | &check; | **error** |  | 
[no-implicit-globals](https://eslint.org/docs/rules/no-implicit-globals) |   | **-** |  | 
[no-implied-eval](https://eslint.org/docs/rules/no-implied-eval) |   | **error** |  | 
[no-invalid-this](https://eslint.org/docs/rules/no-invalid-this) |   | **error** |  | 
[no-iterator](https://eslint.org/docs/rules/no-iterator) |   | **error** |  | 
[no-labels](https://eslint.org/docs/rules/no-labels) |   | **error** |  | Really? 
[no-lone-blocks](https://eslint.org/docs/rules/no-lone-blocks) |   | **error** |  | 
[no-loop-func](https://eslint.org/docs/rules/no-loop-func) |   | **error** |  | 
[no-magic-numbers](https://eslint.org/docs/rules/no-magic-numbers) |   | **-** |  | The rule detects too many false positive (as of now) 
[no-multi-spaces](https://eslint.org/docs/rules/no-multi-spaces) | &check; | **error** |  | 
[no-multi-str](https://eslint.org/docs/rules/no-multi-str) |   | **error** |  | 
[no-native-reassign](https://eslint.org/docs/rules/no-native-reassign) |   | **-** |  | 
[no-new](https://eslint.org/docs/rules/no-new) |   | **error** |  | 
[no-new-func](https://eslint.org/docs/rules/no-new-func) |   | **error** |  | 
[no-new-wrappers](https://eslint.org/docs/rules/no-new-wrappers) |   | **error** |  | 
[no-octal](https://eslint.org/docs/rules/no-octal) |   | *error* |  | 
[no-octal-escape](https://eslint.org/docs/rules/no-octal-escape) |   | **error** |  | 
[no-param-reassign](https://eslint.org/docs/rules/no-param-reassign) |   | **error** |  | 
[no-proto](https://eslint.org/docs/rules/no-proto) |   | **error** |  | 
[no-redeclare](https://eslint.org/docs/rules/no-redeclare) |   | *error* |  | 
[no-restricted-properties](https://eslint.org/docs/rules/no-restricted-properties) |   | **-** |  | 
[no-return-assign](https://eslint.org/docs/rules/no-return-assign) |   | **error** |  | 
[no-return-await](https://eslint.org/docs/rules/no-return-await) |   | **-** |  | 
[no-script-url](https://eslint.org/docs/rules/no-script-url) |   | **error** |  | 
[no-self-assign](https://eslint.org/docs/rules/no-self-assign) |   | *error* |  | 
[no-self-compare](https://eslint.org/docs/rules/no-self-compare) |   | **error** |  | 
[no-sequences](https://eslint.org/docs/rules/no-sequences) |   | **error** |  | 
[no-throw-literal](https://eslint.org/docs/rules/no-throw-literal) |   | **error** |  | 
[no-unmodified-loop-condition](https://eslint.org/docs/rules/no-unmodified-loop-condition) |   | **-** |  | 
[no-unused-expressions](https://eslint.org/docs/rules/no-unused-expressions) |   | **error** |  | 
[no-unused-labels](https://eslint.org/docs/rules/no-unused-labels) | &check; | *error* |  | 
[no-useless-call](https://eslint.org/docs/rules/no-useless-call) |   | **error** |  | 
[no-useless-concat](https://eslint.org/docs/rules/no-useless-concat) |   | **error** |  | 
[no-useless-escape](https://eslint.org/docs/rules/no-useless-escape) |   | *error* |  | 
[no-useless-return](https://eslint.org/docs/rules/no-useless-return) | &check; | **-** |  | 
[no-void](https://eslint.org/docs/rules/no-void) |   | **error** |  | 
[no-warning-comments](https://eslint.org/docs/rules/no-warning-comments) |   | **-** |  | 
[no-with](https://eslint.org/docs/rules/no-with) |   | **error** |  | I had so many troubles with this funky keyword, please don't use it ! 
[prefer-promise-reject-errors](https://eslint.org/docs/rules/prefer-promise-reject-errors) |   | **-** |  | 
[radix](https://eslint.org/docs/rules/radix) |   | **error** |  | 
[require-await](https://eslint.org/docs/rules/require-await) |   | **-** |  | 
[require-unicode-regexp](https://eslint.org/docs/rules/require-unicode-regexp) |   | **-** |  | 
[vars-on-top](https://eslint.org/docs/rules/vars-on-top) |   | **-** |  | Unless you don't understand hoisting, it is useless to put all vars on top. 
[wrap-iife](https://eslint.org/docs/rules/wrap-iife) | &check; | **error** | "outside" | 
[yoda](https://eslint.org/docs/rules/yoda) | &check; | **error** |  | do or do not, there is no try. As a former C developer, I kept this habit. 
**Strict Mode** | | | |
[strict](https://eslint.org/docs/rules/strict) | &check; | **error** | "global" | required for all GPF-JS modules 
**Variables** | | | |
[init-declarations](https://eslint.org/docs/rules/init-declarations) |   | **-** |  | As GPF-JS uses undefined, variables are not necessarily initialized with a value 
[no-catch-shadow](https://eslint.org/docs/rules/no-catch-shadow) |   | **-** |  | 
[no-delete-var](https://eslint.org/docs/rules/no-delete-var) |   | *error* |  | 
[no-label-var](https://eslint.org/docs/rules/no-label-var) |   | **error** |  | 
[no-restricted-globals](https://eslint.org/docs/rules/no-restricted-globals) |   | **-** |  | 
[no-shadow](https://eslint.org/docs/rules/no-shadow) |   | **error** |  | 
[no-shadow-restricted-names](https://eslint.org/docs/rules/no-shadow-restricted-names) |   | **error** |  | 
[no-undef](https://eslint.org/docs/rules/no-undef) |   | *error* |  | 
[no-undef-init](https://eslint.org/docs/rules/no-undef-init) | &check; | **error** |  | 
[no-undefined](https://eslint.org/docs/rules/no-undefined) |   | **-** |  | undefined is a value 
[no-unused-vars](https://eslint.org/docs/rules/no-unused-vars) |   | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L77) | 
[no-use-before-define](https://eslint.org/docs/rules/no-use-before-define) |   | **error** | "nofunc" | 
**Node.js and CommonJS** | | | |
[callback-return](https://eslint.org/docs/rules/callback-return) |   | **-** |  | 
[global-require](https://eslint.org/docs/rules/global-require) |   | **-** |  | 
[handle-callback-err](https://eslint.org/docs/rules/handle-callback-err) |   | **error** |  | 
[no-buffer-constructor](https://eslint.org/docs/rules/no-buffer-constructor) |   | **-** |  | 
[no-mixed-requires](https://eslint.org/docs/rules/no-mixed-requires) |   | **-** |  | 
[no-new-require](https://eslint.org/docs/rules/no-new-require) |   | **error** |  | 
[no-path-concat](https://eslint.org/docs/rules/no-path-concat) |   | **-** |  | GPF-JS handles path separator the proper way 
[no-process-env](https://eslint.org/docs/rules/no-process-env) |   | **error** |  | 
[no-process-exit](https://eslint.org/docs/rules/no-process-exit) |   | **-** |  | 
[no-restricted-modules](https://eslint.org/docs/rules/no-restricted-modules) |   | **-** |  | 
[no-sync](https://eslint.org/docs/rules/no-sync) |   | **error** |  | 
**Stylistic Issues** | | | |
[array-bracket-newline](https://eslint.org/docs/rules/array-bracket-newline) | &check; | **-** |  | 
[array-bracket-spacing](https://eslint.org/docs/rules/array-bracket-spacing) | &check; | **error** | "never" | 
[array-element-newline](https://eslint.org/docs/rules/array-element-newline) | &check; | **-** |  | 
[block-spacing](https://eslint.org/docs/rules/block-spacing) | &check; | **error** | "never" | 
[brace-style](https://eslint.org/docs/rules/brace-style) | &check; | **error** | "1tbs" | 
[camelcase](https://eslint.org/docs/rules/camelcase) |   | **error** |  | 
[capitalized-comments](https://eslint.org/docs/rules/capitalized-comments) | &check; | **-** |  | 
[comma-dangle](https://eslint.org/docs/rules/comma-dangle) | &check; | **error** | "never" | 
[comma-spacing](https://eslint.org/docs/rules/comma-spacing) | &check; | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L88) | 
[comma-style](https://eslint.org/docs/rules/comma-style) | &check; | **error** | "last" | 
[computed-property-spacing](https://eslint.org/docs/rules/computed-property-spacing) | &check; | **-** |  | 
[consistent-this](https://eslint.org/docs/rules/consistent-this) |   | **error** | "me" | 
[eol-last](https://eslint.org/docs/rules/eol-last) | &check; | **error** |  | 
[func-call-spacing](https://eslint.org/docs/rules/func-call-spacing) | &check; | **error** | "never" | 
[func-name-matching](https://eslint.org/docs/rules/func-name-matching) |   | **-** |  | 
[func-names](https://eslint.org/docs/rules/func-names) |   | **-** |  | 
[func-style](https://eslint.org/docs/rules/func-style) |   | **error** | "declaration" | enforced on purpose 
[function-paren-newline](https://eslint.org/docs/rules/function-paren-newline) | &check; | **-** |  | 
[id-blacklist](https://eslint.org/docs/rules/id-blacklist) |   | **-** |  | 
[id-length](https://eslint.org/docs/rules/id-length) |   | **-** |  | 
[id-match](https://eslint.org/docs/rules/id-match) |   | **-** |  | will be replaced with a custom rule 
[implicit-arrow-linebreak](https://eslint.org/docs/rules/implicit-arrow-linebreak) | &check; | **-** |  | 
[indent](https://eslint.org/docs/rules/indent) | &check; | **error** | 4 | 
[indent-legacy](https://eslint.org/docs/rules/indent-legacy) | &check; | **-** |  | 
[jsx-quotes](https://eslint.org/docs/rules/jsx-quotes) | &check; | **-** |  | 
[key-spacing](https://eslint.org/docs/rules/key-spacing) | &check; | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L95) | 
[keyword-spacing](https://eslint.org/docs/rules/keyword-spacing) | &check; | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L119) | 
[line-comment-position](https://eslint.org/docs/rules/line-comment-position) |   | **-** |  | 
[linebreak-style](https://eslint.org/docs/rules/linebreak-style) | &check; | **warning** | "unix" | 
[lines-around-comment](https://eslint.org/docs/rules/lines-around-comment) | &check; | **-** |  | 
[lines-around-directive](https://eslint.org/docs/rules/lines-around-directive) | &check; | **-** |  | 
[lines-between-class-members](https://eslint.org/docs/rules/lines-between-class-members) | &check; | **-** |  | 
[max-depth](https://eslint.org/docs/rules/max-depth) |   | **error** | 4 | 
[max-len](https://eslint.org/docs/rules/max-len) |   | **error** | 120 | 
[max-lines](https://eslint.org/docs/rules/max-lines) |   | **-** |  | 
[max-lines-per-function](https://eslint.org/docs/rules/max-lines-per-function) |   | **-** |  | 
[max-nested-callbacks](https://eslint.org/docs/rules/max-nested-callbacks) |   | **error** | 2 | 
[max-params](https://eslint.org/docs/rules/max-params) |   | **error** | 3 | 
[max-statements](https://eslint.org/docs/rules/max-statements) |   | **error** | 15 | 
[max-statements-per-line](https://eslint.org/docs/rules/max-statements-per-line) |   | **-** |  | 
[multiline-comment-style](https://eslint.org/docs/rules/multiline-comment-style) | &check; | **-** |  | 
[multiline-ternary](https://eslint.org/docs/rules/multiline-ternary) |   | **-** |  | 
[new-cap](https://eslint.org/docs/rules/new-cap) |   | **error** |  | 
[new-parens](https://eslint.org/docs/rules/new-parens) | &check; | **error** |  | 
[newline-after-var](https://eslint.org/docs/rules/newline-after-var) | &check; | **-** |  | 
[newline-before-return](https://eslint.org/docs/rules/newline-before-return) | &check; | **-** |  | 
[newline-per-chained-call](https://eslint.org/docs/rules/newline-per-chained-call) | &check; | **-** |  | 
[no-array-constructor](https://eslint.org/docs/rules/no-array-constructor) |   | **error** |  | 
[no-bitwise](https://eslint.org/docs/rules/no-bitwise) |   | **-** |  | 
[no-continue](https://eslint.org/docs/rules/no-continue) |   | **-** |  | 
[no-inline-comments](https://eslint.org/docs/rules/no-inline-comments) |   | **-** |  | 
[no-lonely-if](https://eslint.org/docs/rules/no-lonely-if) | &check; | **error** |  | 
[no-mixed-operators](https://eslint.org/docs/rules/no-mixed-operators) |   | **-** |  | 
[no-mixed-spaces-and-tabs](https://eslint.org/docs/rules/no-mixed-spaces-and-tabs) |   | *error* |  | 
[no-multi-assign](https://eslint.org/docs/rules/no-multi-assign) |   | **-** |  | 
[no-multiple-empty-lines](https://eslint.org/docs/rules/no-multiple-empty-lines) | &check; | **error** |  | 
[no-negated-condition](https://eslint.org/docs/rules/no-negated-condition) |   | **error** |  | 
[no-nested-ternary](https://eslint.org/docs/rules/no-nested-ternary) |   | **error** |  | 
[no-new-object](https://eslint.org/docs/rules/no-new-object) |   | **error** |  | 
[no-plusplus](https://eslint.org/docs/rules/no-plusplus) |   | **-** |  | 
[no-restricted-syntax](https://eslint.org/docs/rules/no-restricted-syntax) |   | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L106) | 
[no-spaced-func](https://eslint.org/docs/rules/no-spaced-func) | &check; | **-** |  | 
[no-tabs](https://eslint.org/docs/rules/no-tabs) |   | **-** |  | 
[no-ternary](https://eslint.org/docs/rules/no-ternary) |   | **error** |  | 
[no-trailing-spaces](https://eslint.org/docs/rules/no-trailing-spaces) | &check; | **error** |  | 
[no-underscore-dangle](https://eslint.org/docs/rules/no-underscore-dangle) |   | **-** |  | 
[no-unneeded-ternary](https://eslint.org/docs/rules/no-unneeded-ternary) | &check; | **error** |  | 
[no-whitespace-before-property](https://eslint.org/docs/rules/no-whitespace-before-property) | &check; | **-** |  | 
[nonblock-statement-body-position](https://eslint.org/docs/rules/nonblock-statement-body-position) | &check; | **-** |  | 
[object-curly-newline](https://eslint.org/docs/rules/object-curly-newline) | &check; | **-** |  | 
[object-curly-spacing](https://eslint.org/docs/rules/object-curly-spacing) | &check; | **error** | "never" | 
[object-property-newline](https://eslint.org/docs/rules/object-property-newline) | &check; | **-** |  | 
[one-var](https://eslint.org/docs/rules/one-var) | &check; | **-** |  | Following clean code principle, variables are declared close to their related functions 
[one-var-declaration-per-line](https://eslint.org/docs/rules/one-var-declaration-per-line) | &check; | **-** |  | 
[operator-assignment](https://eslint.org/docs/rules/operator-assignment) | &check; | **error** | "always" | 
[operator-linebreak](https://eslint.org/docs/rules/operator-linebreak) | &check; | **error** | "before" | 
[padded-blocks](https://eslint.org/docs/rules/padded-blocks) | &check; | **-** |  | 
[padding-line-between-statements](https://eslint.org/docs/rules/padding-line-between-statements) | &check; | **-** |  | 
[prefer-object-spread](https://eslint.org/docs/rules/prefer-object-spread) | &check; | **-** |  | 
[quote-props](https://eslint.org/docs/rules/quote-props) | &check; | **warning** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L113) | 
[quotes](https://eslint.org/docs/rules/quotes) | &check; | **error** | "double" | 
[require-jsdoc](https://eslint.org/docs/rules/require-jsdoc) |   | **-** |  | 
[semi](https://eslint.org/docs/rules/semi) | &check; | **error** | "always" | 
[semi-spacing](https://eslint.org/docs/rules/semi-spacing) | &check; | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L115) | 
[semi-style](https://eslint.org/docs/rules/semi-style) | &check; | **-** |  | 
[sort-keys](https://eslint.org/docs/rules/sort-keys) |   | **-** |  | 
[sort-vars](https://eslint.org/docs/rules/sort-vars) | &check; | **-** |  | 
[space-before-blocks](https://eslint.org/docs/rules/space-before-blocks) | &check; | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L117) | 
[space-before-function-paren](https://eslint.org/docs/rules/space-before-function-paren) | &check; | **error** | "always" | 
[space-in-parens](https://eslint.org/docs/rules/space-in-parens) | &check; | **error** | "never" | 
[space-infix-ops](https://eslint.org/docs/rules/space-infix-ops) | &check; | **error** | [*.eslintrc*](https://github.com/ArnaudBuchholz/gpf-js/blob/master/.eslintrc#L121) | 
[space-unary-ops](https://eslint.org/docs/rules/space-unary-ops) | &check; | **error** |  | 
[spaced-comment](https://eslint.org/docs/rules/spaced-comment) | &check; | **-** |  | 
[switch-colon-spacing](https://eslint.org/docs/rules/switch-colon-spacing) | &check; | **-** |  | 
[template-tag-spacing](https://eslint.org/docs/rules/template-tag-spacing) | &check; | **-** |  | 
[unicode-bom](https://eslint.org/docs/rules/unicode-bom) | &check; | **-** |  | 
[wrap-regex](https://eslint.org/docs/rules/wrap-regex) | &check; | **error** |  | 
**ECMAScript 6** | | | |
[arrow-body-style](https://eslint.org/docs/rules/arrow-body-style) | &check; | **-** |  | 
[arrow-parens](https://eslint.org/docs/rules/arrow-parens) | &check; | **-** |  | 
[arrow-spacing](https://eslint.org/docs/rules/arrow-spacing) | &check; | **-** |  | 
[constructor-super](https://eslint.org/docs/rules/constructor-super) |   | *error* |  | 
[generator-star-spacing](https://eslint.org/docs/rules/generator-star-spacing) | &check; | **-** |  | 
[no-class-assign](https://eslint.org/docs/rules/no-class-assign) |   | *error* |  | 
[no-confusing-arrow](https://eslint.org/docs/rules/no-confusing-arrow) | &check; | **-** |  | 
[no-const-assign](https://eslint.org/docs/rules/no-const-assign) |   | *error* |  | 
[no-dupe-class-members](https://eslint.org/docs/rules/no-dupe-class-members) |   | *error* |  | 
[no-duplicate-imports](https://eslint.org/docs/rules/no-duplicate-imports) |   | **-** |  | 
[no-new-symbol](https://eslint.org/docs/rules/no-new-symbol) |   | *error* |  | 
[no-restricted-imports](https://eslint.org/docs/rules/no-restricted-imports) |   | **-** |  | 
[no-this-before-super](https://eslint.org/docs/rules/no-this-before-super) |   | *error* |  | 
[no-useless-computed-key](https://eslint.org/docs/rules/no-useless-computed-key) | &check; | **-** |  | 
[no-useless-constructor](https://eslint.org/docs/rules/no-useless-constructor) |   | **-** |  | 
[no-useless-rename](https://eslint.org/docs/rules/no-useless-rename) | &check; | **-** |  | 
[no-var](https://eslint.org/docs/rules/no-var) | &check; | **-** |  | 
[object-shorthand](https://eslint.org/docs/rules/object-shorthand) | &check; | **-** |  | 
[prefer-arrow-callback](https://eslint.org/docs/rules/prefer-arrow-callback) | &check; | **-** |  | 
[prefer-const](https://eslint.org/docs/rules/prefer-const) | &check; | **-** |  | 
[prefer-destructuring](https://eslint.org/docs/rules/prefer-destructuring) |   | **-** |  | 
[prefer-numeric-literals](https://eslint.org/docs/rules/prefer-numeric-literals) | &check; | **-** |  | 
[prefer-reflect](https://eslint.org/docs/rules/prefer-reflect) |   | **-** |  | 
[prefer-rest-params](https://eslint.org/docs/rules/prefer-rest-params) |   | **-** |  | 
[prefer-spread](https://eslint.org/docs/rules/prefer-spread) | &check; | **-** |  | 
[prefer-template](https://eslint.org/docs/rules/prefer-template) | &check; | **-** |  | 
[require-yield](https://eslint.org/docs/rules/require-yield) |   | *error* |  | 
[rest-spread-spacing](https://eslint.org/docs/rules/rest-spread-spacing) | &check; | **-** |  | 
[sort-imports](https://eslint.org/docs/rules/sort-imports) | &check; | **-** |  | 
[symbol-description](https://eslint.org/docs/rules/symbol-description) |   | **-** |  | 
[template-curly-spacing](https://eslint.org/docs/rules/template-curly-spacing) | &check; | **-** |  | 
[yield-star-spacing](https://eslint.org/docs/rules/yield-star-spacing) | &check; | **-** |  | 

Use `grunt eslint` to apply linter.
