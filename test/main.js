var chai   = require('chai')
    should = chai.should()
    rerun  = require('../main')
    fs     = require('fs')
    rimraf = require('rimraf')
;
chai.Assertion.includeStack = true;

var timeout = 5; // how long to wait for the disk in ms

describe("Rerun", function() {
  var tmp;

  beforeEach(function(done) {
    var self     = this;
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
    this.callback = function(){};
  });

  it("exports a constructor function", function() {
    rerun.should.be.a('function');
  });

  describe("initialization", function() {
    it("takes a root directory and a callback", function(done) {
      var self = this;
      this.callback = function(){
        self.callback = function(){}; // avoid calls due to cleanup
        done();
      }

      rerun(tmp, self.trigger);

      setTimeout(function(){
        fs.open(tmp + '/a', 'w');
      }, timeout);
    });
  });

  describe("when a file is created", function() {
    it("calls the callback", function(done) {
      var self = this
        , called = 0
      ;

      this.callback = function(err){
        if (err) return done(err);

        called++;
      };

      rerun(tmp, self.trigger);

      setTimeout(function(){
        fs.open(tmp + '/a', 'w', function(err, fd){
          if (err) return done(err);

          setTimeout(function(){
            called.should.equal(1);

            fs.open(tmp + '/b', 'w', function(err, fd){
              if (err) return done(err);

              setTimeout(function(){
                called.should.equal(2);
                done();
              }, timeout);
            });
          }, timeout);
        });
      }, timeout);
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
