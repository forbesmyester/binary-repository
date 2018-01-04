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

## Usage

### Preperations

First identify the public/private key you wish to backup by using `gpg --list-keys` or create a new one with `gpg --quick--gen-key`.

You will then also need an writable AWS S3 Bucket, which can be easily created using `aws s3 mb s3://[BUCKET NAME]`. If you do not want to do that you can also back up to local files, which will still be fully encrypted.

### The First Client

Get the GPG Key Id by using `gpg --list-keys`, which is the long hexadecimal number. Once you have this the next and most difficult step is to initialize the repository, this is done by the following:

    binary-repository init --client-id "[YOUR NAME]" --gpg-key [YOUR KEY ID] --remote "s3://[BUCKET NAME]" "[DIRECTORY NAME]"

Once you have the directory initialized you can use virtually all of the `binary-repository` commands by only referencing the `[DIRECTORY NAME]`, which is much easier.

## Backing up GPG keys

To back it up you need to export the secret key (for reading your backups) and perhaps your public key (if you wish to keep creating backups after the disaster). This is done like so:

    gpg --export-secret-keys -a D69487B716DAAA4A30D6A090691E0826BF39FE6C > binary-repository-key.gpg.priv
    gpg --export-keys -a D69487B716DAAA4A30D6A090691E0826BF39FE6C > binary-repository-key.gpg.pub
    
Verify that `binary-repository-key.gpg.priv` includes the words `-----BEGIN PGP PRIVATE KEY BLOCK-----` and that `binary-repository-key.gpg.pub` includes the words `-----BEGIN PGP PUBLIC KEY BLOCK-----` at the top. Both should be followed by a blank line and the followed by lots of binary data (the private one should be longer).

Keep these files safe, I have them in active use on another computer but also printed out and mailed to my parents home address.

To re-import the keys do something like the following:

    $ gpg --import binary-repository-key.gpg.priv
    gpg: key 3F4B6EDD9CE5E240: public key "Matthew Forrester (Key for use with binary-repository)" imported
    gpg: key 3F4B6EDD9CE5E240: secret key imported
    gpg: Total number processed: 1
    gpg:               imported: 1
    gpg:       secret keys read: 1
    gpg:   secret keys imported: 1
    
    $ gpg --import binary-repository-key.gpg.pub 
    gpg: key 3F4B6EDD9CE5E240: "Matthew Forrester (Key for use with binary-repository)" not changed
    gpg: Total number processed: 1
    gpg:              unchanged: 1


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
 * [2] Add the FilePartByteCountThreshold to the Filepart name in the repository.
 * [3] Add GPGKey as part of Filepart to stop name collisions.
 * [4] Time to eat my own dogfood
 * [5] Allow listing of what would be uploaded / needs backing up.
 * [6] Allow listing of what would be download / restored.
 * [7] Allow view of Database
 * [8] Present at LNUG
 * [9] GPG Key name is used as part of S3Object name, Force to be key id?
 * [15] List removed files

### In Progress

 * [15] Add the ability to remove files

### To do

 * [10] Can we list valid gpg keys to use?
 * [11] Allow skipping over restoration of (some files)... what are the implications?
 * [12] Do we still need ClientId?
 * [13] Polish command line interface output
 * [14] Ensure README.md is ready for public consumption and add a user guide
 * [16] Add an option to force SHA256 to be checked for all files.
 * [17] Allow restoration / download of selected files
 * [18] Allow purge of old (removed) FilePart from S3

## Future Plans

I would like to have some form of slick user interface which would make it accessible to people who don't live at the command line.

## GPG in this context

In the main normal usecase of PGP you publicise your public PGP key which is for encryption (others creating emails to you) and keep your private (secret) key private, so only you can read what others wrote to you.

In the context of this software, you should put your public key onto servers you want to back up and keep your private (secret) key where you want to restore it. Your backups can be stored on an untrusted storage mechanism, such as AWS S3.
