<script setup lang="ts">
import MainBackground from "@/assets/main-bg.png";
</script>

<template>
  <div class="box h-full bg-cover bg-no-repeat bg-center">
    <div class="grid grid-cols-2">
      <div class="grid grid-cols-2 p-6">
        <div class="flex justify-center">
          <img
            class="rounded-full"
            src="https://cdn.discordapp.com/avatars/694828817457479731/31ab91407f0b68a855e990941e9cbb17.png?size=2048"
            height="70%"
            width="70%"
          />
        </div>

        <div class="flex flex-col items-center justify-center">
          <a
            class="transition ease-in-out bg-ctp-crust rounded-lg text-ctp-subtext0 text-xl ring-2 ring-ctp-red py-2.5 px-5 m-4 hover:bg-ctp-red hover:text-ctp-base hover:scale-110"
            href="https://discordapp.com/api/oauth2/authorize?client_id=694828817457479731&scope=bot&permissions=8"
            target="_blank"
          >
            Invite
          </a>
          <a
            class="inline-flex transition ease-in-out bg-ctp-crust rounded-lg text-ctp-subtext0 text-xl ring-2 ring-ctp-surface2 py-2.5 px-5 m-4 hover:bg-ctp-base hover:scale-110"
            href="https://github.com/BraveeSnow/cayde-6"
            target="_blank"
          >
            <img
              class="mr-2"
              src="@/components/icons/GitHub.png"
              width="28px"
            />
            <p>GitHub</p>
          </a>
        </div>
      </div>
      <div class="flex justify-center p-6">
        <h1 class="grad-text from-ctp-peach to-ctp-red text-5xl italic">
          The Hotshot Returns...
        </h1>
      </div>
    </div>
  </div>
</template>
