'use strict';

const cleanTests = require('./tests-clean.js'),
        styleTests = require('./tests-styles.js'),
        tokenTests = require('./tests-tokens.js');
cleanTests();
styleTests();
tokenTests();
