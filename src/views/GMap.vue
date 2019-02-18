<template>
  <div>
    <div class="map">
      <div class="google-map" id="map">
      </div>
    </div>
  </div>
</template>

<script>
import { firestore } from '@/firebase/init'
export default {
  name: 'gmap',
  data() {
    return {
        lat: 35.689,
        lng: 139.691
    }
  },
  methods: {
    renderMap(countryDocs) {
      const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: this.lat, lng: this.lng },
        zoom: 1,
        maxZoom: 15,
        minZoom: 3,
        streetViewControl: false,
        mapTypeControl: false,
      })
      countryDocs.forEach(coundryDoc => {
        const country = coundryDoc.data()
        const marker = new google.maps.Marker({
              position: {
                lat: country.lat,
                lng: country.lon
              },
              map
          })
        if (country.hasImage) {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }
        
        marker.addListener('click', () => {
            // this.$router.push({ name: 'CityIndex', params: { id: doc.id, name: doc.data().name_jps } })
        })
      })
      
    },
    getCountries(callback) {
      firestore.collection('countries').get().then((countries) => {
        callback(countries)
      })
    }
  },

  mounted() {
    this.getCountries((countries) => {
      this.renderMap(countries.docs)
    })
  }
}
</script>

<style>
.google-map {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background: #fff;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
