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
import { firestore, storage, auth } from "@/firebase/init";
// import firebase from 'firebase'
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
      Array.from(files).forEach((file, index, arr) => {
        this.imageFiles.push(file);
      });

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
      this.imageFiles.forEach((file, index, arr) => {
        const extension = file.name.split(".").pop();
        const fileName = `${Date.now()}-${index}.${extension}`;
        const image = {
          thumbFileName: null,
          fileName: fileName,
          label: this.label,
          // uid: auth.currentUser.uid,
          country: this.country
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
              return imageRef.put(file);
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
        this.loading = false;
        this.back();
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
