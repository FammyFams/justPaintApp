// Signs local Android release builds with the Google Play upload key, when this PC has it.
// The key file and its passwords stay out of the repo, in ~/.gradle/gradle.properties:
//   JUSTPAINT_UPLOAD_STORE_FILE, JUSTPAINT_UPLOAD_KEY_ALIAS,
//   JUSTPAINT_UPLOAD_STORE_PASSWORD, JUSTPAINT_UPLOAD_KEY_PASSWORD
// Without them (EAS cloud builds, other machines) release keeps Expo's default signing.
const { WarningAggregator, withAppBuildGradle } = require('expo/config-plugins');

const MARKER = 'JUSTPAINT_UPLOAD_STORE_FILE';

const UPLOAD_CONFIG = `signingConfigs {
        upload {
            if (project.hasProperty('${MARKER}')) {
                storeFile file(JUSTPAINT_UPLOAD_STORE_FILE)
                storePassword JUSTPAINT_UPLOAD_STORE_PASSWORD
                keyAlias JUSTPAINT_UPLOAD_KEY_ALIAS
                keyPassword JUSTPAINT_UPLOAD_KEY_PASSWORD
            }
        }`;

const RELEASE_SIGNING = `signingConfig project.hasProperty('${MARKER}') ? signingConfigs.upload : signingConfigs.debug`;

// The first `release {` in the template is buildTypes.release (signingConfigs only has debug).
const RELEASE_DEBUG_SIGNING = /(release\s*\{[^}]*?)signingConfig signingConfigs\.debug/;

function withUploadSigning(config) {
  return withAppBuildGradle(config, (config) => {
    const gradle = config.modResults.contents;
    if (gradle.includes(MARKER)) return config;

    if (!gradle.includes('signingConfigs {') || !RELEASE_DEBUG_SIGNING.test(gradle)) {
      WarningAggregator.addWarningAndroid(
        'with-upload-signing',
        "Couldn't find the release signing config in app/build.gradle; release builds keep the debug key.",
      );
      return config;
    }

    config.modResults.contents = gradle
      .replace('signingConfigs {', UPLOAD_CONFIG)
      .replace(RELEASE_DEBUG_SIGNING, `$1${RELEASE_SIGNING}`);
    return config;
  });
}

module.exports = withUploadSigning;
