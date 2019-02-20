<template>
  <v-layout row wrap>
    <v-flex xs12>
      <h1 class="text-xs-center">マイページ</h1>
      <p class="text-xs-center" v-if="feedback">{{feedback}}</p>
    </v-flex>
    <v-flex v-if="filteredImages.length > 0" xs12>
      <v-dialog v-model="loading" hide-overlay persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>Please stand by
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-card>
        <v-container grid-list-sm fluid>
          <v-layout row wrap>
            <v-flex v-for="(image, index) in filteredImages" :key="image.id" xs6 sm4 d-flex>
              <v-card flat tile class="d-flex">
                <v-img
                  v-bind:src="(image.thumbFilePath) ? image.thumbFilePath : image.originalFilePath"
                  :lazy-src="`https://placehold.jp/150x150.png`"
                  aspect-ratio="1"
                  class="grey lighten-2"
                  @click="openGallery(index)"
                >
                  <v-btn fab dark small color="error" v-on:click.stop="deleteImage(image)">
                    <v-icon dark>delete_forever</v-icon>
                  </v-btn>
                  <v-layout slot="placeholder" fill-height align-center justify-center ma-0>
                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                  </v-layout>
                </v-img>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-flex xs12>
      <LightBox :images="lightboximages" :showLightBox="false" :showCaption="true" ref="lightbox"></LightBox>
    </v-flex>
  </v-layout>
</template>

<script>
import LightBox from "vue-image-lightbox";
import { firestore, auth, storage } from "@/firebase/init";

export default {
  name: "mypage",
  components: {
    LightBox
  },
  data() {
    return {
      images: [],
      filter: null,
      loading: false,
      feedback: null
    };
  },
  computed: {
    filteredImages() {
      if (!this.filter) {
        return this.images;
      }
      return this.images.filter(image => {
        return image.label == this.filter;
      });
    },
    lightboximages() {
      return this.filteredImages.map(filteredImage => {
        return {
          thumb: filteredImage.thumbFilePath
            ? filteredImage.thumbFilePath
            : filteredImage.originalFilePath,
          src: filteredImage.originalFilePath,
          caption: filteredImage.label
        };
      });
    }
  },
  created() {
    firestore
      .collection("images")
      .where("uid", "==", auth.currentUser.uid)
      .get()
      .then(images => {
        if (images.docs.length == 0) {
          this.feedback = `まだ投稿がありません。ぜひいろんな国の写真を投稿してください。`;
        }
        this.images = images.docs.map(doc => {
          return Object.assign(doc.data(), { id: doc.id });
        });
      });
  },
  methods: {
    openGallery(index) {
      this.$refs.lightbox.showImage(index);
    },
    deleteImage(image) {
      if (this.loading) {
        return;
      }
      console.log(image.id);
      var result = window.confirm("削除します");
      if (!result) {
        return;
      }

      this.loading = true;

      let ref = firestore.collection("images");
      ref
        .doc(image.id)
        .delete()
        .then(() => {
          console.log("Document successfully deleted!");
          this.images = this.images.filter(_image => {
            return _image.id != image.id;
          });

          return storage
            .ref()
            .child(image.filePath)
            .delete();
        })
        .then(() => {
          let ref = firestore.collection("images");
          console.log(image.country.country_code);
          ref
            .where("country.country_code", "==", image.country.country_code)
            .limit(1)
            .get()
            .then(images => {
              if (images.docs.length == 0) {
                console.log("0件");
                return firestore
                  .collection("countries")
                  .doc(image.country.id)
                  .set({ hasImage: false }, { merge: true });
              } else {
                return;
              }
            })
            .then(() => {
              this.loading = false;
            });
        });
    }
  }
};
</script>
<style>
.v-responsive__content {
  position: absolute;
  right: 0;
}
</style>