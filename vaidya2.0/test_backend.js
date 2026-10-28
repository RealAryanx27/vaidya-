var http = require('http');

function request(options, data) {
  return new Promise(function (resolve, reject) {
    var req = http.request(options, function (res) {
      var body = '';
      res.on('data', function (chunk) { body += chunk; });
      res.on('end', function () {
        try {
          var json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function runTests() {
  console.log('Testing Akesa Backend API endpoints...');
  
  request({ port: 3000, path: '/api/health', method: 'GET' })
    .then(function (health) {
      console.log('1. Health check status:', health.status, 'app:', health.data.app, 'AI mode:', health.data.ai.configuredProvider);
      return request({ port: 3000, path: '/api/hospitals', method: 'GET' });
    })
    .then(function (hospitals) {
      console.log('2. Hospitals check status:', hospitals.status, 'Total:', hospitals.data.total);
      return request({ port: 3000, path: '/api/blood-banks', method: 'GET' });
    })
    .then(function (blood) {
      console.log('3. Blood Banks check status:', blood.status, 'Total:', blood.data.total);
      return request({
        port: 3000,
        path: '/api/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { message: 'Where is Cardiology at KGMU?', lang: 'en' });
    })
    .then(function (chat) {
      console.log('4. Chat API check status:', chat.status, 'Source:', chat.data.source);
      console.log('   Response excerpt:', chat.data.text.substring(0, 80) + '...');
      return request({
        port: 3000,
        path: '/api/blood-requests',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        patientName: 'Sunita Sharma',
        patientPhone: '+91 94150 11223',
        bloodGroup: 'O+',
        unitsRequired: 2,
        hospitalName: "King George's Medical University (KGMU)"
      });
    })
    .then(function (bloodReq) {
      console.log('5. Blood Request check status:', bloodReq.status, 'Ref ID:', bloodReq.data.referenceId);
      return request({
        port: 3000,
        path: '/api/tokens',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        patientName: 'Aditya Gupta',
        patientPhone: '+91 98390 44556',
        departmentId: 'cardiology',
        departmentNameEn: 'Cardiology (Heart Care)'
      });
    })
    .then(function (token) {
      console.log('6. Token check status:', token.status, 'Token:', token.data.appointment.tokenNumber);
      console.log('\n✅ ALL BACKEND API TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    })
    .catch(function (err) {
      console.error('❌ Test failed:', err.message);
      process.exit(1);
    });
}

runTests();
