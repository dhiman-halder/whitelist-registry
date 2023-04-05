
# CA key and certificate
openssl req -new -x509 -nodes -subj '/CN=Whitelist Registry Controller Webook' -keyout ca.key -out ca.crt 
# server key
openssl genrsa -out server.key 2048
# CSR
openssl req -new -key server.key -subj '/CN=whitelist-registry.default.svc' -out server.csr
# server certificate
openssl x509 -req -extfile <(printf "subjectAltName=DNS:whitelist-registry.default.svc") -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt

# copy certs to app folder
chmod 644 *.key
cp ca.crt ./app
cp server.crt ./app
cp server.key ./app
