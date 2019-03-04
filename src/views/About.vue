<template>
  <div class="about container">
    <h1>このサービスについて</h1>
    <p>みんなで作る世界のアルバム</p>
    <p>
      略して
      <span class="font-weight-bold">『みんアル』</span>
    </p>
    <p class="font-weight-bold subheading">みんな（匿名）で世界中の写真をアップして一つのアルバムを作ろう。</p>
    <p>ピンが動いている = 写真が投稿されている です。</p>
    <p>みんなに使ってもらってゆくゆくは全部のピンを動かしたい。</p>
    <v-layout class="text-xs-center">
      <v-flex xs6 pa-1>
        <p>現状のこれを...</p>
        <img src="../assets/map_current.gif">
      </v-flex>
      <v-flex xs6 pa-1>
        <p>こうしたい...（不気味）</p>
        <img src="../assets/map_ideal.gif">
      </v-flex>
    </v-layout>

    <h2>コンセプト</h2>
    <h3>『匿名で雑多に写真をあげまくる』</h3>
    <p>インスタはちょっと背伸びしたり何かと疲れちゃいますよね。みんアルは『匿名で雑多に写真をあげる』をコンセプトとしています。</p>
    <h2>よくある質問</h2>
    <dl>
      <dt class="font-weight-bold deep-orange--text">Q. GoogleやGoogleMapで良くないですか？</dt>
      <dd class="font-weight-bold deep-orange--text">A. はい、おっしゃる通りです。</dd>
    </dl>
    <h2>使い方</h2>
    <v-layout wrap mb-5>
      <v-flex xs6 pa-1>
        <h3>STEP1</h3>
        <p>投稿したい国のピンをタップ（首都にピンがささってます。）</p>
      </v-flex>
      <v-flex xs6 pa-1>
        <img src="../assets/step1.jpg">
      </v-flex>
      <v-flex xs6 pa-1>
        <h3>STEP2</h3>
        <p>プラスアイコンをタップ</p>
      </v-flex>
      <v-flex xs6 pa-1>
        <img src="../assets/step2.jpg">
      </v-flex>
      <v-flex xs6 pa-1>
        <h3>STEP3</h3>
        <p>画像を選択し、ラベルを入力して、アップロード（今後フィルタリング用に使用するかもしれないのでラベルも入力してもらえるとなお良い）</p>
        <p class="caption">※現状、サービス内でラベルを使用している箇所はありませんが、今後フィルタリング機能を実装するために入れておいてもらうと助かります。</p>
      </v-flex>
      <v-flex xs6 pa-1>
        <img src="../assets/step3.jpg">
      </v-flex>
    </v-layout>
    <v-layout justify-center pb-5>
      <router-link :to="{ name: 'gmap' }">
        <v-btn color="info">さっそく写真を見てみる</v-btn>
      </router-link>
    </v-layout>
  </div>
</template>
<script>
export default {
  name: "about",
  metaInfo: {
    title: "このサービスについて",
    meta: [
      {
        name: "description",
        content:
          "みんなで作る世界のアルバム。略して 『みんアル』。みんな（匿名）で世界中の写真をアップして一つのアルバムを作ろう。"
      }
    ]
  }
};
</script>
<style scoped>
.about {
  text-align: left;
  width: 100%;
  background-color: white;
}
img {
  max-width: 100%;
}
h1,
h2 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>