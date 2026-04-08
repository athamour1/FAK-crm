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
        <q-form @submit="handleLogin" class="login-form">
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

          <!-- Stay logged in -->
          <q-toggle
            v-model="stayLoggedIn"
            label="Stay logged in"
            color="primary"
            dense
          />

          <!-- Error banner -->
          <q-banner
            v-if="loginError"
            dense
            class="bg-negative text-white text-caption"
          >
            <template #avatar>
              <q-icon name="error_outline" />
            </template>
            {{ loginError }}
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
const stayLoggedIn = ref(false);
const loginError = ref('');

async function handleLogin() {
  loginError.value = '';

  const success = await authStore.login(email.value, password.value, stayLoggedIn.value);
  if (!success) {
    loginError.value = authStore.error ?? 'Login failed. Please check your credentials.';
    return;
  }

  // Redirect to the originally requested page, or dashboard.
  // Sanitise: only allow internal paths (no protocol, no double-slash).
  const raw = route.query.redirect as string | undefined;
  const redirect = raw?.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
  void router.push(redirect);
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
