// Spike only: ML Kit ships no arm64 iOS-simulator slice, so iOS measures Vision alone.
module.exports = {
  dependencies: {
    '@react-native-ml-kit/text-recognition': { platforms: { ios: null } },
  },
};
