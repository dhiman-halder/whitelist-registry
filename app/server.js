const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const port = 8443;

const options = { 
  ca: fs.readFileSync('ca.crt'), 
  cert: fs.readFileSync('server.crt'), 
  key: fs.readFileSync('server.key'), 
}; 

app.post('/', (req, res) => {
  if (req.body.request === undefined || req.body.request.uid === undefined) {
    res.status(400).send();
    return;
  }
  console.log(req.body); //debug
  var allowed = true;
  var code = 200;
  var message = "";
  const uid = req.body.request.uid;
  const object = req.body.request.object;
  
  const whitelisted_registries_env = process.env.WHITELISTED_REGISTRIES;
  const whitelisted_registries = whitelisted_registries_env.split(',');
  for (var container of object.spec.containers) {
      var whitelisted = false;
      for (var reg of whitelisted_registries) {
        if (container.image.startsWith(reg + '/')) {
          whitelisted = true;
        }
      }
      if (!whitelisted) {
          allowed = false;
          code = 403;
          message = `${container.name} image comes from an untrusted registry! Only images from ${whitelisted_registries_env} are allowed.`;
          break;
      }
  }
  res.send({
        apiVersion: 'admission.k8s.io/v1',
        kind: 'AdmissionReview',
        response: {
            uid: uid,
            allowed: allowed,
            status: {
                code: code,
                message: message,
            },
        },
    });
});

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`whitelist-regsitry controller running on port ${port}/`);
});