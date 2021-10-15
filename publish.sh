#! /bin/bash

echo "====================="
echo "auto git"
echo "=======  🤪 ========="
echo ""
echo "git add ."

git add .
git status

echo ""
echo "git commit -m 'update version'"
echo ""

git commit -m 'update version'

current_banch=$(git symbolic-ref --short -q HEAD) 

echo ""
echo "git push origin $current_banch"
echo ""

git push origin $current_banch

echo "npm publish"
echo ""
npm publish
