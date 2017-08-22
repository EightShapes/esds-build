'use strict';

const config = require('./config.js'),
        buildConfig = config.get(),
        fs = require('fs-extra'),
        gulp = require('gulp'),
        inquirer = require('inquirer'),
        mkdirp = require('mkdirp'),
        pluralize = require('pluralize'),
        projectRoot = buildConfig.scaffoldPath,
        componentPath = buildConfig.componentPath,
        componentSinkPath = buildConfig.componentSinkPath;

gulp.task('generate:project-scaffold', function(done){
    const defaultProjectDirectories = [
        'components',
        'dist',
        'docs',
        'icons',
        'images',
        'includes',
        'scripts',
        'styles',
        'templates',
        'tests',
        'tokens'
    ];

    defaultProjectDirectories.forEach(dir => mkdirp.sync(`${projectRoot}/${dir}`));

    fs.copySync(`${__dirname}/../default_templates/docs/index.njk`, `${projectRoot}/docs/index.njk`);
    done();
});

gulp.task('generate:default-config', function(done){
    mkdirp.sync(`${projectRoot}`);
    fs.copySync(`${__dirname}/../default_templates/default-build-config.js`, `${projectRoot}/build-config.js`);
    done();
});

/* eslint-disable no-console */
function generateComponentFiles(answers, done) {
    const componentName = answers.componentName.toLowerCase().replace(/\s/g, '_'),
            pluralComponentName = pluralize.plural(componentName),
            hyphenatedComponentName = pluralComponentName.replace(/_/g, '-');

    if (fs.existsSync(`${componentPath}/${componentName}`)) {
        // Does a component with the same name already exist?
        console.log(`A component named: ${componentName} already exists. Component files NOT generated.`);
        done();
    } else {
        // Create the component's directory
        mkdirp.sync(`${componentPath}/${componentName}`);

        // Create the component's njk file
        const macroContent = `{% macro ${componentName}(class=false) %}\n{% endmacro %}`;

        fs.writeFileSync(`${componentPath}/${componentName}/${componentName}.njk`, macroContent);
        console.log(`${componentPath}/${componentName}/${componentName}.njk created`);

        // Create the component's scss file
        fs.writeFileSync(`${componentPath}/${componentName}/${componentName}.scss`, '');
        console.log(`${componentPath}/${componentName}/${componentName}.scss created`);

        // Create the component's js file if requested
        if (answers.componentJavascript) {
            fs.writeFileSync(`${componentPath}/${componentName}/${componentName}.js`, '');
            console.log(`${componentPath}/${componentName}/${componentName}.js created`);
        }

        // Create the component's sink page
        const sinkPageContent = `{% extends "sink.template.njk" %}`;

        if (!fs.existsSync(componentSinkPath)) {
            mkdirp.sync(componentSinkPath);
        }
        fs.writeFileSync(`${componentSinkPath}/${hyphenatedComponentName}.njk`, sinkPageContent);
        console.log(`${componentSinkPath}/${hyphenatedComponentName}.njk created`);

        console.log("All component files generated. Be sure to @import your component's .scss so it gets compiled");
        done();
    }
}
/* eslint-enable no-console */

gulp.task('generate:new-component', function(done){
    var questions = [{
                name: 'componentName',
                type: 'input',
                message: "What is the name of the component you're creating? (use a singular name, i.e. button, not buttons)"
            },
            {
                name: 'componentJavascript',
                type: 'confirm',
                default: false,
                message: "Generate a javascript file for this component?"
            }];

    return inquirer.prompt(questions).then(function(answers) {
        generateComponentFiles(answers, done);
    });
});

// Only making this a public function so it can be tested, could really be private
module.exports = {
    generateComponentFiles: generateComponentFiles
};
