<template>
  <div class="pause-window" v-if="visible">
    <h2>Pause Window</h2>
    <p>This is a placeholder for the Pause Window.</p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'PauseWindow',
  setup() {
    const visible = ref(false);

    const open = () => { visible.value = true; };
    const close = () => { visible.value = false; };

    return {
      visible,
      open,
      close
    };
  }
};
</script>

<style scoped>
.pause-window {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  background-color: white;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
