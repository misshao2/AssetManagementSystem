<template>
  <div class="login-page">
    <el-card class="login-card">
      <div class="title">{{ title }}</div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入账号" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" class="submit" @click="handleLogin">
          登录
        </el-button>
        <div class="tip">演示环境：任意账号密码即可登录（已开启 Mock）</div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const title = import.meta.env.VITE_APP_TITLE
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ account: 'admin', password: '123456' })

const rules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login(form.account, form.password)
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } catch {
      ElMessage.error('登录失败，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2d3d 0%, #409eff 100%);
}

.login-card {
  width: 380px;
}

.title {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.submit {
  width: 100%;
}

.tip {
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}
</style>
