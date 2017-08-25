/* global it */
/* global xit */
/* global describe */
/* global beforeEach */
/* global after */

'use strict';
const assert = require('yeoman-assert'),
        path = require('path'),
        configProductName = '-eightshapes-uds-build-tools';

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
            const productConfig = config.retrieveProductBuildConfig(`${process.cwd()}/tests/sample_project/`);
            assert(typeof productConfig === 'object');
            assert(productConfig.classPrefix === 'uds-testing');
        });

        it('should retrieve default config with the package.json name set as the classPrefix', function(){
            const defaultConfig = config.retrieveDefaultBuildConfig();
            assert(defaultConfig.configMethod === 'extend');
            assert(defaultConfig.classPrefix === configProductName);
        });

        it('should retrieve the default config as the build config when no product build config exists', function(){
            const buildConfig = config.retrieveBuildConfig('/path/doesnt/exist/');
            assert(buildConfig.configMethod === 'extend');
            assert(buildConfig.classPrefix === configProductName);
            assert(buildConfig.docsPath === 'docs');
            assert(buildConfig.componentsPath === 'components');
            assert(buildConfig.tokensPath === 'tokens');
            assert(buildConfig.stylesPath === 'styles');
            assert(buildConfig.scriptsPath === 'scripts');
            assert(buildConfig.imagesPath === 'images');
            assert(buildConfig.dataPath === 'data');
        });

        it('should retrieve merged default and product config as the build config when the product build config exists', function(){
            const buildConfig = config.retrieveBuildConfig(`${process.cwd()}/tests/sample_project/`);
            assert(buildConfig.configMethod === 'extend');
            assert(buildConfig.classPrefix === 'uds-testing');
            assert(buildConfig.docsPath === 'pages');
            assert(buildConfig.componentsPath === 'components');
            assert(buildConfig.tokensPath === 'tokens');
            assert(buildConfig.stylesPath === 'styles');
            assert(buildConfig.scriptsPath === 'scripts');
            assert(buildConfig.imagesPath === 'images');
            assert(buildConfig.dataPath === 'data');
        });

        it('should return only product config as the build config when the product build config exists and sets configMethod to override', function(){
            const buildConfig = config.retrieveBuildConfig(`${process.cwd()}/tests/sample_project_full_override/`);
            assert(buildConfig.configMethod === 'overwrite');
            assert(buildConfig.classPrefix === 'off-the-rails');
            assert(buildConfig.docsPath === 'pages');
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
            assert(c.styles.tasks[0].name === configProductName);
            assert(c.styles.tasks[0].outputPath === path.join(c.latestVersionWebroot, c.stylesPath));

            assert(c.markup.buildTaskPrefix === 'markup:build:');
            assert(c.markup.concatMacrosTaskPrefix === 'markup:concatenate:macros:');
            assert(c.markup.watchTaskPrefix === 'watch:markup:');
            assert(c.markup.watchDocsTaskPrefix === 'watch:markup:docs:');
            assert(c.markup.watchMacrosTaskPrefix === 'watch:markup:macros:');
            assert(c.markup.tasks[0].name === configProductName);
            assert(c.markup.tasks[0].docOutputPath === c.latestVersionWebroot);
            assert(c.markup.tasks[0].componentMacroFilename === `${configProductName}${c.markupSourceExtension}`);

            assert(c.scripts.buildTaskPrefix === 'scripts:build:');
            assert(c.scripts.concatTaskPrefix === 'scripts:concatenate:');
            assert(c.scripts.lintTaskPrefix === 'scripts:lint:');
            assert(c.scripts.watchTaskPrefix === 'watch:scripts:');
            assert(c.scripts.tasks[0].name === configProductName);
            assert(c.scripts.tasks[0].outputFilename === `${configProductName}${c.scriptsSourceExtension}`);
            assert(c.scripts.tasks[0].sourcePaths.length === 2);

            assert(c.tokens.namespace === configProductName);
            assert(c.tokens.sourceFile === path.join(c.rootPath, c.tokensPath, c.tokensSourceFile));
            assert(c.tokens.outputPath === path.join(c.rootPath, c.tokensPath));
            assert(c.tokens.formats === c.tokensFormats);

            assert(c.copy.copyTaskPrefix === 'copy:');
            assert(c.copy.tasks[0].name === 'images');
            assert(c.copy.tasks[0].destination === path.join(c.latestVersionWebroot, c.imagesPath));
        });

        xit('should return a task config with product level extensions when a product config file is present', function(){

        });

        xit('should return a task config with full product level override when a product config file is present and configMode is set to "override"', function(){

        });
    });
};
