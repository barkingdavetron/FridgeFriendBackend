// babel.config.js required so jest tests can run using modern js syntaxx
module.exports = {
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  };
  