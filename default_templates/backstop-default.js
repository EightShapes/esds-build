const runtimeConfig = require('./backstop-runtime-config.json')
const packageConfig = require('./package.json')

const localConfig = {
    "id": packageConfig.name,
    "viewports": [
      {
        "label": "",
        "width": 1024,
        "height": 768
      }
    ],
    "scenarios": [
        {
            "label": "",
            "url": `http://${runtimeConfig.hostUrl}:${runtimeConfig.testingPort}/index.html`,
            "misMatchThreshold" : 0.1,
            "requireSameDimensions": true
        }
    ],
    "paths": {
      "bitmaps_reference": "backstop_data/bitmaps_reference",
      "bitmaps_test": "backstop_data/bitmaps_test",
      "engine_scripts": "backstop_data/engine_scripts",
      "html_report": "backstop_data/html_report",
      "ci_report": "backstop_data/ci_report"
    },
    "report": ["browser", "json"],
    "engine": "chrome"
}

module.exports = { ...runtimeConfig.baseConfig, ...localConfig }
