var Mocha = require('mocha'),
    Fs = require('fs'),
    Path = require('path'),
    Flags = require("minimist")( process.argv.slice(2) ),
    root = Flags.root || process.cwd(),
    testDir = Path.join(root, "test");


// Exit if no test directory found
if (!Fs.existsSync(testDir)) {

  testDir = Path.join(root, "tests");

  if (!Fs.existsSync(testDir)){

    console.log("no test or tests directory found... exiting")
    return

  }
}

// make coffeescript available
require("coffee-script/register");

// First, you need to instantiate a Mocha instance.
reporter = process.env.CI ? 'xunit-file' : 'spec'

// CI saving of tests output to the right place
var circleDir = process.env.CIRCLE_TEST_REPORTS || Flags.CIRCLE_TEST_REPORTS;

if (circleDir) {

  // set junit as folder name so circle knows where to look
  var test = Path.join(circleDir, "junit")
  if (!Fs.existsSync(circleDir)) {
    Fs.mkdirSync(circleDir)
  }

  if (!Fs.existsSync(test)) {
    Fs.mkdirSync(test)
  }

  process.env.XUNIT_FILE = Path.join(
    test, "/xunit.xml"
  )
}

require('xunit-file');

var mocha = new Mocha({
  reporter: reporter
});

// Then, you need to use the method "addFile" on the mocha
// object for each file.

// Here is an example:
Fs.readdirSync(testDir).filter(function(file){
  // Only keep the .js / .coffee files
  return file.substr(-7) === '.coffee' || file.substr(-3) === '.js';

}).forEach(function(file){
  // Use the method "addFile" to add the file to mocha
  mocha.addFile(
      Path.join(testDir, file)
  );
});


// Now, you can run the tests.
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});
