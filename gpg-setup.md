# Setting up GPG

This software uses GPG to protect your data. This is good because it has plenty of eyes looking at it to make sure that it is safe to use, but also because there is already a lot of documentation available on the internet.

At the moment I think your reading list should include [Chris Erin's Hashrocket Post](https://hashrocket.com/blog/posts/encryption-with-gpg-a-story-really-a-tutorial) as well as the [Using Stronger Algorithms section](https://futureboy.us/pgp.html#StrongerAlgorithms) of Alan Eliasen GPG Tutorial. You'll also need to pick your encryption algorithm, which at the time of writing (2017-10-19), AES256 looks like a good option.

If you read the above you will understand that you need to generate a public key for encrypting the data as well as keeping a private key for decrypting the data.

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

Once you've got your keys created. You probably ought to consider backing them up, so you can recover from disaster. Head back to the main [README.md](./README.md) for instructions
