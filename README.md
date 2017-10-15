# Binary Repository

## What is this?

This code is for data synchronization / backup of files via encrypted via GPG. It currently supports either AWS S3 or local files for storage of the repository.

It stores full versions of all files along with a SHA256 checksum and other metadata. It is technically possible to retrieve any version of the data from the repository and the files commit files themselves are in (encrypted) plain text files, ensuring that your data will always be accessible (as long as you have your encryption keys).

## Why?

I was attempting to use Git Annex for quite a while but as my data storage server is in the living room I became frustrated with its high CPU and memory requirements causing the fans to be constantly at high speed.

I looked around for other alternatives that would work on Linux but could not find any which I found satisfactory.

## Development

This is primarily a TypeScript based NodeJS project but it uses a lot of shell functions for encryption and even copying data to S3. It is built almost entirely using Streams which will hopefully give lower CPU/memory requirements and make changing S3 or GPG for other alternatives be relatively easy if so desired.

There is good test coverage as well as a full, bash based backup / restoration test.

## Current Stage

### Complete

 * [1] Making decisions on which data needs to be backed up (somewhat like rsync)
 * [1] Encrypting Data
 * [1] Uploading Data
 * [1] Storing a record (encrypted) of what and which data has been backed up
 * [1] Deciding which data to download
 * [1] Downloading data
 * [1] Restoring data
 * [1] Simplify Commit file format
 * [1] Store Filepart's GpgKey and Filepart Byte Threshold within Commit file.
 * [2] Allow different GPG Key for Commit file.
 * [2] Check correct encryption / decryption used in integration test

### In Progress

 * [2] Add the ClientId to the Filepart name in the repository.
 * [3] Time to eat my own dogfood

### To do

 * [4] List encryption / decryption keys in GPG (and add backup methods)
 * [4] Allow adding of Filepart decription key to be ignored into Config
 * [4] Skip over remote Filepart where the encryption key is ignored.
 * [5] Add a check to that the ClientId id no already used on init
 * [6] Tidy up command line interface output
 * [7] Ensure README.md is ready for public consumption and add a user guide
 * [8] Recruit other people to try the dogfood - From this point backwards compatibility will be maintained.
 * [8] Add the ability to remove files
 * [9] Add an option to force SHA256 to be checked for all files.
 * [10] Allow restoration / download of selected files
 * [11] Allow purge of old (removed) FilePart from S3

## Future Plans

I would like to have some form of slick user interface which would make it accessible to people who don't live at the command line.

## GPG in this context

In the main normal usecase of PGP you publicise your public PGP key which is for encryption (others creating emails to you) and keep your private (secret) key private, so only you can read what others wrote to you.

In the context of this software, you should put your public key onto servers you want to back up and keep your private (secret) key where you want to restore it. Your backups can be stored on an untrusted storage mechanism, such as AWS S3.
