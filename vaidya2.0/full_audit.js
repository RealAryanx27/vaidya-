var http = require('http');

function checkResource(path, expectedCode, contentTypeCheck) {
  return new Promise(function (resolve, reject) {
    var req = http.request({ port: 3000, path: path, method: 'GET' }, function (res) {
      var body = '';
      res.on('data', function (c) { body += c; });
      res.on('end', function () {
        var ct = res.headers['content-type'] || '';
        var ok = res.statusCode === expectedCode && (!contentTypeCheck || ct.includes(contentTypeCheck));
        if (ok) {
          console.log('✅ ' + path + ' -> HTTP ' + res.statusCode + ' (' + (body.length > 1024 ? Math.round(body.length/1024) + ' KB' : body.length + ' B') + ') [' + ct + ']');
          resolve({ status: res.statusCode, body: body });
        } else {
          console.error('❌ ' + path + ' -> HTTP ' + res.statusCode + ' (Expected ' + expectedCode + '), Content-Type: ' + ct);
          reject(new Error('Failed check for ' + path));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function runFullAudit() {
  console.log('====================================================');
  console.log('AKESA FULL SYSTEM STATIC & API AUDIT');
  console.log('====================================================');

  checkResource('/', 200, 'text/html')
    .then(function () { return checkResource('/index.html', 200, 'text/html'); })
    .then(function () { return checkResource('/css/akesa.css', 200, 'text/css'); })
    .then(function () { return checkResource('/js/data.js', 200, 'application/javascript'); })
    .then(function () { return checkResource('/js/voice.js', 200, 'application/javascript'); })
    .then(function () { return checkResource('/js/mascot.js', 200, 'application/javascript'); })
    .then(function () { return checkResource('/js/app.js', 200, 'application/javascript'); })
    .then(function () { return checkResource('/api/health', 200, 'application/json'); })
    .then(function () { return checkResource('/api/hospitals', 200, 'application/json'); })
    .then(function () { return checkResource('/api/blood-banks', 200, 'application/json'); })
    .then(function () { return checkResource('/api/tokens', 200, 'application/json'); })
    .then(function () {
      console.log('====================================================');
      console.log('🎉 ALL SYSTEM CHECKS AND STATIC RESOURCES VERIFIED!');
      console.log('====================================================');
      process.exit(0);
    })
    .catch(function (err) {
      console.error('Audit failed:', err);
      process.exit(1);
    });
}

runFullAudit();
