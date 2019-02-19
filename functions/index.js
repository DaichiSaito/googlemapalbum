const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();
const STORAGE_PROJECT_ID = functions.config().storage.project_id

// const gcs = require('@google-cloud/storage')();
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: STORAGE_PROJECT_ID,
});
const path = require('path');
const os = require('os');
const fs = require('fs');
const sharp = require('sharp');

const THUMB_MAX_SIZE = 200;
const THUMB_PREFIX = 'thumb_';

exports.generateThumbnail = functions.storage.object().onFinalize((object) => {
  // Get file object
  const fileBucket = object.bucket;
  const filePath = object.name;
  const fileName = path.basename(filePath);
  const fileDir = path.dirname(filePath);
  const thumbFilePath = path.normalize(path.join(fileDir, `${THUMB_PREFIX}${fileName}`));
  const contentType = object.contentType;
  const resourceState = object.resourceState;
  const localTmpFile = path.join(os.tmpdir(), fileName);
  const localTmpThumbFile = path.join(os.tmpdir(), `${THUMB_PREFIX}${fileName}`);
  const firestore = admin.firestore();

  console.info('file_data:\n', {
    filePath: filePath,
    fileName: fileName,
    fileDir: fileDir,
    thumbFilePath: thumbFilePath,
    localTmpFile: localTmpFile,
    localTmpThumbFile: localTmpThumbFile,
    bucketName: fileBucket
  });

  // 画像ファイルでなければ終了
  if (!contentType.startsWith('image/')) {
    console.info('This is not an image.');
    return 0;
  }

  // 既にサムネイル画像だったら終了
  if (fileName.startsWith(THUMB_PREFIX)) {
    console.info('Already a Thumbnail.');
    return 0;
  }

  // 削除済みの場合は処理せず終了
  if (resourceState === 'not_exists') {
    console.info('This is a deletion event.');
    return 0;
  }

  // const bucket = gcs.bucket(fileBucket);
  const bucket = storage.bucket(fileBucket)
  const metadata = { contentType: contentType };

  return bucket.file(filePath).download({
    destination: localTmpFile,
  }).then(() => {
    console.info('Image downloaded locally to', localTmpFile);

    // サムネイル画像をローカルに生成
    return sharp(localTmpFile)
      .resize(THUMB_MAX_SIZE)
      .toFile(localTmpThumbFile)
      .catch((err) => console.err(err));
  }).then(() => {
    console.info('Thumbnail created at', localTmpThumbFile);

    // 生成されたサムネイル画像をアップロード
    return bucket.upload(localTmpThumbFile,
      { destination: thumbFilePath, metadata: metadata });
  }).then(() => {
    console.info('Document update ', fileName);

    // サムネイルの情報をアップデート
    return firestore.collection('images').where('fileName', '==', fileName)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          data.hasThumb = true;
          // data.originalFilePath = `https://firebasestorage.googleapis.com/v0/b/${functions.config().storage.project_id}.appspot.com/o/images%2F${fileName}`
          data.thumbFilePath = `https://firebasestorage.googleapis.com/v0/b/${fileBucket}/o/images%2Fthumb_${fileName}?alt=media`
          firestore.collection('images').doc(doc.id).set(data);
        });
      });
  }).then(() => {
    // ローカルの後処理
    fs.unlinkSync(localTmpFile);
    fs.unlinkSync(localTmpThumbFile);
    console.info('Delete local tmp files',
      { localTmpFile: localTmpFile, localTmpThumbFile: localTmpThumbFile });
    return;
  })
    .then(() => console.info('Generate Thumbnail Success'))
    .catch((err) => console.error(err));
});
