<template>
  <v-toolbar dark color="primary" clipped-left fixed app>
    <v-toolbar-title class="white--text">
      <router-link to="/" class="white--text">みんアル</router-link>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <v-btn icon>
      <a
        href="https://docs.google.com/forms/d/1QVMxL4Vw7kFw752TR35DSOjsyrAC254mK-T3pzlTM14"
        target="_blank"
        class="white--text"
      >
        <v-icon>email</v-icon>
      </a>
    </v-btn>

    <v-menu bottom left>
      <v-btn slot="activator" dark icon>
        <v-icon>more_vert</v-icon>
      </v-btn>

      <v-list>
        <v-list-tile v-if="!isSignedIn">
          <v-list-tile-title>
            <router-link :to="{ name: 'login' }">ログイン</router-link>
          </v-list-tile-title>
        </v-list-tile>

        <v-list-tile v-if="isSignedIn">
          <v-list-tile-title>
            <router-link :to="{ name: 'mypage' }">
              <span style="color: #000;">マイアルバム</span>
            </router-link>
          </v-list-tile-title>
        </v-list-tile>

        <v-list-tile v-if="isSignedIn">
          <v-list-tile-title @click="signOut">
            <span style="cursor: pointer;">ログアウト</span>
          </v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-toolbar>
</template>

<script>
import { auth } from "@/firebase/init";
export default {
  data() {
    return {
      authButtonText: null,
      authFunction: function() {},
      isSignedIn: null
    };
  },
  created() {
    this.onAuthStateChanged();
  },
  methods: {
    onAuthStateChanged() {
      auth.onAuthStateChanged(user => {
        this.authButtonText = user ? "ログアウト" : "ログイン";
        this.authFunction = user ? this.signOut : this.signIn;
        this.isSignedIn = user ? true : false;
      });
    },
    signIn() {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    },
    signOut() {
      var result = window.confirm("ログアウトします");
      if (result) {
        auth.signOut();
        this.$router.push("/");
      }
    }
  }
};
</script>