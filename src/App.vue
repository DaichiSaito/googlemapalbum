<template>
  <v-app>
    <Navbar/>
    <v-content>
      <v-container pa-0 fill-height>
        <v-fade-transition mode="out-in">
          <router-view></router-view>
        </v-fade-transition>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Navbar from "@/components/layout/Navbar";

export default {
  name: "App",
  metaInfo: {
    title: "みんなのALBUM",
    titleTemplate: "%s | みんなのALBUM"
  },
  components: {
    Navbar
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
a {
  text-decoration: none;
}
</style>
