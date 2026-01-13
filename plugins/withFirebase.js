const { 
  withProjectBuildGradle, 
  withAppBuildGradle, 
  withGradleProperties 
} = require('@expo/config-plugins');

const withFirebase = (config) => {
  // Add Google Services classpath to project build.gradle
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.indexOf('com.google.gms:google-services') === -1) {
      config.modResults.contents = config.modResults.contents.replace(
        /dependencies\s*{/,
        `dependencies {
        classpath('com.google.gms:google-services:4.4.2')`
      );
    }
    return config;
  });

  // Apply Google Services plugin to app build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.indexOf('com.google.gms.google-services') === -1) {
      config.modResults.contents = config.modResults.contents.replace(
        /apply plugin: "com.android.application"/,
        `apply plugin: "com.android.application"
apply plugin: "com.google.gms.google-services"`
      );
    }
    return config;
  });

  // Configure gradle.properties for Firebase
  config = withGradleProperties(config, (config) => {
    const properties = [
      { key: 'FirebaseSDKVersion', value: '33.1.1' },
      { key: 'ReactNative_compileSdkVersion', value: '36' },
      { key: 'ReactNative_targetSdkVersion', value: '36' },
      { key: 'ReactNative_minSdkVersion', value: '24' }
    ];

    properties.forEach(prop => {
      const existing = config.modResults.find(
        item => item.type === 'property' && item.key === prop.key
      );
      
      if (!existing) {
        config.modResults.push({
          type: 'property',
          key: prop.key,
          value: prop.value
        });
      }
    });
    
    return config;
  });

  return config;
};

module.exports = withFirebase;
