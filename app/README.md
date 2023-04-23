# TwoNotes - React Native app

## Setup

```bash
git submodule update --init

export SDK_INSTALL_PATH=/scratch/$USER/sdk

# This line is for Ensimag PCs compatibility,
# comment it out if you are on your own computer
CACHE_DIRS_BASE=/scratch/$USER

# ENSIMAG PCs CONFIG BEGIN
# We are setting the caches of npm to /scratch
# to avoid filling the homedir which is quota-limited
npm install -g npm

if [ -z ${CACHE_DIRS_BASE+x} ]; then
  NPM_CACHE_DIR=$CACHE_DIRS_BASE/.npm

  mkdir -p $NPM_CACHE_DIR

  npm config set -g cache="$NPM_CACHE_DIR" prefix="$NPM_CACHE_DIR"

  # You can add the following line to your .profile
  export PATH="$PATH:$NPM_CACHE_DIR"
fi
# ENSIMAG PCs CONFIG END

mkdir -p $SDK_INSTALL_PATH
./install_local_sdk.sh
source /scratch/$USER/sdk/.androidrc

npm i
```

## Running the app

Attach an Android device via usb (adb) or use the emulator.

```bash
source $SDK_INSTALL_PATH/.androidrc
npm run start
npm run android
```
