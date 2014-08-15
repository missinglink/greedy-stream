
/*
  Greedy Stream

  A stream which is so greedy it takes input as fast as
  it can get it and outputs results as fast as they're ready.

  Note: resulting documents can & will be out-of-order.
*/

var Transform = require('readable-stream').Transform;

module.exports = function( options, transform ){

  var stream = new Transform( options );

  // remove callbacks
  if( stream.listeners('prefinish').length ){
    stream.removeAllListeners('prefinish');
  }
  else if( stream.listeners('finish').length ){
    stream.removeAllListeners('finish');
  }

  var transforms = 0,
      resolved = 0;

  stream._transform = function( chunk, enc, next ){

    transforms++; // keep track of how many transforms we've done
    next(); // moar!

    var n = function( err, chunk ){
      if( err ){ this.emit( 'error', err ); }
      else if( !n.done && ++resolved === transforms ){
        if( chunk ){ this.push( chunk ); }
        this.push( null ); // stream end
      }
      n.done = true; // dont resolve the same cb twice
    }.bind(this);

    transform.call( this, chunk, enc, n );
  };

  return stream;
};

module.exports.obj = module.exports.bind( null, { objectMode: true, highWaterMark: 16 } );