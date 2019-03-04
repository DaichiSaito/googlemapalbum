<template>
  <v-layout row wrap>
    <router-link :to="{ name: 'imageUploadModal', params: { id: this.$route.params.id } }">
      <v-btn fab small dark color="pink" bottom right fixed style="bottom: 50px;">
        <v-icon>add</v-icon>
      </v-btn>
    </router-link>
    <v-flex xs12>
      <h1 class="text-xs-center" v-if="country">{{country.name_jps}}</h1>
      <p class="text-xs-center" v-if="feedback">{{feedback}}</p>
    </v-flex>
    <v-flex v-if="filteredImages.length > 0" xs12>
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
    <router-view/>
  </v-layout>
</template>

<script>
import { firestore } from "@/firebase/init";
import LightBox from "vue-image-lightbox";
export default {
  name: "countryDetail",
  metaInfo() {
    return {
      title: this.country ? `${this.country.name_jps}のアルバム` : "Loading...",
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.description
        }
      ]
    };
  },
  components: {
    LightBox
  },
  data() {
    return {
      country: null,
      images: [],
      filter: null,
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
    },
    description() {
      if (this.country) {
        return `${this.country.name_jps}のアルバムページです。${
          this.country.name_jps
        }の写真を投稿してみんなで世界のアルバムを作り上げましょう。`;
      } else {
        return `Loading...`;
      }
    }
  },
  mounted: function() {
    this.getCountry();
    this.getImages();
  },
  methods: {
    getCountry() {
      firestore
        .collection("countries")
        .where("country_code", "==", this.$route.params.id)
        .get()
        .then(countries => {
          countries.docs.forEach(doc => {
            this.country = Object.assign(doc.data(), { id: doc.id });
          });
        });
    },
    getImages() {
      firestore
        .collection("images")
        .where("country.country_code", "==", this.$route.params.id)
        .get()
        .then(images => {
          if (images.docs.length == 0) {
            this.feedback = `投稿がありません。${
              this.country.name_jps
            }の写真をぜひ投稿してください！！`;
          } else {
            this.feedback = "";
          }
          this.images = images.docs.map(doc => {
            return Object.assign(doc.data(), { id: doc.id });
          });
        });
    },
    openGallery(index) {
      this.$refs.lightbox.showImage(index);
    }
  },
  // 動的ルーティングの際にページを再描画するために必要
  // https://atuweb.net/201707_vue-router-dmatching-reuse-component/
  watch: {
    $route(to, from) {
      this.getCountry();
      this.getImages();
    }
  }
};
</script>