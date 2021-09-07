#!/bin/bash

set -e

BUILD_OUTPUT=${BUILD_OUTPUT:-./dist}
ASSISTED_UI_ROOT=${ASSISTED_UI_ROOT:-../assisted-ui}
UHC_PORTAL=${UHC_PORTAL:-../uhc-portal}
NPM_PROJECT=openshift-assisted-ui-lib

function sync {
  if [ -d "${ASSISTED_UI_ROOT}" ]; then
    rsync -avz --delete "${BUILD_OUTPUT}" "${ASSISTED_UI_ROOT}"/node_modules/${NPM_PROJECT}
  else
    echo Sync to "${ASSISTED_UI_ROOT}"/node_modules/${NPM_PROJECT} skipped
  fi

  if [ -d "${UHC_PORTAL}" ]; then
    rsync -avz --delete "${BUILD_OUTPUT}" "${UHC_PORTAL}"/node_modules/${NPM_PROJECT}
  else
    echo Sync to "${UHC_PORTAL}"/node_modules/${NPM_PROJECT} skipped
  fi
}

function main {
  if [ ! -d "${BUILD_OUTPUT}" ]; then
    mkdir "${BUILD_OUTPUT}"
  fi

  sync
  if [ -d "${ASSISTED_UI_ROOT}" ]; then
    cp ./package.json "${ASSISTED_UI_ROOT}"/node_modules/${NPM_PROJECT}/package.json || true
  fi
  if [ -d "${UHC_PORTAL}" ]; then
    cp ./package.json "${UHC_PORTAL}"/node_modules/${NPM_PROJECT}/package.json || true
  fi

  while fswatch -r ./dist ; do
    sleep 2 # give JS bundler time to write everything
    sync
  done
}

main
