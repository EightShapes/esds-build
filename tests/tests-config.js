/* global it */
/* global xit */
/* global describe */
/* global beforeEach */
/* global after */

'use strict';
const assert = require('yeoman-assert'),
        path = require('path');

let config;

module.exports = function(){
    describe('when retrieving build config', function(){
        beforeEach(function(){
            config = require('../tasks/config.js');
        });

        it('should return an empty config object when a product config file cannot be found', function(){
            const productConfig = config.retrieveProductBuildConfig('/path/doesnt/exist/'),
                    keys = Object.keys(productConfig);
            assert(typeof productConfig === 'object');
            assert(keys.length === 0);
        });

        it('should return a config object when the product config file is found', function(){
            const productConfig = config.retrieveProductBuildConfig(`${process.cwd()}/tests/sample_project_extends_config/`);
            assert(typeof productConfig === 'object');
            assert(productConfig.codeNamespace === 'esds-testing');
        });

        it('should retrieve default config with a sanitized version of the package.json "name" key set as the codeNamespace', function(){
            const defaultConfig = config.retrieveDefaultBuildConfig();
            assert(defaultConfig.configMethod === 'extend');
            assert(defaultConfig.codeNamespace === 'eightshapes-eightshapes-build-tools');
        });

        it('should retrieve the default config as the build config when no product build config exists', function(){
            const buildConfig = config.retrieveBuildConfig('/path/doesnt/exist/');
            assert(buildConfig.configMethod === 'extend');
            assert(buildConfig.codeNamespace === buildConfig.codeNamespace);
            assert(buildConfig.docsPath === 'docs');
            assert(buildConfig.componentsPath === 'components');
            assert(buildConfig.tokensPath === 'tokens');
            assert(buildConfig.stylesPath === 'styles');
            assert(buildConfig.scriptsPath === 'scripts');
            assert(buildConfig.imagesPath === 'images');
            assert(buildConfig.dataPath === 'data');
        });

        it('should retrieve merged default and product config as the build config when the product build config exists', function(){
            const buildConfig = config.retrieveBuildConfig(`${process.cwd()}/tests/sample_project_extends_config/`);
            assert(buildConfig.configMethod === 'extend');
            assert(buildConfig.codeNamespace === 'esds-testing');
            assert(buildConfig.docsPath === 'pages');
            assert(buildConfig.componentsPath === 'components');
            assert(buildConfig.tokensPath === 'tokens');
            assert(buildConfig.stylesPath === 'styles');
            assert(buildConfig.scriptsPath === 'scripts');
            assert(buildConfig.imagesPath === 'images');
            assert(buildConfig.dataPath === 'data');
        });

        it('should return only product config as the build config when the product build config exists and sets configMethod to override', function(){
            const buildConfig = config.retrieveBuildConfig(`${process.cwd()}/tests/sample_project_override_config/`);
            assert(buildConfig.configMethod === 'overwrite');
            assert(buildConfig.codeNamespace === 'off-the-rails');
            assert(buildConfig.docsPath === 'blog');
            assert(buildConfig.componentsPath === 'modules');
            assert(buildConfig.tokensPath === 'constants');
            assert(buildConfig.stylesPath === 'scss');
            assert(buildConfig.scriptsPath === 'js');
            assert(buildConfig.imagesPath === 'imgs');
            assert(buildConfig.dataPath === 'content');
        });
    });

    describe('when retrieving task config', function(){
        beforeEach(function(){
            config = require('../tasks/config.js');
        });

        it('should return a task config based on defaults when a product config file cannot be found', function(){
            const taskConfig = config.get('/path/doesnt/exist/'),
                    c = taskConfig; //for brevity
            assert(c.styles.tasks.length === 1);
            assert(c.styles.buildTaskPrefix === 'styles:build:');
            assert(c.styles.compileTaskPrefix === 'styles:precompile:');
            assert(c.styles.postprocessTaskPrefix === 'styles:postprocess:');
            assert(c.styles.lintTaskPrefix === 'styles:lint:');
            assert(c.styles.watchTaskPrefix === 'watch:styles:');
            assert(c.styles.tasks[0].name === c.productTaskName);
            assert(c.styles.tasks[0].outputPath === path.join(c.rootPath, c.webroot, c.latestVersionPath, c.stylesPath));

            assert(c.markup.buildTaskPrefix === 'markup:build:');
            assert(c.markup.concatMacrosTaskPrefix === 'markup:concatenate:macros:');
            assert(c.markup.watchTaskPrefix === 'watch:markup:');
            assert(c.markup.watchDocsTaskPrefix === 'watch:markup:docs:');
            assert(c.markup.watchMacrosTaskPrefix === 'watch:markup:macros:');
            assert(c.markup.tasks[0].name === c.productTaskName);
            assert(c.markup.tasks[0].docOutputPath === path.join(c.rootPath, c.webroot, c.latestVersionPath));
            assert(c.markup.tasks[0].componentMacroFilename === `${c.codeNamespace}${c.markupSourceExtension}`);

            assert(c.scripts.buildTaskPrefix === 'scripts:build:');
            assert(c.scripts.concatTaskPrefix === 'scripts:concatenate:');
            assert(c.scripts.lintTaskPrefix === 'scripts:lint:');
            assert(c.scripts.watchTaskPrefix === 'watch:scripts:');
            assert(c.scripts.tasks[0].name === c.productTaskName);
            assert(c.scripts.tasks[0].outputFilename === `${c.codeNamespace}${c.scriptsSourceExtension}`);
            assert(c.scripts.tasks[0].sourcePaths.length === 2);

            assert(c.tokens.namespace === c.codeNamespace);
            assert(c.tokens.sourceFile === path.join(c.rootPath, c.tokensPath, c.tokensSourceFile));
            assert(c.tokens.outputPath === path.join(c.rootPath, c.tokensPath));
            assert(c.tokens.formats === c.tokensFormats);

            assert(c.copy.copyTaskPrefix === 'copy:');
            assert(c.copy.tasks[0].name === 'images');
            assert(c.copy.tasks[0].destination === path.join(c.rootPath, c.webroot, c.latestVersionPath, c.imagesPath));
        });

        it('should return a task config with product level extensions when a product config file is present', function(){
            const taskConfig = config.get(`${process.cwd()}/tests/sample_project_extends_config/`),
                    c = taskConfig; //for brevity
            assert(c.markup.tasks[0].docSourceFilePaths === path.join(c.rootPath, 'pages', '**', '*.nunjucks'));
        });

        it('should return a task config with full product level override when a product config file is present and configMode is set to "override"', function(){
            const taskConfig = config.get(`${process.cwd()}/tests/sample_project_override_config/`),
                    c = taskConfig; //for brevity
            assert(typeof c.rootPath === 'undefined'); // full override file is insufficient and doesn't include rootPath
        });
    });
};
