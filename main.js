#!/usr/bin/env node

var fs    = require('fs')
  , path  = require('path')
;

function walk(dir, cb){
  if (!cb.hasOwnProperty('pending')){
    cb.pending = false;
    cb.dirs = [];
  }

  cb.pending++;
  fs.readdir(dir, function(err, files){
    cb.pending--;

    if (err) return cb(err);

    cb.dirs.push(dir);

    files.forEach(function(file){
      var full = path.join(dir, file);

      cb.pending++;
      fs.stat(full, function(err, stat){
        cb.pending--;

        if (err) {
          if (err.code !== 'ENOENT') {
            return cb(err);
          } else {
            return;
          }
        }

        if (stat.isDirectory()){
          walk(full, cb);
        }

        if (cb.pending === 0) cb(err, cb.dirs);
      });
    })
    if (cb.pending === 0) cb(err, cb.dirs);
  });
}

module.exports = function(base, cb) {
  walk(base, function(err, paths){
    if (err) return cb(err);

    var pending = false;

    function trigger(){
      cb();
      pending = false;
    }

    function debounce(){
      if (pending) return;
      pending = true;
      setTimeout(trigger, 1);
    }

    paths.sort().forEach(function(dir){
      fs.watch(dir, debounce);
    });
  });
};
