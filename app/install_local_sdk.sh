#!/bin/bash
if [ -z ${SDK_INSTALL_PATH+x} ]; then
  echo '$SDK_INSTALL_PATH is not set!';
  exit;
fi

echo "export ANDROID_HOME=$SDK_INSTALL_PATH/android" > $SDK_INSTALL_PATH/.androidrc
echo 'export ANDROID_SDK_ROOT=$ANDROID_HOME' >> $SDK_INSTALL_PATH/.androidrc
echo 'export ANDROID_SDK_ROOT=$ANDROID_HOME' >> $SDK_INSTALL_PATH/.androidrc
echo 'export PATH=$ANDROID_HOME/platform-tools:$PATH' >> $SDK_INSTALL_PATH/.androidrc
echo 'export PATH=$ANDROID_HOME/emulator:$PATH' >> $SDK_INSTALL_PATH/.androidrc
echo 'export PATH=$ANDROID_HOME/cmdline-tools/tools/bin:$PATH' >> $SDK_INSTALL_PATH/.androidrc
echo "export PATH=$SDK_INSTALL_PATH"'/node/bin:$PATH' >> $SDK_INSTALL_PATH/.androidrc
echo "export JAVA_HOME=/usr/lib/jvm/java-1.16.0-openjdk-amd64" >> $SDK_INSTALL_PATH/.androidrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> $SDK_INSTALL_PATH/.androidrc
source $SDK_INSTALL_PATH/.androidrc
cd $SDK_INSTALL_PATH
wget https://dl.google.com/android/repository/commandlinetools-linux-7302050_latest.zip
mkdir -p android/cmdline-tools
cd android/cmdline-tools
unzip -u ../../commandlinetools-linux-7302050_latest.zip
mv cmdline-tools tools
yes | sdkmanager --licenses
sdkmanager emulator
sdkmanager platform-tools
sdkmanager "platforms;android-28"
sdkmanager "build-tools;28.0.3"
sdkmanager "platforms;android-29"
sdkmanager "build-tools;29.0.2"
sdkmanager "platforms;android-29"
sdkmanager "platforms;android-30"
sdkmanager "build-tools;30.0.3"
sdkmanager "system-images;android-29;google_apis_playstore;x86_64"
sdkmanager "system-images;android-28;google_apis_playstore;x86_64"
sdkmanager "system-images;android-30;google_apis_playstore;x86_64"
sdkmanager "system-images;android-28;default;x86_64"
sdkmanager "system-images;android-29;default;x86_64"
cd $SDK_INSTALL_PATH
wget https://nodejs.org/dist/v14.17.3/node-v14.17.3-linux-x64.tar.xz
tar xJf node-v14.17.3-linux-x64.tar.xz
mv node-v14.17.3-linux-x64 node
npm install -g reactnative
npm install -g detox-cli
npm install -g jest
rm *.zip *.xz
