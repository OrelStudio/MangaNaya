#!/bin/bash

VERSION=""

# Get Parameters
while getopts v: flag
do
  case "${flag}" in
    v) VERSION=${OPTARG};;
  esac
done

# Fetch tags
git fetch --prune --unshallow 2>/dev/null
CURRENT_VERSION=$(git describe --abbrev=0 --tags 2>/dev/null)

# If no tag yet, default to v0.1.0
if [[ -z $CURRENT_VERSION ]]; then
  CURRENT_VERSION="v0.1.0"
fi
echo "Current Version: $CURRENT_VERSION"

# Remove leading "v" for splitting
CURRENT_VERSION_NO_V="${CURRENT_VERSION#v}"

# Split into array by "."
CURRENT_VERSION_PARTS=(${CURRENT_VERSION_NO_V//./ })

# Assign each part
VNUM1=${CURRENT_VERSION_PARTS[0]}
VNUM2=${CURRENT_VERSION_PARTS[1]}
VNUM3=${CURRENT_VERSION_PARTS[2]}

# Increase the requested version part
if [[ $VERSION == "major" ]]; then
  VNUM1=$((VNUM1 + 1))
  VNUM2=0
  VNUM3=0
elif [[ $VERSION == "minor" ]]; then
  VNUM2=$((VNUM2 + 1))
  VNUM3=0
elif [[ $VERSION == "patch" ]]; then
  VNUM3=$((VNUM3 + 1))
else
  echo "No valid version type (major, minor, patch) provided"
  exit 1
fi

# Create new tag
NEW_TAG="v${VNUM1}.${VNUM2}.${VNUM3}"
echo "($VERSION) Updating $CURRENT_VERSION to $NEW_TAG"

# Get current commit hash and see if it already has a tag
GIT_COMMIT=$(git rev-parse HEAD)
NEEDS_TAG=$(git describe --contains $GIT_COMMIT 2>/dev/null)

# Only tag if there is no existing tag
if [[ -z "$NEEDS_TAG" ]]; then
  git tag "$NEW_TAG"
  echo "Tagged with $NEW_TAG"
  git push --tags
  git push
else
  echo "Already a tag on this commit"
fi

echo "::set-output name=new_tag::$NEW_TAG"

exit 0
