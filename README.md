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

### Setting up GPG

This software uses GPG to protect your data. This is good because it has plenty of eyes looking at it to make sure that it is safe to use, but also because there is already a lot of documentation available on the internet.

At the moment I think your reading list should include [Chris Erin's Hashrocket Post](https://hashrocket.com/blog/posts/encryption-with-gpg-a-story-really-a-tutorial) as well as the [Using Stronger Algorithms section](https://futureboy.us/pgp.html#StrongerAlgorithms) of Alan Eliasen GPG Tutorial. You'll also need to pick your encryption algorithm, which at the time of writing (2017-10-19), AES256 looks like a good option.

If you read the above you will undestand that you need to generate a public key for encrypting the data as well as keeping a private key for decrypting the data.

First step is to generate the Keys:

    $ gpg --full-gen-key
    gpg (GnuPG) 2.1.18; Copyright (C) 2017 Free Software Foundation, Inc.
    This is free software: you are free to change and redistribute it.
    There is NO WARRANTY, to the extent permitted by law.
    
    Please select what kind of key you want:
       (1) RSA and RSA (default)
       (2) DSA and Elgamal
       (3) DSA (sign only)
       (4) RSA (sign only)
    Your selection? 1
    RSA keys may be between 1024 and 4096 bits long.
    What keysize do you want? (2048) 4096
    Requested keysize is 4096 bits
    Please specify how long the key should be valid.
             0 = key does not expire
          <n>  = key expires in n days
          <n>w = key expires in n weeks
          <n>m = key expires in n months
          <n>y = key expires in n years
    Key is valid for? (0) 0
    Key does not expire at all
    Is this correct? (y/N) y
    
    GnuPG needs to construct a user ID to identify your key.
    
    Real name: Matthew Forrester
    Email address: _____@__________.com
    Comment: Key for use with binary-repository
    You selected this USER-ID:
        "Matthew Forrester (Key for use with binary-repository) <_____@__________.com>"
    
    Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O

I then wanted to make sure that I'm using a sensibly strong level of encryption:

    $ gpg --interactive --edit-key ____@____________.com
    gpg (GnuPG) 2.1.18; Copyright (C) 2017 Free Software Foundation, Inc.
    This is free software: you are free to change and redistribute it.
    There is NO WARRANTY, to the extent permitted by law.
    
    Secret key is available.
    
    sec  rsa4096/B22BFB8D3C5790FD
         created: 2017-09-09  expires: never       usage: SC
         trust: ultimate      validity: ultimate
    ssb  rsa4096/EB2BFB03B02164A4
         created: 2017-10-19  expires: never       usage: E
    [ultimate] (1). Matthew Forrester (Key for use with binary-repository) <____@____________.com>
    
    gpg> showpref
    [ultimate] (1). Matthew Forrester (Key for use with binary-repository) <____@____________.com>
         Cipher: AES256, AES192, AES, 3DES
         Digest: SHA256, SHA384, SHA512, SHA224, SHA1
         Compression: ZLIB, BZIP2, ZIP, Uncompressed
         Features: MDC, Keyserver no-modify

It seems that my version of GPG was configured pretty well by default (was looking for AES256), which is great.

#### Important, Make sure you can restore your backups!

Once you've got your keys created. You probably ought to consider backing them up, so you can recover from disaster. I plan to integrate this into `binary-repository` at some point but right now you have to do it manually... fear not, it's not hard!

First identify the public/private key you wish to backup:

    $ gpg --list-keys
    /home/fozz/.gnupg/pubring.kbx
    -----------------------------
    pub   rsa2048 2017-09-09 [SC]
          D69487B716DAAA4A30D6A090691E0826BF39FE6C
    uid           [ultimate] Matthew Forrester (Key for use with binary-repository)
    sub   rsa2048 2017-09-29 [E]
    
    $ gpg --list-secret-keys
    /home/fozz/.gnupg/pubring.kbx
    -----------------------------
    sec   rsa2048 2017-09-09 [SC] [expires: 2019-09-09]
          D69487B716DAAA4A30D6A090691E0826BF39FE6C
    uid           [ultimate] Matthew Forrester (Key for use with binary-repository) 
    ssb   rsa2048 2017-09-09 [E]

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
 * [5] Allow listing of what would be uploaded / needs backing up.
 * [5] Allow listing of what would be download / restored.
 * [5] Allow view of Database

### In Progress

 * [4] Time to eat my own dogfood

### To do

 * [5] List encryption / decryption keys in GPG (and add backup methods)
 * [5] Allow skipping over restoration of (some files)... what are the implications?
 * [6] Add a check to that the ClientId id no already used on init
 * [7] Tidy up command line interface output
 * [8] Ensure README.md is ready for public consumption and add a user guide
 * [9] Recruit other people to try the dogfood - From this point backwards compatibility will be maintained.
 * [9] Add the ability to remove files
 * [10] Add an option to force SHA256 to be checked for all files.
 * [11] Allow restoration / download of selected files
 * [12] Allow purge of old (removed) FilePart from S3

## Future Plans

I would like to have some form of slick user interface which would make it accessible to people who don't live at the command line.

## GPG in this context

In the main normal usecase of PGP you publicise your public PGP key which is for encryption (others creating emails to you) and keep your private (secret) key private, so only you can read what others wrote to you.

In the context of this software, you should put your public key onto servers you want to back up and keep your private (secret) key where you want to restore it. Your backups can be stored on an untrusted storage mechanism, such as AWS S3.
