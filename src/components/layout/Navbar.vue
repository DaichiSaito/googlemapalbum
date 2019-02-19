<template>
  <v-toolbar dark color="primary" clipped-left fixed app>
    <v-toolbar-title class="white--text">
      <router-link to="/" class="white--text">みんなで作る世界のアルバム</router-link>
    </v-toolbar-title>
    <v-spacer></v-spacer>

    <v-menu :nudge-width="100" bottom left>
      <v-toolbar-title slot="activator">
        <v-btn icon>
          <v-icon>more_vert</v-icon>
        </v-btn>
      </v-toolbar-title>

      <v-list>
        <v-list-tile v-if="!isSignedIn">
          <v-list-tile-title>
            <router-link :to="{ name: 'Signup' }">ログイン</router-link>
          </v-list-tile-title>
        </v-list-tile>

        <v-list-tile v-if="isSignedIn">
          <v-list-tile-title>
            <router-link :to="{ name: 'Mypage' }">
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
