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
aws s3 --force rb "s3://lnug-binary-repository-demo"
rm -rf "LNUG Binary Repository Demo"
rm -rf "Matt Has Awesome Music"


aws s3 mb "s3://lnug-binary-repository-demo"


mkdir "LNUG Binary Repository Demo"
binary-repository init --client-id matt --gpg-key ebak --remote "s3://lnug-binary-repository-demo"  "LNUG Binary Repository Demo"
cp -R ~/Music/* "LNUG Binary Repository Demo"
binary-repository list-upload "LNUG Binary Repository Demo"
binary-repository upload "LNUG Binary Repository Demo"
aws s3 ls "s3://lnug-binary-repository-demo"
cat Track LNUG\ Binary\ Repository\ Demo/.binary-repository/pending-commit/* | grep Track
aws s3 cp  "s3://lnug-binary-repository-demo/f-4f564f60a1a267f019789195f5f1c67aac21e6d503fe15f1b142c68a92f40b9d-1-64MB-ebak.ebak" - | gpg -d
binary-repository push "LNUG Binary Repository Demo"

##########################################

mkdir "Matt Has Awesome Music"
binary-repository init --client-id joe --gpg-key ebak --remote "s3://lnug-binary-repository-demo"  "Matt Has Awesome Music"
binary-repository fetch "Matt Has Awesome Music"
binary-repository download "Matt Has Awesome Music"
# Tracklisting is wrong... I need to edit!
nvim "Matt Has Awesome Music/Vangelis/Blade Runner - Music From The Original Soundtrack/Track Listing.txt"
# Done editing... Push a new version
binary-repository list-upload "Matt Has Awesome Music"
# The tracklisting will change
binary-repository upload "Matt Has Awesome Music"
binary-repository push "Matt Has Awesome Music"

# ==============================================

binary-repository fetch "LNUG Binary Repository Demo"
binary-repository list-download "LNUG Binary Repository Demo"
binary-repository download "LNUG Binary Repository Demo"
cat "Matt Has Awesome Music/Vangelis/Blade Runner - Music From The Original Soundtrack/Track Listing.txt"
