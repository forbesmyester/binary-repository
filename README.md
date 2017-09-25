# Binary Repository

## What is this?

This code is for synchronization of data to multiple computers via Amazon S3, encrypted via GPG. It stores a full history of all data and it is possible to go back to any previous version.

It is best used for large collections of binary data that change slowly over time, such as an MP3 or digital photo collections.

## Why?

I was attempting to use Git Annex for quite a while but as my data storage server is in the living room I became frustrated with its high CPU and memory requirements causing the fans to be constantly at high speed.

I looked around for other alternatives that would work on Linux but could not find any which I found satisfactory.

## Development

This is primarily a TypeScript based NodeJS project but it uses a lot of shell functions for encryption and even copying data to S3. It is built almost entirely using Streams which will hopefully give lower CPU/memory requirements and make changing S3 or GPG for other alternatives be relatively easy if so desired.

There is good test coverage.

## Current Stage

### Complete

 * Making decisions on which data needs to be backed up (somewhat like rsync)
 * Encrypting Data
 * Uploading Data
 * Storing a record (encrypted) of what and which data has been backed up
 * Deciding which data to download

### In Progress

 * Downloading data

### To do

 * Restoring data

## Future Plans

I would like to have some form of slick user interface which would make it accessible to people who don't live at the command line.
