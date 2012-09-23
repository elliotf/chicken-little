var chai    = require('chai')
    should  = chai.should()
    doorman = require('../lib/doorman')
    fs      = require('fs')
    rimraf  = require('rimraf')
    async   = require('async')
;

chai.Assertion.includeStack = true;

var timeout = 5; // how long to wait for the disk in ms

describe("The Doorman", function() {
  var tmp;

  beforeEach(function(done) {
    var self     = this;
    this.called  = 0

    this.trigger = function(err){
      self.callback(err);
    };

    tmp = __dirname + '/tmp';
    rimraf(tmp, function(err){
      fs.mkdir(tmp, function(err){
        if (err) return done(err);

        // allow tmp dir creation events to settle
        setTimeout(function(){
          done(err);
        }, timeout);
      });
    });
  });

  afterEach(function(){
    // ignore events after the completion of a test
    this.callback = function(){};
  });

  it("exports a constructor function", function() {
    doorman.should.be.a('function');
  });

  describe("initialization", function() {
    it("takes a root directory and a callback", function(done) {
      var self = this;
      this.callback = function(err){
        done(err);
      }

      doorman(tmp, self.trigger);

      setTimeout(function(){
        fs.open(tmp + '/a', 'w');
      }, timeout);
    });
  });

  describe("when directories are created", function() {
    function mkdir(path,callback) {
      setTimeout(function(){
        fs.mkdir(path, function(err){
          setTimeout(function(){
            callback(err);
          }, timeout)
        });
      },timeout);
    }

    it("calls the callback", function(done) {
      var self   = this;

      this.callback = function(err){
        if (err) return this.done(err);
        this.called++;
      }

      doorman(tmp, self.trigger);

      self.called.should.equal(0);
      mkdir(tmp + '/subdir', function(err){
        if (err) return done(err);
        self.called.should.equal(1);
        done();
      });
    });

    describe("inside newly created directories", function() {
      var sub1;

      beforeEach(function(done) {
        sub1 = tmp + '/subdir';
        mkdir(sub1, done);
      });

      it("calls the callback", function(done) {
        var self   = this;

        this.callback = function(err){
          if (err) return done(err);
          self.called++;
        };

        doorman(tmp, self.trigger);

        self.called.should.equal(0);
        var sub2 = sub1 + '/subdir2';
        mkdir(sub2, function(err){
          if (err) return done(err);
          self.called.should.equal(1);

          var sub3 = sub2 + '/subdir3';
          mkdir(sub3, function(err){
            if (err) return done(err);
            self.called.should.equal(2);
            done();
          });
        })
      });
    });
  });

  describe("when files", function() {
    describe("are created", function() {
      it("calls the callback", function(done) {
        var self   = this
        ;

        this.callback = function(err){
          if (err) return done(err);

          self.called++;
        };

        doorman(tmp, self.trigger);

        setTimeout(function(){
          self.called.should.equal(0);
          fs.open(tmp + '/a', 'w', function(err, fd){
            if (err) return done(err);

            setTimeout(function(){
              self.called.should.equal(1);

              fs.open(tmp + '/b', 'w', function(err, fd){
                if (err) return done(err);

                setTimeout(function(){
                  self.called.should.equal(2);
                  done();
                }, timeout);
              });
            }, timeout);
          });
        }, timeout);
      });
    });

    describe("are updated", function() {
      beforeEach(function(done) {
        var self = this;

        fs.open(tmp + '/mod_a', 'w', function(err, fd){
          self.aFd = fd;
          setTimeout(function(){
            done(err);
          }, timeout);
        });
      });

      it("calls the callback", function(done) {
        var self   = this
          , called = 0
          , last   = called
        ;

        this.callback = function(err){
          if (err) return done(err);

          called++;
        };

        doorman(tmp, self.trigger);

        function touchFile(cb){
          fs.write(self.aFd, 'waffles', 0, 7, function(err){
            if (err) return cb(err);

            setTimeout(function(){
              called.should.equal(++last);
              cb();
            }, timeout);
          });
        }

        setTimeout(function(){
          async.series([
            touchFile
            , touchFile
            , touchFile
          ], function(err){
            done(err);
          });
        },timeout);
      });
    });
  });

  describe("when idle", function() {
    it("should not trigger anything", function(done) {
      var self   = this
        , called = 0;

      this.callback = function(err){
        if (err) return done(err);

        called++;
      };

      doorman(tmp, self.trigger);

      setTimeout(function(){
        called.should.equal(0);
        done();
      }, 200);
    });
  });

      //fs.mkdir(tmp + '/a');
  /*
  describe("#createMonitor", function() {
    it("calls the callback once on init", function(done) {
      watch.createMonitor(tmp, function(monitor){
        done();
      });
    });
  });

  describe("watching", function() {
    beforeEach(function(done) {
      var self = this;

      this.trigger = function(){};
      this.results = {
          'created': {}
        , 'changed': {}
        , 'removed': {}
      };
      watch.createMonitor(tmp, function(monitor){
        self.monitor = monitor;
        monitor.on("created", function(f, stat){
          self.results['created'][f] = stat;
          self.trigger();
        });
        monitor.on("modified", function(f, stat){
          self.results['changed'][f] = stat;
          self.trigger();
        });
        monitor.on("removed", function(f, stat){
          self.results['removed'][f] = stat;
          self.trigger();
        });
        done();
      });
    });

    afterEach(function(){
      this.trigger = function(){};
    });

    describe("when a file is created", function() {
      it("triggers an event", function(done) {
        done();
      });
    });

    describe("when a new directory is created", function() {
      it("watches for new events in the new directory", function(done) {
        this.trigger = function(){
          console.log(this.results);
          done();
        }
        fs.mkdir(tmp + '/a', function(err){
          console.log("MADE tmp/a");
          if (err) return done(err);
        });
      });

      describe("with a new directory inside of it", function() {
        it("watches for new events in the new directory", function(done) {
          done();
        });
      });
    });
  });
  */
});
