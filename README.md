chicken-little
==============

WIP: do things when files change on the filesystem (re-run your test suite, for example)

[![Build Status](https://secure.travis-ci.org/elliotf/chicken-little.png)](http://travis-ci.org/elliotf/chicken-little)

Example usage:

    ./node_modules/.bin/chicken -c "filesystem had changes" .

To re-run your test suite when *any* files change (timing how long it takes):

    ./node_modules/.bin/chicken -c "time npm test" .


Why?  Aren't there already others?
==================================

My main use case is to re-exec my mocha test suite(s) on file changes.

I want my test suite to re-run on any changes, including templates, CSS, and client-side javascript.

If you don't like chicken-little, there are others that might work better for you:

- nodemon
  - doesn't easily trigger on non-js/coffeescript files
  - stopped working for me
  - no tests at all
- mocha testrunner
  - doesn't take mongoose model changes into account when it re-runs
- node-dev
  - only works for node scripts, cannot exec random shell commands ('make test')
  - doesn't trigger on all file changes
- supervisor
  - I like being able to npm install everything my app development depends on
  - relatively complex

I probably missed some, but it's a start.
