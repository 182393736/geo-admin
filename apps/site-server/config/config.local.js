'use strict';

module.exports = () => {
  const config = {};

  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1:27017/site_manage',
      options: {},
    },
  };

  return config;
};
