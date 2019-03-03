<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <form>
          <v-card-title>
            <span class="headline">写真アップロード</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field
                    prepend-icon="attach_file"
                    single-line
                    v-model="filename"
                    :required="required"
                    @click.native="onFocus"
                    :disabled="disabled"
                    ref="fileTextField"
                    label="ファイルを選択"
                  ></v-text-field>
                  <input
                    type="file"
                    :accept="accept"
                    :multiple="true"
                    :disabled="disabled"
                    ref="fileInput"
                    @change="readImages"
                  >
                  <canvas id="canvas" width="0" height="0"></canvas>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model="label"
                    label="（任意）どこですか？"
                    hint="都市の名前や建造物の名前など"
                    persistent-hint
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="loading" color="blue darken-1" flat @click="handleClose">閉じる</v-btn>
            <v-btn
              :loading="loading"
              :disabled="uploadDisabled"
              color="blue-grey"
              class="white--text"
              @click="handleUpload"
              type="submit"
            >アップロード
              <v-icon right dark>cloud_upload</v-icon>
            </v-btn>
            <!-- <button data-v-5a0c0997="" type="submit" class="v-btn v-btn--flat theme--light blue--text text--darken-1">Save</button> -->
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </v-layout>
</template>


<script>
import { firestore, storage, auth, firestoreHelper } from "@/firebase/init";
import EXIF from "exif-js";
const IMAGE_MAX_WIDTH = 1000; // 画像リサイズ後の横の長さの最大値
const IMAGE_MAX_HEIGHT = 1000; // 画像リサイズ後の縦の長さの最大値
export default {
  name: "imageUploadModal",

  props: {
    accept: {
      type: String,
      default: "image/*"
    },

    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean, // not yet possible because of data
      default: false
    }
  },

  data() {
    return {
      label: null,
      feedback: null,
      imageFiles: [],
      feedback: "ファイルを選択して",
      dialog: true,
      filename: "",
      loading: false,
      country: null
    };
  },

  computed: {
    uploadDisabled() {
      return (
        this.loading || this.imageFiles.length == 0 || this.country == null
      );
    }
  },
  mounted() {},
  created() {
    if (!this.$route.params.id) {
      // もし直接URL叩かれたら
      this.$router.push("/");
      return;
    }

    let ref = firestore.collection("countries");
    ref
      .where("country_code", "==", this.$route.params.id)
      .get()
      .then(docs => {
        docs.forEach(doc => {
          this.country = Object.assign(doc.data(), { id: doc.id });
        });
      });
  },

  methods: {
    getFormData(files) {
      const data = new FormData();
      [...files].forEach(file => {
        data.append("data", file, file.name); // currently only one file at a time
      });
      return data;
    },
    onFocus() {
      if (!this.disabled) {
        this.$refs.fileInput.click();
      }
    },
    readImages() {
      this.feedback = null;
      const files = event.target.files;
      const promisess = [];
      Array.from(files).forEach((file, index, arr) => {
        const promise = new Promise((resolve, reject) => {
          this.readFile(file)
            .then(fileData => {
              return this.fileToCanvas(fileData.src, fileData.orientation);
            })
            .then(canvas => {
              return this.canvasToBlob(canvas);
            })
            .then(blob => {
              resolve({
                file: file,
                blob: blob
              });
            });
        });

        promisess.push(promise);
      });

      Promise.all(promisess).then(fileDatas => {
        fileDatas.forEach(fileData => {
          this.imageFiles.push(fileData);
        });
      });

      // TODO こっちはプロミス使ってなくてそのまま処理が流れる。わかりづらい。
      if (files) {
        if (files.length > 0) {
          this.filename = [...files].map(file => file.name).join(", ");
        } else {
          this.imageFiles = [];
          this.filename = null;
        }
      } else {
        this.filename = $event.target.value.split("\\").pop();
      }
    },
    canvasToBlob(canvas, type) {
      return new Promise((resolve, reject) => {
        if (!type) {
          type = "image/jpeg";
        }
        if (canvas.toBlob) {
          canvas.toBlob(
            blob => {
              resolve(blob);
            },
            type,
            0.8
          );
        } else if (
          canvas.toDataURL &&
          window.Uint8Array &&
          window.Blob &&
          window.atob
        ) {
          var binStr = atob(canvas.toDataURL(type, 0.8).replace(/^[^,]*,/, "")),
            len = binStr.length,
            arr = new Uint8Array(len);

          for (var i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
          }
          resolve(new Blob([arr], { type: type }));
        } else {
          // TODO エラー処理
        }
      });
    },
    readFile(file) {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = function(e) {
          EXIF.getData(file, function() {
            var orientation = file.exifdata.Orientation;
            resolve({
              src: e.target.result,
              orientation: orientation
            });
          });
        };
        reader.readAsDataURL(file);
      });
    },
    fileToCanvas(src, orientation) {
      console.log(orientation);
      const image = new Image();
      var image_aspect, draw_width, draw_height, canvas_width, canvas_height;
      return new Promise((resolve, reject) => {
        image.onload = function() {
          //アスペクト取得
          image_aspect =
            orientation == 5 ||
            orientation == 6 ||
            orientation == 7 ||
            orientation == 8
              ? image.width / image.height
              : image.height / image.width;
          // var width, height;
          // if (image.width > image.height) {
          //   // 横長の画像は横のサイズを指定値にあわせる
          //   var ratio = image.height / image.width;
          //   width = IMAGE_MAX_WIDTH;
          //   height = IMAGE_MAX_WIDTH * ratio;
          // } else {
          //   // 縦長の画像は縦のサイズを指定値にあわせる
          //   var ratio = image.width / image.height;
          //   width = IMAGE_MAX_HEIGHT * ratio;
          //   height = IMAGE_MAX_HEIGHT;
          // }

          // if (image.width > image.height) {
          //   var ratio = image.height / image.width;
          //   canvas_width = IMAGE_MAX_WIDTH;
          //   canvas_height = IMAGE_MAX_WIDTH * ratio;
          // } else {
          //   var ratio = image.width / image.height;
          //   canvas_width = IMAGE_MAX_HEIGHT * ratio;
          //   canvas_height = IMAGE_MAX_HEIGHT;
          // }
          canvas_width = image.width;
          canvas_height = Math.floor(canvas_width * image_aspect);

          if (canvas_width > canvas_height) {
            // console.log("横がでかい");
            canvas_width = IMAGE_MAX_WIDTH;
            canvas_height = IMAGE_MAX_WIDTH * image_aspect;
          } else {
            // console.log("縦がでかい");
            canvas_width = (IMAGE_MAX_HEIGHT * canvas_width) / canvas_height;
            canvas_height = IMAGE_MAX_HEIGHT;
          }

          var canvas = document.createElement("canvas");
          var context = canvas.getContext("2d");
          canvas.width = canvas_width;
          canvas.height = canvas_height;

          draw_width = canvas_width;
          draw_height = canvas_height;

          switch (orientation) {
            case 2:
              context.transform(-1, 0, 0, 1, canvas.width, 0);
              break;

            case 3:
              context.transform(-1, 0, 0, -1, canvas.width, canvas.height);
              break;

            case 4:
              context.transform(1, 0, 0, -1, 0, canvas.height);
              break;

            case 5:
              context.transform(-1, 0, 0, 1, 0, 0);
              context.rotate((90 * Math.PI) / 180);
              draw_width = canvas.height;
              draw_height = canvas.width;
              break;

            case 6:
              context.transform(1, 0, 0, 1, canvas.width, 0);
              context.rotate((90 * Math.PI) / 180);
              draw_width = canvas.height;
              draw_height = canvas.width;
              break;

            case 7:
              context.transform(-1, 0, 0, 1, canvas.width, canvas.height);
              context.rotate((-90 * Math.PI) / 180);
              draw_width = canvas.height;
              draw_height = canvas.width;
              break;

            case 8:
              context.transform(1, 0, 0, 1, 0, canvas.height);
              context.rotate((-90 * Math.PI) / 180);
              draw_width = canvas.height;
              draw_height = canvas.width;
              break;

            default:
              break;
          }

          context.drawImage(image, 0, 0, draw_width, draw_height);

          resolve(canvas);
        };
        image.src = src;
      });
    },
    convertFileToBlob(file) {
      readFile(file)
        .then(src => {
          return fileToCanvas(src);
        })
        .then(canvas => {
          return canvasToBlob(canvas);
        });
    },

    back() {
      this.$router.back();
    },
    handleClose() {
      this.back();
    },

    handleUpload(event) {
      this.loading = true;
      this.uploadImage();
    },
    uploadImage() {
      const promisess = [];
      let ref = firestore.collection("images");
      this.imageFiles.forEach((fileData, index, arr) => {
        const extension = fileData.file.name.split(".").pop();
        const fileName = `${Date.now()}-${index}.${extension}`;
        const image = {
          fileName: fileName,
          label: this.label,
          uid: auth.currentUser.uid,
          country: this.country,
          filePath: `images/${fileName}`,
          timestamp: firestoreHelper.FieldValue.serverTimestamp()
        };
        const promise = new Promise((resolve, reject) => {
          const imageRef = storage.ref().child(`images/${fileName}`);
          var documentId = null;
          ref
            .add(image)
            .then(doc => {
              console.log("Document written with ID: ", doc.id);
              documentId = doc.id;
              image.id = doc.id;
              const metadata = {
                cacheControl: "public,max-age=31536000"
              };
              return imageRef.put(fileData.blob, metadata);
            })
            .then(() => {
              return imageRef.getDownloadURL();
            })
            .then(downloadURL => {
              image.originalFilePath = downloadURL;
              return ref.doc(documentId).set(
                {
                  originalFilePath: downloadURL
                },
                { merge: true }
              );
            })
            .then(() => {
              console.log(image);
              resolve(image);
            });
        });

        promisess.push(promise);
      });

      Promise.all(promisess).then(images => {
        images.forEach(image => {
          this.$parent.images.push(image);
        });

        firestore
          .collection("countries")
          .doc(this.country.id)
          .set({ hasImage: true }, { merge: true })
          .then(() => {
            this.loading = false;
            this.back();
          });
      });
    }
  }
};
</script>

<style scoped>
input[type="file"] {
  position: absolute;
  left: -99999px;
}
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
