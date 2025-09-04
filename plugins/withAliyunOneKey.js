const {
  withAndroidManifest,
  withInfoPlist,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");
const xcode = require("xcode");

// ------------------- 工具函数 -------------------
const copyRecursiveSync = (src, dest) => {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src).forEach((file) => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    if (fs.lstatSync(srcFile).isDirectory()) {
      copyRecursiveSync(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
};

const addIOSFilesToXcodeProj = (projectRoot, iosFolder, projectName) => {
  const pbxprojPath = path.join(
    projectRoot,
    `${projectName}.xcodeproj/project.pbxproj`
  );
  const project = xcode.project(pbxprojPath);
  project.parseSync();

  const groupKey = project.findPBXGroupKey({ name: "AliyunOneKey" });
  const group =
    groupKey ||
    project.addPbxGroup([], "AliyunOneKey", "AliyunOneKey", null, {
      sourceTree: '"<group>"',
    });

  fs.readdirSync(iosFolder).forEach((file) => {
    const filepath = path.join(iosFolder, file);
    if (fs.lstatSync(filepath).isFile() && /\.(m|mm|h|swift)$/.test(file)) {
      if (!project.hasFile(file)) {
        project.addSourceFile(
          file,
          { target: project.getFirstTarget().uuid },
          group.uuid
        );
      }
    }
  });

  fs.writeFileSync(pbxprojPath, project.writeSync());
  console.log("✅ AliyunOneKey iOS 源码已注册到 Xcode 工程");
};

const ensurePodspec = (modulePath) => {
  const podspecPath = path.join(
    modulePath,
    "react-native-aliyun-onekey.podspec"
  );
  if (!fs.existsSync(podspecPath)) {
    const content = `
Pod::Spec.new do |s|
  s.name         = "react-native-aliyun-onekey"
  s.version      = "1.0.0"
  s.summary      = "Dummy podspec for AliyunOneKey"
  s.description  = "Temporary podspec to bypass CocoaPods install error."
  s.homepage     = "https://github.com/aliyun/react-native-aliyun-onekey"
  s.license      = { :type => "MIT" }
  s.authors      = { "Aliyun" => "support@aliyun.com" }
  s.platforms    = { :ios => "10.0" }
  s.source       = { :path => "." }
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc = true
end
`;
    fs.writeFileSync(podspecPath, content, "utf8");
    console.log("✅ 自动生成占位 podspec:", podspecPath);
  }
};

const injectSettingsGradle = (settingsPath) => {
  if (!fs.existsSync(settingsPath)) return;
  let content = fs.readFileSync(settingsPath, "utf8");

  const includeLine = `include ':react-native-aliyun-onekey'`;
  const projectLine = `project(':react-native-aliyun-onekey').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-aliyun-onekey/android')`;

  if (!content.includes(includeLine)) {
    content += `\n${includeLine}\n${projectLine}\n`;
    fs.writeFileSync(settingsPath, content, "utf8");
    console.log("✅ react-native-aliyun-onekey 已注入 settings.gradle");
  }
};

// ------------------- Expo Config Plugin -------------------
const withAliyunOneKey = (config) => {
  // AndroidManifest 权限
  config = withAndroidManifest(config, (config) => {
    const permissions = [
      "android.permission.READ_PHONE_STATE",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.INTERNET",
    ];

    const manifest = config.modResults;
    if (!manifest.manifest["uses-permission"]) {
      manifest.manifest["uses-permission"] = [];
    }

    permissions.forEach((perm) => {
      if (
        !manifest.manifest["uses-permission"].some(
          (p) => p.$["android:name"] === perm
        )
      ) {
        manifest.manifest["uses-permission"].push({
          $: { "android:name": perm },
        });
      }
    });

    return config;
  });

  // iOS Info.plist 配置
  config = withInfoPlist(config, (config) => {
    config.modResults.NSAppTransportSecurity = { NSAllowsArbitraryLoads: true };
    config.modResults.LSApplicationQueriesSchemes = [
      ...(config.modResults.LSApplicationQueriesSchemes || []),
      "taobao",
      "alipays",
    ];
    return config;
  });

  // Android build.gradle + settings.gradle
  config = withDangerousMod(config, [
    "android",
    (config) => {
      const gradlePath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "build.gradle"
      );
      let gradleContents = fs.readFileSync(gradlePath, "utf-8");
      if (!gradleContents.includes("react-native-aliyun-onekey")) {
        gradleContents = gradleContents.replace(
          /dependencies\s?{/,
          `dependencies {\n      implementation project(':react-native-aliyun-onekey')`
        );
        fs.writeFileSync(gradlePath, gradleContents);
      }

      const settingsPath = path.join(
        config.modRequest.platformProjectRoot,
        "settings.gradle"
      );
      injectSettingsGradle(settingsPath);

      return config;
    },
  ]);

  // iOS：拷贝源码 + 注册 Xcode + 生成 podspec
  config = withDangerousMod(config, [
    "ios",
    (config) => {
      const modulePath = path.resolve(
        "node_modules/react-native-aliyun-onekey"
      );
      const src = path.join(modulePath, "ios");
      const dest = path.join(
        config.modRequest.platformProjectRoot,
        "AliyunOneKey"
      );

      copyRecursiveSync(src, dest);
      ensurePodspec(modulePath);

      const projectName = config.modRequest.projectName;
      addIOSFilesToXcodeProj(
        config.modRequest.platformProjectRoot,
        dest,
        projectName
      );

      return config;
    },
  ]);

  return config;
};

module.exports = withAliyunOneKey;
