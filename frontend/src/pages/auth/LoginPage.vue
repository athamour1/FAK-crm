<template>
  <div class="login-page row items-center justify-center">
    <q-card class="login-card q-pa-lg shadow-5">
      <!-- Logo / branding -->
      <q-card-section class="text-center q-pb-sm">
        <q-icon name="medical_services" size="56px" color="primary" />
        <div class="text-h5 text-weight-bold q-mt-sm">OuchTracker</div>
        <div class="text-caption text-grey-6">Injury & Kit Tracker</div>
      </q-card-section>

      <!-- Login form -->
      <q-card-section>
        <q-form ref="formRef" @submit.prevent="handleLogin" class="login-form">
          <q-input
            v-model="email"
            type="email"
            label="Email address"
            outlined
            dense
            autocomplete="email"
            :rules="[
              (v) => !!v || 'Email is required',
              (v) => /.+@.+\..+/.test(v) || 'Enter a valid email',
            ]"
          >
            <template #prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            dense
            autocomplete="current-password"
            :rules="[(v) => !!v || 'Password is required']"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <!-- Error banner -->
          <q-banner
            v-if="authStore.error"
            dense
            class="bg-negative text-white text-caption"
          >
            <template #avatar>
              <q-icon name="error_outline" />
            </template>
            {{ authStore.error }}
          </q-banner>

          <q-btn no-caps rounded
            type="submit"
            label="Sign in"
            color="primary"
            class="full-width"
            unelevated
            size="md"
            :loading="authStore.loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth.store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const formRef = ref();

async function handleLogin() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  try {
    const user = await authStore.login(email.value, password.value);
    // Redirect to the originally requested page, or dashboard
    const redirect = (route.query.redirect as string) ?? '/dashboard';
    void router.push(redirect);
    void user; // used to determine redirect in future phases
  } catch {
    // error is already set in the store
  }
}
</script>

<style scoped lang="css">
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #c0645e 0%, #7a2e2e 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
