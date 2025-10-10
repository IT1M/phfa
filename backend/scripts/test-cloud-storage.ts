import { CloudStorageService } from '../src/services/cloudStorageService';
import * as fs from 'fs';
import * as path from 'path';

async function testCloudStorage() {
  console.log('☁️  Testing Cloud Storage Configuration\n');

  const provider = process.env.CLOUD_STORAGE_PROVIDER || 'local';
  console.log(`Provider: ${provider}\n`);

  if (provider === 'local') {
    console.log('✅ Using local storage (no cloud configuration needed)');
    console.log('   To test cloud storage, set CLOUD_STORAGE_PROVIDER in .env\n');
    process.exit(0);
  }

  // Create test file
  const testDir = path.join(__dirname, '../test-uploads');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const testFile = path.join(testDir, 'test-upload.txt');
  fs.writeFileSync(testFile, `Test upload at ${new Date().toISOString()}`);

  console.log('📝 Created test file\n');

  // Test upload
  const cloudStorage = new CloudStorageService();
  
  console.log(`🔄 Uploading to ${provider}...`);
  const result = await cloudStorage.uploadFile(testFile, 'test-upload.txt');

  if (result.success) {
    console.log('✅ Upload successful!');
    console.log(`   URL: ${result.url}\n`);

    // Test delete
    console.log('🗑️  Testing delete...');
    const deleted = await cloudStorage.deleteFile('test-upload.txt');
    
    if (deleted) {
      console.log('✅ Delete successful!\n');
    } else {
      console.log('⚠️  Delete failed\n');
    }
  } else {
    console.log('❌ Upload failed!');
    console.log(`   Error: ${result.error}\n`);
    
    if (result.error?.includes('not installed')) {
      console.log('💡 Installation instructions:');
      if (provider === 's3') {
        console.log('   npm install @aws-sdk/client-s3');
      } else if (provider === 'azure') {
        console.log('   npm install @azure/storage-blob');
      } else if (provider === 'gcs') {
        console.log('   npm install @google-cloud/storage');
      }
      console.log();
    }
  }

  // Cleanup
  fs.unlinkSync(testFile);
  fs.rmdirSync(testDir);

  console.log('🧹 Cleaned up test files\n');
  
  if (result.success) {
    console.log('🎉 Cloud storage is configured correctly!');
    process.exit(0);
  } else {
    console.log('❌ Cloud storage configuration needs attention');
    process.exit(1);
  }
}

testCloudStorage().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
