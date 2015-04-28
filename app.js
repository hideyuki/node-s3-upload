var AWS = require('aws-sdk')
var fs = require('fs')

var BUCKET_NAME = 'node-s3-upload-sample'
var FILE_NAME = 'Beatrobo.mp4'
var KEY_NAME = (Math.floor(Math.random()*1000)) + '_' + FILE_NAME

AWS.config.region = 'ap-northeast-1'  // Tokyo region

var s3 = new AWS.S3()

// create bucket
var createBucketIfNotExist = function(callback){
  s3.headBucket({Bucket: BUCKET_NAME}, function(err, data){
    if(err && err.statusCode==404){
      // not exist
      var params = {
        Bucket: BUCKET_NAME,
        ACL: 'public-read'
      }
      s3.createBucket(params, function(err, data){
        if(callback){
          callback(err, data)
        }
      })
    }
    else if((err && err.statusCode==301) || !err){
      // anyone had created this bucket
      if(callback){
        callback(null, data)
      }
    }
  })
}

// add movie file
var addMovieFile = function(fileStream, callback){
  var params = {
    Bucket: BUCKET_NAME,
    Key: KEY_NAME,
    ACL: 'public-read',
    Body: fileStream,
    ContentType: 'video-mp4',
  }
  s3.putObject(params, function(err, data){
    if(callback){
      callback(err, data)
    }
  })
}

// main
createBucketIfNotExist(function(err, data){
  if(err) console.log(err)
  else{
    var fileStream = fs.createReadStream(FILE_NAME)
    fileStream.on('error', function(err){
      if (err) console.log(err)
    })
    fileStream.on('open', function(){
      addMovieFile(fileStream, function(err, data){
        if(err) console.log('Failure on uploading')
        else {
          var url = s3.getSignedUrl('getObject', {Bucket: BUCKET_NAME, Key: KEY_NAME})
          console.log('Uploaded Successfully: ' + url)
        }
      })
    })
  }
})

