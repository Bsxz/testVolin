const fs = require("fs");
const path = require("path");
const xcode = require("xcode");

// ------------------ 配置 ------------------
const MODULE_PATH = path.resolve("node_modules/react-native-aliyun-onekey/ios");
const IOS_DEST = path.resolve("ios/AliyunOneKey");
const PROJECT_NAME = "volin"; // 替换为你的 Xcode 工程名

// ------------------ 拷贝源码 ------------------
function copyRecursiveSync(src, dest) {
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
}

copyRecursiveSync(MODULE_PATH, IOS_DEST);
console.log(`✅ 已拷贝 AliyunOneKey iOS 源码到 ${IOS_DEST}`);

// ------------------ 生成占位 podspec ------------------
const PODSPEC = path.join(MODULE_PATH, "react-native-aliyun-onekey.podspec");
if (!fs.existsSync(PODSPEC)) {
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
  fs.writeFileSync(PODSPEC, content, "utf8");
  console.log(`✅ 自动生成占位 podspec: ${PODSPEC}`);
} else {
  console.log(`✅ podspec 已存在: ${PODSPEC}`);
}

// ------------------ 注册到 Xcode ------------------
const pbxprojPath = path.join(
  "ios",
  `${PROJECT_NAME}.xcodeproj/project.pbxproj`
);
const project = xcode.project(pbxprojPath);
project.parseSync();

// 查找或创建组
let groupKey = project.findPBXGroupKey({ name: "AliyunOneKey" });
let group =
  groupKey ||
  project.addPbxGroup([], "AliyunOneKey", "AliyunOneKey", null, {
    sourceTree: '"<group>"',
  });

// 遍历拷贝的文件，加入 Compile Sources
fs.readdirSync(IOS_DEST).forEach((file) => {
  const filepath = path.join(IOS_DEST, file);
  if (fs.lstatSync(filepath).isFile() && /\.(m|mm|h|swift)$/.test(file)) {
    const relativePath = path.relative("ios", filepath); // 相对 ios 文件夹
    if (!project.hasFile(relativePath)) {
      project.addSourceFile(
        relativePath,
        { target: project.getFirstTarget().uuid },
        group.uuid
      );
      console.log(`✅ 注册文件到 Xcode: ${relativePath}`);
    }
  }
});

// 写回 pbxproj
fs.writeFileSync(pbxprojPath, project.writeSync());
console.log("✅ AliyunOneKey iOS 源码已自动注册到 Xcode 工程");
