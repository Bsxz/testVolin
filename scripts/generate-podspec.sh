#!/bin/bash
set -e

# ------------------ 配置 ------------------
MODULE_PATH=node_modules/react-native-aliyun-onekey
IOS_DEST=ios/AliyunOneKey
ANDROID_SETTINGS=android/settings.gradle
ANDROID_BUILD=android/app/build.gradle
PROJECT_NAME=volin  # 替换为你的 Xcode 工程名

# ------------------ 检查模块 ------------------
if [ ! -d "$MODULE_PATH" ]; then
  echo "⚠️ react-native-aliyun-onekey 未安装"
  exit 1
fi

# ------------------ iOS ------------------
echo "➡️ 拷贝 iOS 源码到 $IOS_DEST"
mkdir -p $IOS_DEST
cp -R $MODULE_PATH/ios/* $IOS_DEST/

# 生成占位 podspec（可选，Bare Workflow 下可以不依赖）
PODSPEC=$MODULE_PATH/react-native-aliyun-onekey.podspec
if [ ! -f "$PODSPEC" ]; then
cat <<EOT >> $PODSPEC
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
EOT
  echo "✅ 生成占位 podspec: $PODSPEC"
else
  echo "✅ podspec 已存在: $PODSPEC"
fi

echo "➡️ 请手动确认 AliyunOneKey 源码已加入 Xcode 项目 Build Phases → Compile Sources"

# ------------------ Android ------------------
echo "➡️ 注入 Android settings.gradle"
if ! grep -q "react-native-aliyun-onekey" "$ANDROID_SETTINGS"; then
  echo "include ':react-native-aliyun-onekey'" >> "$ANDROID_SETTINGS"
  echo "project(':react-native-aliyun-onekey').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-aliyun-onekey/android')" >> "$ANDROID_SETTINGS"
  echo "✅ 已注入 settings.gradle"
fi

echo "➡️ 注入 Android build.gradle"
if ! grep -q "react-native-aliyun-onekey" "$ANDROID_BUILD"; then
  # Linux / macOS 通用 sed
  sed -i.bak '/dependencies\s*{/a\
    implementation project('\''\:react-native-aliyun-onekey'\'')
  ' "$ANDROID_BUILD"
  rm "$ANDROID_BUILD.bak"
  echo "✅ 已注入 build.gradle"
fi

echo "✅ 设置完成！请在 Xcode 中确认 AliyunOneKey 源码已加入工程。"