# Presentation


## The Problem

 * Required: External Backup Data
 * Required: Encrypted / Trusted.
 * Required: Linux / Open Source
 * Desirable: Versioning
 * Required: Does Not use lots of CPU


## Inspiration

 * Git 
 * Alteryx


## Process

 * Glob - Find all the files
 * Check modification time / size against known Commits
 * Use SHA256 to generate Ids on content (like GIT)
 * Break into parts
 * Encrypt using GPG
 * AWS S3 (or other) holds encrypted file parts
 * When to many / too long / too big create a Commit
 * Encrypt Commit
 * Upload Commit to S3

## Plan on how to use Asciinema for part of presemtatiom

export AWS_PROFILE=keyboardwritescode
mkdir "LNUG Binary Repository Demo"
aws s3 mb "s3://lnug-binary-repository-demo"
./bin/binary-repository init --client-id matt --gpg-key ebak --remote "s3://lnug-binary-repository-demo"  "LNUG Binary Repository Demo"
find ~/Music
cp -R ~/Music/* "LNUG Binary Repository Demo"
find "LNUG Binary Repository Demo"
binary-repository list-upload "LNUG Binary Repository Demo"
binary-repository upload "LNUG Binary Repository Demo"
aws s3 ls "s3://lnug-binary-repository-demo"
aws s3 cp  "s3://lnug-binary-repository-demo/f-53c234e5e8472b6ac51c1ae1cab3fe06fad053beb8ebfd8977b010655bfdd3c3-1-64MB-ebak.ebak" - | gpg -d
binary-repository push "LNUG Binary Repository Demo"
aws s3 ls "s3://lnug-binary-repository-demo"

mkdir "Matt Has Awesome Music"
./bin/binary-repository init --client-id joe --gpg-key ebak --remote "s3://lnug-binary-repository-demo"  "Matt Has Awesome Music"
binary-repository fetch "Matt Has Awesome Music"
binary-repository download "Matt Has Awesome Music"
# Tracklisting is wrong... upload new version
binary-repository list-upload "Matt Has Awesome Music"
# The tracklisting will change
binary-repository upload "Matt Has Awesome Music"
binary-repository push "Matt Has Awesome Music"
binary-repository list-existing "Matt Has Awesome Music"


