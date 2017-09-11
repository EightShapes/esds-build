# Installation Instructions
  1. Install `gulp-cli` globally (if it's not already):

  `npm install gulp-cli -g`
  
  2. Install:
  
  `npm install @eightshapes/eightshapes-build-tools --save-dev`
  
  3. Generate top level directories:
  
  `gulp generate:scaffold`

  4. Run the local environment:
  
  `gulp`

# Updating
To update to the latest version of `eightshapes-build-tools` run:
`npm update @eightshapes/eightshapes-build-tools --save` from the root of your project.

# Helpers
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
* [components](#components)
* [data](#data)
* [dist](#dist)
* [docs](#docs)
* [icons](#icons)
* [images](#images)
* [scripts](#scripts)
* [styles](#styles)
* [templates](#templates)
* [tests](#tests)
* [tokens](#tokens)

## components
### Used by
* Design system libraries

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

## data
### Used by
* Documentation sites

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
````

## dist
### Used by
* Design system libraries

### Contains
Compiled project assets. These are committed to version control and intended to be published through various distribution channels such as NPM. Default `dist` files include:
````
├── dist
│   ├── product.css   // Product's compiled stylesheet, based on contents of /styles and /components/**/*.scss
│   ├── product.js    // Product's concatenated scripts, based on contents of /scripts and /components/**/*.js
│   └── product.svg   // Product's generated SVG sprite, based on contents of /icons
````

## docs
### Used by
* Documentation sites
* Design system libraries (sink pages)

### Contains
The source nunjucks files that are compiled into the `.html` pages that make up the product's webroot. For example:
````
├── docs
│   ├── about
│   │   └── release-history.njk
│   └── index.njk
````
Will compile to:
`http://producturl.com/about/release-history.html` and
`http://producturl.com/index.html`

## icons
### Used by
* Design system libraries

### Contains
Source `.svg` assets that are optimized and concatenated into a single SVG sprite. The sprite can then be referenced and included with the `<use>` element: [https://css-tricks.com/svg-use-with-external-reference-take-2/](https://css-tricks.com/svg-use-with-external-reference-take-2/) The SVG sprite is compiled and placed in `/_site/latest/icons/product.svg` by default.
  
## images
### Used by
* Documentation sites

### Contains
Image assets that should be available in the product's webroot. All the files and directories in `/images` are copied to `/_site/latest/images`

## scripts
### Used by 
* Design system libraries
* Documentation sites

### Contains
Scripts that are concatenated along with any scripts matching `/components/**/*.js` and then placed in `/_site/latest/scripts/product.js`. Scripts in `/scripts` will be at the beginning of the concatenated file with scripts in `/components/**/*.js` being appended to the end. Scripts in `/scripts` are used to set up global objects and other cross-component or sitewide concerns.

## styles
### Used by
* Design system libraries
* Documentation sites

### Contains
Styles that are compiled to `/_site/latest/styles`. Any `.scss` file in the root of `/styles` will compiled to a corresponding `.css` file in `/_site/latest/styles`. For example:

````
├── styles
│   ├── doc.scss
│   └── print.scss
````

will be compiled to:
````
├── _site
│   └── latest
│       └── styles
│           ├── doc.css
│           └── print.css
````

## templates
### Used by
* Design system libraries (sink pages)
* Documentation sites

### Contains
Nunjucks layout templates used by pages matching `/docs/**/*.njk`
Example:
````
├── docs
│   └── index.njk
├── templates
│   └── base.njk
````

Within `index.njk` the file may contain:
`{% extends 'templates/base.njk' %}`

## tokens
### Used by
* Design system libraries

### Contains
`tokens.yaml` source file that is compiled into `tokens.scss` and `tokens.json` for consumption by scss and nunjucks respectively. Place [design tokens](https://medium.com/eightshapes-llc/tokens-in-design-systems-25dd82d58421) in `/tokens/tokens.yaml`

# License
Code released under the  [MIT License](https://github.com/EightShapes/esds-build/blob/master/LICENSE.txt).
