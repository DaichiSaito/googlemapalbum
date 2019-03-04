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
        <v-icon>timeline</v-icon>
      </v-btn>

      <v-list>
        <v-list-tile>
          <v-list-tile-title>最新の投稿</v-list-tile-title>
        </v-list-tile>
        <v-list-tile v-for="(imagePost, index) in recentPosts" :key="imagePost.id">
          <v-list-tile-title>
            <router-link
              class="recentPostText"
              :to="{ name: 'countryDetail', params: { id: imagePost.country.country_code } }"
            >
              {{imagePost.country.name_jps}}の写真が投稿されました
              <span class="small">{{imagePost.created_at}}</span>
            </router-link>
          </v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
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
import { firestore, auth } from "@/firebase/init";
export default {
  data() {
    return {
      authButtonText: null,
      authFunction: function() {},
      isSignedIn: null,
      recentPosts: []
    };
  },
  created() {
    this.onAuthStateChanged();
    this.getRecentPosts();
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
        alert("ログアウトしました。");
        this.$router.push("/");
      }
    },
    getRecentPosts() {
      this.recentPosts = [];
      firestore
        .collection("imagePosts")
        .orderBy("created_at")
        .limit(10)
        .get()
        .then(imagePosts => {
          imagePosts.docs.forEach(doc => {
            // TODO ビューの中で{{this.formatDate(data, 'yyyy/MM/dd')}}みたいに書くとエラーが出たので仕方なくここで変換してる
            if (doc.data().created_at) {
              this.recentPosts.unshift(
                Object.assign(doc.data(), {
                  id: doc.id,
                  created_at: this.formatDate(
                    doc.data().created_at.toDate(),
                    "yyyy/MM/dd"
                  )
                })
              );
            }
          });
        });
    },
    // TODO ここに定義するのおかしいよなー
    formatDate(date, format) {
      format = format.replace(/yyyy/g, date.getFullYear());
      format = format.replace(/MM/g, ("0" + (date.getMonth() + 1)).slice(-2));
      format = format.replace(/dd/g, ("0" + date.getDate()).slice(-2));
      format = format.replace(/HH/g, ("0" + date.getHours()).slice(-2));
      format = format.replace(/mm/g, ("0" + date.getMinutes()).slice(-2));
      format = format.replace(/ss/g, ("0" + date.getSeconds()).slice(-2));
      format = format.replace(
        /SSS/g,
        ("00" + date.getMilliseconds()).slice(-3)
      );
      return format;
    }
  },
  watch: {
    $route(to, from) {
      this.getRecentPosts();
    }
  }
};
</script>

<style>
.recentPostText {
  font-size: 12px;
}
</style>