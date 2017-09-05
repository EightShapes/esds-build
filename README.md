# Installation Instructions
  1. Install `gulp-cli` globally (if it's not already):

  `npm install gulp-cli -g`
  
  2. Install:
  
  `npm install @eightshapes/eightshapes-build-tools --save-dev`
  
  3. Generate top level directories:
  
  `gulp generate:scaffold`

  4. Run the local environment:
  
  `gulp`

## Generate top level directories
`gulp generate:scaffold`
Generates the following top level directories:
````
.
├── components
├── data
├── dist
├── docs
├── icons
├── images
├── includes
├── scripts
├── styles
├── templates
├── tests
└── tokens
````

## Generate default config file
`gulp generate:default-config`
Copies the [default config](https://github.com/EightShapes/eightshapes-build-tools/blob/master/default_templates/eightshapes-build-tools-config-default.js) into the root of your project at:
````
.
└── eightshapes-build-tools-config.js
````

## Generate new component files
`gulp generate:new-component`

This will trigger a command line prompt asking for the name of the new component. Typing "data table" for the name will generate the following files, shown at their default paths:
````
/components/data_table/data_table.js (optional)
/components/data_table/data_table.njk
/components/data_table/data_table.scss
/docs/sink-pages/components/data-tables.njk
````

# Project structure
The flat directory structure created by the scaffold generator provides a location for various types of code. The directory structure is as follows:
* components
* data
* dist
* docs
* icons
* images
* includes
* scripts
* styles
* templates
* tests
* tokens

## Components
### Used by
* Design system component libraries

### Contains
All of the assets that form a component. Each component's markup, style and script is housed in a subdirectory with that component's name:
````
.
├── components
│   ├── button
│   │   ├── button.js
│   │   ├── button.njk
│   │   └── button.scss
│   ├── data_table
│   │   ├── data_table.njk
│   │   └── data_table.scss
````

## Data
### Used by
* Documentation sites
* Websites

### Contains
`.json` files with key/value pairs that are made available to the nunjucks templating engine. Each file is parsed and namespaced in nunjucks using the filename. For example, given the following files:

````
├── data
│   ├── animals.json
│   └── content.json
````

With `animals.json` containing:
````
{
    "elephant": "gray",
    "tiger": "orange",
    "duck": "yellow"
}
````

and `content.json` containing:
````
{
    "copyright": "&copy; 2017 Your Company Name",
    "site_nav": [
        {
            "label": "Home",
            "href": "/"
        },
        {
            "label": "Contribute",
            "href": "/contribute.html"
        }
    ]
}
````

the following variables will be available globally in the nunjucks templating environment:
````
{{ animals.elephant }}  {# would render "gray" #}
{{ content.copyright }} {# would render "© 2017 Your Company Name" #}
