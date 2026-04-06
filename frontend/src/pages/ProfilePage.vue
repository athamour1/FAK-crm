<template>
  <q-page padding class="profile-page">

    <div class="text-h5 q-mb-lg row items-center">
      <q-icon name="manage_accounts" class="q-mr-sm" />
      Profile Settings
    </div>

    <div class="row q-col-gutter-lg">

      <!-- ── Personal Info ─────────────────────────────────────────────────── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md row items-center">
            <q-icon name="person" class="q-mr-sm" color="primary" />
            Personal Information
          </div>

          <q-form @submit.prevent="saveInfo" class="q-gutter-sm">
            <q-input
              v-model="infoForm.fullName"
              label="Full Name"
              outlined dense
              :rules="[(v) => !!v || 'Name is required']"
            >
              <template #prepend><q-icon name="badge" /></template>
            </q-input>

            <q-input
              v-model="infoForm.email"
              label="Email"
              type="email"
              outlined dense
              :rules="[(v) => !!v || 'Email is required', (v) => /.+@.+\..+/.test(v) || 'Invalid email']"
            >
              <template #prepend><q-icon name="email" /></template>
            </q-input>

            <div class="row justify-end q-mt-sm">
              <q-btn no-caps rounded
                unelevated color="primary"
                label="Save Changes"
                icon="save"
                type="submit"
                :loading="savingInfo"
              />
            </div>
          </q-form>
        </q-card>
      </div>

      <!-- ── Change Password ───────────────────────────────────────────────── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md row items-center">
            <q-icon name="lock" class="q-mr-sm" color="primary" />
            Change Password
          </div>

          <q-form @submit.prevent="savePassword" class="q-gutter-sm">
            <q-input
              v-model="pwForm.currentPassword"
              label="Current Password"
              :type="showCurrent ? 'text' : 'password'"
              outlined dense
              :rules="[(v) => !!v || 'Required']"
            >
              <template #prepend><q-icon name="lock_open" /></template>
              <template #append>
                <q-icon
                  :name="showCurrent ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showCurrent = !showCurrent"
                />
              </template>
            </q-input>

            <q-input
              v-model="pwForm.newPassword"
              label="New Password"
              :type="showNew ? 'text' : 'password'"
              outlined dense
              :rules="[(v) => !!v || 'Required', (v) => v.length >= 6 || 'Min 6 characters']"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon
                  :name="showNew ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showNew = !showNew"
                />
              </template>
            </q-input>

            <q-input
              v-model="pwForm.confirmPassword"
              label="Confirm New Password"
              :type="showConfirm ? 'text' : 'password'"
              outlined dense
              :rules="[
                (v) => !!v || 'Required',
                (v) => v === pwForm.newPassword || 'Passwords do not match',
              ]"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-icon
                  :name="showConfirm ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirm = !showConfirm"
                />
              </template>
            </q-input>

            <div class="row justify-end q-mt-sm">
              <q-btn no-caps rounded
                unelevated color="primary"
                label="Update Password"
                icon="key"
                type="submit"
                :loading="savingPw"
              />
            </div>
          </q-form>
        </q-card>
      </div>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { usersApi } from 'src/services/api';
import { useAuthStore } from 'stores/auth.store';
import { useNotify } from 'src/composables/useNotify';

const authStore = useAuthStore();
const notify = useNotify();

// ── Personal info form ─────────────────────────────────────────────────────
const infoForm = reactive({ fullName: '', email: '' });
const savingInfo = ref(false);

onMounted(() => {
  infoForm.fullName = authStore.user?.fullName ?? '';
  infoForm.email = authStore.user?.email ?? '';
});

async function saveInfo() {
  savingInfo.value = true;
  try {
    const { data } = await usersApi.updateProfile({
      fullName: infoForm.fullName,
      email: infoForm.email,
    });
    authStore.setUser(data);
    notify.success('Profile updated successfully');
  } catch (e) {
    notify.error(e, 'Failed to update profile');
  } finally {
    savingInfo.value = false;
  }
}

// ── Password form ──────────────────────────────────────────────────────────
const pwForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });
const savingPw = ref(false);
const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

async function savePassword() {
  savingPw.value = true;
  try {
    await usersApi.updateProfile({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    });
    pwForm.currentPassword = '';
    pwForm.newPassword = '';
    pwForm.confirmPassword = '';
    notify.success('Password updated successfully');
  } catch (e) {
    notify.error(e, 'Failed to update password');
  } finally {
    savingPw.value = false;
  }
}
</script>

<style scoped lang="css">
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}
</style>
