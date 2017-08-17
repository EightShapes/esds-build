'use strict';

const cleanTests = require('./tests-clean.js'),
        generatorTests = require('./tests-generate.js'),
        markupTests = require('./tests-markup.js'),
        styleTests = require('./tests-styles.js'),
        tokenTests = require('./tests-tokens.js');
cleanTests();
generatorTests();
markupTests();
styleTests();
tokenTests();
