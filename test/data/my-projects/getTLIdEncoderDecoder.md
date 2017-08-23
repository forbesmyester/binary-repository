# getTLIdEncoderDecoder.js

Given a supplied epoch it will generate you TLId, which is a word I just invented!

What is a TLId? It stands for Time Local Id and gives you a reference based on a timestamp that is locally unique.

Advantages:
 * Timestamps will nearly always be unique, whereas these are guarenteed to be unique.
 * The are shorter than timestamps (though not by a lot).
 * You can extract the timestamp that the TLId was generated.
 * If you want them ordered by generation time, you do not need to convert them back to timestamps beforehand.
 
Here's how you use it:

    // Use one character (32 bit number) to ensure uniqueness within a millisecond
    var uniquenessPerMillisecond = 1;
    // As close as possible (but lower) than the lowest date to give shorter Id's
    var epoch = new Date(1970,0,1).getTime();
    
    
    // Get the TLId Encoder / Decoder
    var encoderDecoder = getTLIdEncoderDecoder(epoch,uniquenessPerMillisecond);
    
    // Encode a date into a unique string
    var dates = [
      encoderDecoder.encode(),
      encoderDecoder.encode(new Date(1980,1,6).getTime()),
      encoderDecoder.encode(new Date(1981,3,15).getTime()),
      encoderDecoder.encode(new Date(1986,8,9).getTime()),
      encoderDecoder.encode(new Date(1983,10,3).getTime()),
      encoderDecoder.encode(new Date(1982,0,6).getTime())
    ];
    
    // Get the dates it was encoded
    var originalTimestamps = dates.map(encoderDecoder.decode);
    
    // Sort them in date order
    var sortedDates = dates.sort(encoderDecoder.sort);

## Source Code

Source code is prepared using [Browserify](http://browserify.org/) which is also compatible with Node.JS. There is a UMD bundle which can be used with AMD or a vanilla browser (where it will export a global called called getTLIdEncoderDecoder.
