'use strict';

const productBuildConfigFileName = 'eightshapes-build-tools-config',
        config = require('./config.js'),
        c = config.get(),
        fs = require('fs-extra'),
        path = require('path'),
        gulp = require('gulp'),
        inquirer = require('inquirer'),
        mkdirp = require('mkdirp'),
        pluralize = require('pluralize');

function createTopLevelDirectories(rootPath) {
    // TODO: Make this idempotent and non-destructive
    const topLevelDirectories = [
        'components',
        'data',
        'dist',
        'docs',
        'icons',
        'images',
        'scripts',
        'styles',
        'templates',
        'test',
        'tokens'
    ];

    topLevelDirectories.forEach(dir => mkdirp.sync(path.join(rootPath, dir)));

    fs.copySync(`${__dirname}/../default_templates/docs/index.njk`, path.join(rootPath, c.docsPath, `index${c.markupSourceExtension}`));
    fs.copySync(`${__dirname}/../default_templates/.gitignore-default`, `${rootPath}/.gitignore`);
    fs.copySync(`${__dirname}/../default_templates/.npmignore-default`, `${rootPath}/.npmignore`);
    fs.copySync(`${__dirname}/../default_templates/templates/sink.njk`, path.join(rootPath, c.templatesPath, `sink${c.markupSourceExtension}`));
    fs.copySync(`${__dirname}/../default_templates/templates/base.njk`, path.join(rootPath, c.templatesPath, `base${c.markupSourceExtension}`));
}

function copyDefaultConfig(rootPath) {
    const defaultConfigPath = path.join(__dirname, '..', 'default_templates', `${productBuildConfigFileName}-default.js`),
            copiedConfigPath = path.join(rootPath, `${productBuildConfigFileName}.js`);
    mkdirp.sync(rootPath);
    fs.copySync(defaultConfigPath, copiedConfigPath);
}

gulp.task('generate:scaffold', function(done){
    createTopLevelDirectories(c.rootPath);
    done();
});

gulp.task('generate:default-config', function(done){
    copyDefaultConfig(c.rootPath);
    done();
});

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

/* eslint-disable no-console */
function generateComponentFiles(answers, rootPath) {
    const componentName = answers.componentName.toLowerCase().replace(/\s/g, '_'),
            pluralComponentName = pluralize.plural(componentName),
            componentSinkTitle = toTitleCase(pluralComponentName.replace(/_/g, ' ')),
            hyphenatedComponentName = pluralComponentName.replace(/_/g, '-'),
            componentDirectory = path.join(rootPath, c.componentsPath, componentName),
            componentMarkupFilename = path.join(componentDirectory, `${componentName}${c.markupSourceExtension}`),
            componentStylesFilename = path.join(componentDirectory, `${componentName}${c.stylesSourceExtension}`),
            componentScriptsFilename = path.join(componentDirectory, `${componentName}${c.scriptsSourceExtension}`),
            componentSinkDirectory = path.join(rootPath, c.docsPath, c.sinksPath, c.componentsPath),
            componentSinkFilename = path.join(componentSinkDirectory, `${hyphenatedComponentName}${c.markupSourceExtension}`);

    if (fs.existsSync(componentDirectory)) {
        // Does a component with the same name already exist?
        console.log(`A component named: ${componentName} already exists. Component files NOT generated.`);
    } else {
        // Create the component's directory
        mkdirp.sync(componentDirectory);

        // Create the component's njk file
        const macroContent = `{% macro ${componentName}(class=false) %}\n{% endmacro %}`;

        fs.writeFileSync(componentMarkupFilename, macroContent);
        console.log(`${componentMarkupFilename} created`);

        // Create the component's scss file
        fs.writeFileSync(componentStylesFilename, '');
        console.log(`${componentStylesFilename} created`);

        // Create the component's js file if requested
        if (answers.componentJavascript) {
            fs.writeFileSync(componentScriptsFilename, '');
            console.log(`${componentScriptsFilename} created`);
        }

        // Create the component's sink page
        const sinkPageContent = `{% extends "${c.templatesPath}/sink${c.markupSourceExtension}" %}
{% block body %}
    {% filter markdown %}
        # ${componentSinkTitle} Sink
    {% endfilter %} 
    {# Your sink examples go here #} 
{% endblock body %}`;

        if (!fs.existsSync(componentSinkDirectory)) {
            mkdirp.sync(componentSinkDirectory);
        }
        fs.writeFileSync(componentSinkFilename, sinkPageContent);
        console.log(`${componentSinkFilename} created`);

        console.log("All component files generated. Be sure to @import your component's .scss so it gets compiled");
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
        generateComponentFiles(answers, c.rootPath);
        done();
    });
});

// Only making this a public function so it can be tested, could really be private
module.exports = {
    generateComponentFiles: generateComponentFiles,
    createTopLevelDirectories: createTopLevelDirectories,
    copyDefaultConfig: copyDefaultConfig
};
