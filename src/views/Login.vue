<template lang="html">
  <div class="signup container">
    <Loading v-if="progress" />
    <v-btn @click="signIn" :disabled="progress" color="error">Googleログイン</v-btn>
  </div>
</template>

<script>
import firebase from "firebase";
import { auth } from "@/firebase/init";
import Loading from "@/components/Loading.vue";

export default {
  name: "login",
  metaInfo: {
    title: "ログイン",
    meta: [
      {
        name: "description",
        content: "みんなのALBUM みんアルのログインページです。"
      }
    ]
  },

  components: {
    Loading
  },

  data() {
    return {
      progress: false
    };
  },

  methods: {
    signIn() {
      this.progress = true;
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(result => {
          this.progress = false;
          if (result.user) {
            this.$router.push("/");
          } else {
            alert("ログイン失敗");
          }
        });
    }
  }
};
</script>