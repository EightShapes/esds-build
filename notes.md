# Assumptions
`./_site/latest` is the destination for the webroot
scss compilation output goes to webroot
js concatenated output goes to the webroot
nunjucks compilation output goes to the webroot
images copying goes to the webroot

# Simpler Config
/uds-build-config.js

'use strict';

module.exports = {
    configMethod: 'override | extend (default)' // Will either completely replace the default config (override) or merge with the default config (extend)
    classPrefix: 'uds' // Available to nunjucks macros and scss to make namespace flexible
    docsPath: 'docs' (default) | string,
    componentsPath: 'components' (default) | string,
    tokensPath: 'components' (default) | string,
    stylesPath: 'styles' (default) | string,
    scriptsPath: 'scripts' (default) | string,
    imagesPath: 'images' (default) | string,
    dataPath: 'data' (default) | string,
    dependencies: [
        {
            name: 'uds-doc-tools' //name of node package that contains dependencies
            components: true/'namespace' | false (default), //concatenates component macros, if a namespace is provided, sets the name of the concatenated macro file
            docs: true | false (default),
            tokens: true | false (default),
            images: true | false (default),
            data: true | false (default)
        }
    ]
}
