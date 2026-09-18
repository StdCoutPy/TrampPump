<template>
  <div class="modal-window-base" v-if="visible">
    <h2>Modal Window Base</h2>
    <p>This is a placeholder for the Modal Window Base.</p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'ModalWindowBase',
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
.modal-window-base {
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
