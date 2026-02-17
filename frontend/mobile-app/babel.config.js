module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Only enable reanimated plugin for native, not web
      process.env.BABEL_ENV === 'web' ? null : 'react-native-reanimated/plugin',
    ].filter(Boolean),
  };
};
