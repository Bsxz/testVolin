const fs = require("fs");
const path = require("path");

const SETTINGS_PATH = path.resolve("android/settings.gradle");
const BUILD_PATH = path.resolve("android/app/build.gradle");

// settings.gradle
let settings = fs.readFileSync(SETTINGS_PATH, "utf8");
if (!settings.includes("react-native-aliyun-onekey")) {
  settings += "\ninclude ':react-native-aliyun-onekey'\n";
  settings +=
    "project(':react-native-aliyun-onekey').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-aliyun-onekey/android')\n";
  fs.writeFileSync(SETTINGS_PATH, settings, "utf8");
  console.log("✅ 已注入 settings.gradle");
}

// build.gradle
let build = fs.readFileSync(BUILD_PATH, "utf8");
if (!build.includes("react-native-aliyun-onekey")) {
  build = build.replace(/dependencies\s?{/, (match) => {
    return (
      match + "\n    implementation project(':react-native-aliyun-onekey')"
    );
  });
  fs.writeFileSync(BUILD_PATH, build, "utf8");
  console.log("✅ 已注入 build.gradle");
}
