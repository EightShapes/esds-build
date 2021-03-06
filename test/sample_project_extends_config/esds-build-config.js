'use strict';
const path = require('path');

module.exports = {
    rootPath: path.join(process.cwd(), 'test', 'sample_project'),
    codeNamespace: 'esds-testing',
    docsPath: 'pages',
    markupSourceExtension: '.nunjucks'
};
