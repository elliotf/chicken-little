#!/usr/bin/env node

var fs    = require('fs')
  , path  = require('path')
  , _     = require('underscore')
;

function walk(basedir, cb){
  if (!cb.hasOwnProperty('pending')){
    cb.pending = false;
    cb.paths = {}
  }
  cb.paths[basedir] = 'd';

  cb.pending++;
  fs.readdir(basedir, function(err, files){
    cb.pending--;

    if (err) return cb(err);

    files.forEach(function(file){
      var full = [basedir, file].join('/');
      cb.paths[full] = 'f';

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

        if (cb.pending === 0) cb(err, cb.paths);
      });
    })
    if (cb.pending === 0) cb(err, cb.paths);
  });
}

module.exports = function(base, cb) {
  var paths   = {}
    , pending = false;
  ;

  function addPaths(err, newPaths) {
    if (err) return cb(err);
    _.extend(paths, newPaths);
    Object.keys(newPaths).sort().forEach(handler);
  }

  function handler(watchPath){
    if ('f' == paths[watchPath]) return;

    fs.watch(watchPath, function(event, file){
      var modified = [watchPath, file].join('/');
      if (paths[modified]) {
        debounce();
      } else {
        addNewPath(modified);
      }
    });
  }

  function addNewPath(newPath){
    fs.stat(newPath,function(err, stat){
      if (err) return cb(err);

      paths[newPath] = (stat.isDirectory()) ? 'd' : 'f'
      if ('d' == paths[newPath]) {
        walk(newPath, addPaths);
      }
      debounce();
    });
  }

  function debounce(){
    if (pending) return;
    pending = true;
    setTimeout(trigger, 1);
  }

  function trigger(){
    cb();
    pending = false;
  }

  walk(base, addPaths);
};
