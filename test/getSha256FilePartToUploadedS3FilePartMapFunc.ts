import test from 'ava';
import { merge } from 'ramda';
import { Dependencies, getDependencies, Sha256FilePartEncryptEnvironment } from '../src/getSha256FilePartToUploadedS3FilePartMapFunc';
import getSha256FilePartToUploadedS3FilePartMapFunc from '../src/getSha256FilePartToUploadedS3FilePartMapFunc';
import { Sha256FilePart, UploadedS3FilePart, RemoteType } from '../src/Types';

test("Generate Environment (base)", (tst) => {

    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

    let input: Sha256FilePart = {
            sha256: "def8",
            fileByteCount: 58,
            filePartByteCountThreshold: 1024,
            part: [22, 152],
            offset: 32,
            length: 1024,
            modifiedDate,
            path: "/error_command",
            isLast: true
        };


    let expected: Sha256FilePartEncryptEnvironment = {
        OPT_SRC: '/home/you/files/error_command',
        OPT_DD_BS: '1',
        OPT_DD_IS_LAST: '0',
        OPT_DD_SKIP: '32',
        OPT_DD_COUNT: '1024',
        OPT_GPG_KEY: 'my-gpg-key',
        OPT_DST: '/.br/tmp/f-def8-022-1KB-my--gpg--key.ebak.enc',
    };

    let lastInput = merge(input, { part: [152, 152], length: -1 });

    let lastExpected = merge(
        expected,
        {
            OPT_DD_COUNT: '-1',
            OPT_DST: '/.br/tmp/f-def8-152-1KB-my--gpg--key.ebak.enc',
            OPT_DD_IS_LAST: '1'
        }
    );


    let inst = getSha256FilePartToUploadedS3FilePartMapFunc(
        getDependencies(RemoteType.LOCAL_FILES),
        '/.br',
        '/home/you/files',
        'ebak-bucket',
        'my-gpg-key',
        1024,
    );

    tst.deepEqual(inst.getEnv(1024, input), expected);
    tst.deepEqual(inst.getEnv(1024, lastInput), lastExpected);

});


test.cb("Can run a command", (tst) => {

    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

    let input: Sha256FilePart = {
        sha256: "def8",
        fileByteCount: 1222,
        filePartByteCountThreshold: 1024,
        part: [22, 152],
        offset: 1111,
        length: 100,
        modifiedDate,
        path: "//error_command",
        isLast: true
    };


    let expected: UploadedS3FilePart = {
        gpgKey: 'my-gpg-key',
        sha256: "def8",
        fileByteCount: 1222,
        filePartByteCountThreshold: 1024,
        length: 100,
        part: [22, 152],
        offset: 1111,
        modifiedDate,
        path: "//error_command",
        isLast: true,
    };

    let done = {
        unlink: false,
        exists: false,
        upload: false,
        cmdSpawner: false,
        mkdirp: false
    };

    let dependencies: Dependencies = {
        unlink: (f, n) => {
            done.unlink = true;
            n(null);
        },
        exists: (f, n) => {
            done.exists = true;
            tst.deepEqual(
                f,
                ['ebak-bucket', "f-def8-022-1KB-my--gpg--key.ebak"]
            );
            n(null, false);
        },
        upload: (tmpDir, src, loc, next) => {
            done.upload = true;
            tst.is(tmpDir, '/home/you/store/.binary-repository/tmp');
            tst.deepEqual(loc, ['ebak-bucket', 'f-def8-022-1KB-my--gpg--key.ebak']);
            tst.is(
                src,
                '/home/you/store/.binary-repository/tmp/f-def8-022-1KB-my--gpg--key.ebak.enc'
            );
            next(null);
        },
        cmdSpawner: (env: Sha256FilePartEncryptEnvironment, cwd, cmd, args, out, err, next) => {
            done.cmdSpawner = true;
            tst.is(env.OPT_SRC, '/home/you/store/error_command');
            tst.is(
                env.OPT_DST,
                '/home/you/store/.binary-repository/tmp/f-def8-022-1KB-my--gpg--key.ebak.enc'
            );
            next(null, 0);
        },
        mkdirp: (d, n) => {
            done.mkdirp = true;
            tst.is(d, '/home/you/store/.binary-repository/tmp');
            n(null);
        }
    };

    let trn = getSha256FilePartToUploadedS3FilePartMapFunc(
        dependencies,
        '/home/you/store/.binary-repository',
        '/home/you/store/',
        'ebak-bucket',
        'my-gpg-key',
        1024
    );

    trn(input, (err, output) => {
        tst.is(err, null);
        tst.deepEqual(done, { unlink: true, exists: true, upload: true, cmdSpawner: true, mkdirp: true });
        tst.deepEqual(output, expected);
        tst.end();
    });

});

test.cb("Will not do anything if already exists", (tst) => {

    let modifiedDate = new Date("2017-06-19T06:20:05.168Z");

    let input: Sha256FilePart = {
        sha256: "def8",
        fileByteCount: 1222,
        filePartByteCountThreshold: 1024,
        part: [22, 152],
        offset: 1111,
        length: 100,
        modifiedDate,
        path: "//error_command",
        isLast: true
    };


    let expected: UploadedS3FilePart = {
        gpgKey: 'my-gpg-key',
        sha256: "def8",
        fileByteCount: 1222,
        filePartByteCountThreshold: 1024,
        length: 100,
        part: [22, 152],
        offset: 1111,
        modifiedDate,
        path: "//error_command",
        isLast: true,
    };

    let done = {
        unlink: false,
        exists: false,
        upload: false,
        cmdSpawner: false,
        mkdirp: false
    };

    let dependencies: Dependencies = {
        unlink: (f, n) => {
            done.unlink = true;
            n(null);
        },
        exists: (f, n) => {
            done.exists = true;
            n(null, true);
        },
        upload: (tmpDir, src, loc, next) => {
            done.upload = true;
        },
        cmdSpawner: (env: Sha256FilePartEncryptEnvironment, cwd, cmd, args, out, err, next) => {
            done.cmdSpawner = true;
            next(null, 0);
        },
        mkdirp: (d, n) => {
            done.mkdirp = true;
            n(null);
        }
    };

    let trn = getSha256FilePartToUploadedS3FilePartMapFunc(
        dependencies,
        '/home/you/store/.binary-repository',
        '/home/you/store/',
        'ebak-bucket',
        'my-gpg-key',
        1024
    );

    trn(input, (err, output) => {
        tst.is(err, null);
        tst.deepEqual(done, { unlink: false, exists: true, upload: false, cmdSpawner: false, mkdirp: false });
        tst.deepEqual(output, expected);
        tst.end();
    });

});
