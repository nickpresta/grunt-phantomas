'use strict';

var fs        = require( 'fs' );
var grunt     = require( 'grunt' );
var Phantomas = require( '../../tasks/lib/phantomas' );

var TEMP_PATH = './tmp/';


/**
 * Helper functions
 */

function deleteFolderRecursive ( path ) {
  var files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync( path );
    files.forEach( function( file ){
      var curPath = path + '/' + file;
      if( fs.statSync( curPath ).isDirectory() ) {
          deleteFolderRecursive( curPath );
      } else {
          fs.unlinkSync( curPath );
      }
    } );
    fs.rmdirSync( path );
  }
}

exports.photoBox = {
  setUp : function( done ) {
    // setup here if necessary
    done();
  },

  tearDown: function ( callback ) {
    deleteFolderRecursive( TEMP_PATH + 'data' );

    callback();
  },

  constructor : function( test ) {
    var options   = {
      indexPath : TEMP_PATH
    };
    var done      = function() {};
    var phantomas = new Phantomas( grunt, options, done );

    test.strictEqual( phantomas.grunt,    grunt );
    test.strictEqual( phantomas.options,  options );
    test.strictEqual( phantomas.done,     done );
    test.strictEqual( phantomas.dataPath, 'tmp/data/' );

    test.done();
  },


  createDataJson : function( test ) {
    var options     = {
      indexPath : TEMP_PATH
    };
    var done        = function() {};
    var phantomas   = new Phantomas( grunt, options, done );
    var fileContent = '{"test":"test"}';

    fs.mkdirSync( './tmp' );
    fs.mkdirSync( './tmp/data' );

    phantomas.createDataJson( fileContent )
      .then( function() {
        var files = fs.readdirSync( 'tmp/data/' );
        test.strictEqual( files.length, 1 );

        test.strictEqual(
          fs.readFileSync( './tmp/data/' + files[ 0 ], 'utf8' ),
          fileContent
        );

        test.done();
      } );
  },


  createDataDirectory : {
    directoryDoesNotExist : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      deleteFolderRecursive( TEMP_PATH + 'data' );

      phantomas.createDataDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH + '/data' ), true );
          test.done();
        } );
    },
    directoryExists : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );

      fs.mkdirSync( TEMP_PATH + 'data' );

      phantomas.createDataDirectory()
        .then( function() {
          test.strictEqual( fs.existsSync( TEMP_PATH + '/data' ), true );
          test.done();
        } );
    }
  },


  getPhantomasProcessArguments : function( test ) {
    var options     = {
        url : 'http://test.com',
        raw : [ '--test1', '--test2' ]
      };
    var done        = function() {};
    var phantomas   = new Phantomas( grunt, options, done );

    var processArguments = phantomas.getPhantomasProcessArguments();

    test.strictEqual( processArguments.length, 6 );
    test.strictEqual( processArguments[ 0 ], '--url' );
    test.strictEqual( processArguments[ 1 ], 'http://test.com' );
    test.strictEqual( processArguments[ 2 ], '--format' );
    test.strictEqual( processArguments[ 3 ], 'json' );
    test.strictEqual( processArguments[ 4 ], '--test1' );
    test.strictEqual( processArguments[ 5 ], '--test2' );

    test.done();
  },


  readMetricsFile : {
    notValidJson : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );
      var fileContent = '{ "test": test" }';

      fs.mkdirSync( './tmp/data' );

      fs.writeFileSync( './tmp/data/123456.json', fileContent );

      phantomas.readMetricsFile( '123456.json' )
        .catch( Error, function( error ) {
          test.strictEqual( typeof error, 'object' );
          test.strictEqual(
            error.toString(),
            'SyntaxError: Unexpected token e'
          );

          test.done();
        } );
    },
    validJson : function( test ) {
      var options     = {
        indexPath : TEMP_PATH
      };
      var done        = function() {};
      var phantomas   = new Phantomas( grunt, options, done );
      var fileContent = '{ "test": "test" }';

      fs.mkdirSync( './tmp/data' );

      fs.writeFileSync( './tmp/data/123456.json', fileContent );

      phantomas.readMetricsFile( '123456.json' )
        .then( function( data ) {
          test.strictEqual( typeof data,    'object' );
          test.strictEqual( data.test,      'test' );
          test.strictEqual( data.timestamp, 123456 );

          test.done();
        } );
    }
  },


  showSuccessMessage : function( test ) {
    var options         = {};
    var done            = function() {
      test.done();
    };
    var phantomas       = new Phantomas( grunt, options, done );

    phantomas.showSuccessMessage();
  }
};
