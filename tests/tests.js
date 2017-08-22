'use strict';

const cleanTests = require('./tests-clean.js'),
        configTests = require('./tests-config.js'),
        generatorTests = require('./tests-generate.js'),
        markupTests = require('./tests-markup.js'),
        scriptTests = require('./tests-scripts.js'),
        styleTests = require('./tests-styles.js'),
        tokenTests = require('./tests-tokens.js');
cleanTests();
configTests();
generatorTests();
markupTests();
scriptTests();
styleTests();
tokenTests();
