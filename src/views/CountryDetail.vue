<template>
  <v-layout row wrap> 
    <v-flex xs12>
      <h1 class="text-xs-center" v-if="country">{{country.name_jps}}</h1>
    </v-flex>
    <v-flex v-if="filteredImages.length > 0" xs12>
      <v-card>
        <v-container grid-list-sm fluid>
          <v-layout row wrap>
            <v-flex
              v-for="(image, index) in filteredImages"
              :key="image.id"
              xs6 sm4
              d-flex
            >
              <v-card flat tile class="d-flex">
                <v-img
                  v-bind:src="(image.thumbFileName) ? image.thumbFileName : image.fileName"
                  :lazy-src="`https://placehold.jp/150x150.png`"
                  aspect-ratio="1"
                  class="grey lighten-2"
                  @click="openGallery(index)"
                >
                  <v-layout
                    slot="placeholder"
                    fill-height
                    align-center
                    justify-center
                    ma-0
                  >
                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                  </v-layout>
                </v-img>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { firestore } from '@/firebase/init'
export default {
  name: 'countryDetail',
  data () {
    return {
        country: null,
        images: [],
        filter: null
    }
  },
  computed: {
    filteredImages() {
      if (!this.filter) {
        return this.images
      }
      return this.images.filter(image => {
        return image.label == this.filter
      })
    }
  },
  mounted: function () {
    firestore.collection('countries').where('country_code', '==', 'JP').get().then((countries) => {
      countries.docs.forEach(doc => {
        this.country = Object.assign(doc.data(), { id: doc.id })
      })
    })
    firestore.collection('images').where('country.country_code', '==', 'JP').get().then((images) => {
      this.images = images.docs.map(doc => {
        return Object.assign(doc.data(), { id: doc.id })
      })
      
    })
  },
}
</script>