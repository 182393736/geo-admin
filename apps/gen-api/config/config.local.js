'use strict';

exports.development = {
  overrideDefault: true,
  watchDirs: [ 'app', 'config' ],
  ignoreDirs: [ 'app.js', 'seed.js', 'logs', 'run', 'node_modules', '.git' ],
};
