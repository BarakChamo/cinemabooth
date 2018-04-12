exports.config =
  # See http://brunch.io/#documentation for docs.
  files:
    javascripts:
      joinTo: 'app.js'
    stylesheets:
      joinTo: 'app.css'
    templates:
      joinTo: 'app.js'
  npm:
    globals:
      THREE: 'three'
      dat: 'dat-gui'
  plugins:
    babel:
      presets: ["es2015", "stage-0"]
      plugins: ["transform-async-to-generator"]
