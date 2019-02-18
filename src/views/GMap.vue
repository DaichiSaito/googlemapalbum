<template>
  <div>
    <div class="map">
      <div class="google-map" id="map">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'gmap',
  data() {
    return {
        lat: 35.689,
        lng: 139.691
    }
  },
  methods: {
    renderMap() {
      const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: this.lat, lng: this.lng },
        zoom: 1,
        maxZoom: 15,
        minZoom: 3,
        streetViewControl: false,
        mapTypeControl: false,
      })
    }
  },

  mounted() {
    this.renderMap()
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
