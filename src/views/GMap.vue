<template>
  <div>
    <div class="pin_description v-card v-sheet theme--light">
      <p class="pin_description_text v-card__title mb-0">ピンが動いている ＝ 写真が投稿されている</p>
    </div>
    <div class="map">
      <div class="google-map" id="map"></div>
    </div>
  </div>
</template>

<script>
import { firestore } from "@/firebase/init";
export default {
  name: "gmap",
  data() {
    return {
      lat: 35.689,
      lng: 139.691
    };
  },
  methods: {
    renderMap(countryDocs) {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: this.lat, lng: this.lng },
        zoom: 1,
        maxZoom: 15,
        minZoom: 2,
        streetViewControl: false,
        mapTypeControl: false,
        gestureHandling: "greedy"
      });
      countryDocs.forEach(countryDoc => {
        const country = countryDoc.data();
        const marker = new google.maps.Marker({
          position: {
            lat: country.lat,
            lng: country.lon
          },
          map
        });
        if (country.hasImage) {
          marker.setAnimation(google.maps.Animation.BOUNCE);
        }

        marker.addListener("click", () => {
          this.$router.push({
            name: "countryDetail",
            params: { id: country.country_code }
          });
        });
      });
    },
    getCountries(callback) {
      firestore
        .collection("countries")
        .get()
        .then(countries => {
          callback(countries);
        });
    }
  },

  mounted() {
    this.getCountries(countries => {
      this.renderMap(countries.docs);
    });
  }
};
</script>

<style>
.pin_description {
  position: absolute !important;
  z-index: 1;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  top: 0;
}

.pin_description_text {
  justify-content: center;
}
@media screen and (max-width: 767px) {
  .pin_description {
    font-size: 10px;
    width: 80vw;
  }
}
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
