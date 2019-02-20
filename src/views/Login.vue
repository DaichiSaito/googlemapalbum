<template lang="html">
  <div class="signup container">
    <v-btn @click="signIn" color="error">Googleログイン</v-btn>
  </div>
</template>

<script>
import firebase from "firebase";
import { auth } from "@/firebase/init";

export default {
  name: "login",

  methods: {
    signIn() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(result => {
          if (result.user) {
            this.$router.push("/");
          }
        });
    }
  }
};
</script>