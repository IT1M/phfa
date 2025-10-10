import https from 'https';
import fs from 'fs';
import path from 'path';

/**
 * TLS 1.3 Configuration
 * Enterprise-grade transport security
 */
export const tlsConfig = {
  // Minimum TLS version
  minVersion: 'TLSv1.3' as const,
  
  // Cipher suites (TLS 1.3)
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256'
  ].join(':'),

  // Security options
  honorCipherOrder: true,
  requestCert: false,
  rejectUnauthorized: true,

  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
};

/**
 * Create HTTPS server with TLS 1.3
 */
export function createSecureServer(app: any): https.Server {
  const certPath = process.env.TLS_CERT_PATH || path.join(__dirname, '../../certs');
  
  const options: https.ServerOptions = {
    key: fs.readFileSync(path.join(certPath, 'server.key')),
    cert: fs.readFileSync(path.join(certPath, 'server.crt')),
    minVersion: tlsConfig.minVersion,
    ciphers: tlsConfig.ciphers,
    honorCipherOrder: tlsConfig.honorCipherOrder
  };

  // Add CA certificate if available
  const caPath = path.join(certPath, 'ca.crt');
  if (fs.existsSync(caPath)) {
    options.ca = fs.readFileSync(caPath);
  }

  return https.createServer(options, app);
}

/**
 * HSTS Middleware
 */
export function hstsMiddleware(req: any, res: any, next: any): void {
  res.setHeader(
    'Strict-Transport-Security',
    `max-age=${tlsConfig.hsts.maxAge}; includeSubDomains; preload`
  );
  next();
}

/**
 * Generate self-signed certificate for development
 */
export function generateDevCertificate(): void {
  const { execSync } = require('child_process');
  const certPath = path.join(__dirname, '../../certs');

  if (!fs.existsSync(certPath)) {
    fs.mkdirSync(certPath, { recursive: true });
  }

  const keyPath = path.join(certPath, 'server.key');
  const certFilePath = path.join(certPath, 'server.crt');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certFilePath)) {
    console.log('Generating self-signed certificate for development...');
    
    execSync(
      `openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certFilePath} ` +
      `-days 365 -nodes -subj "/CN=localhost"`,
      { stdio: 'inherit' }
    );
    
    console.log('Certificate generated successfully');
  }
}
