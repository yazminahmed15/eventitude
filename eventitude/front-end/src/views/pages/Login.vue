<template>
  <div class="container text-center mt-5">
    <h1 class="display-4 mb-4">{{ welcome_message }}</h1>

    <div class="d-flex justify-content-center">
      <LoginForm />
    </div>
  </div>
</template>

<script>
import LoginForm from "../components/LoginForm.vue";

export default {
  data() {
    return {
      welcome_message: "Welcome to Eventitude!",
    };
  },
  components: {
    LoginForm,
  },
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: auto;
}
</style>
