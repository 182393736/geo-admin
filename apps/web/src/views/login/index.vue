<template>
  <div class="login-page">
    <!-- Canvas 动画背景 -->
    <div class="bg-canvas-wrap">
      <canvas ref="canvasRef" class="bg-canvas"></canvas>
    </div>
    <div class="bg-radial-mask"></div>

    <!-- 左上角 Logo -->
    <a href="/" class="logo-link">
      <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.34-4.34"></path>
        <circle cx="11" cy="11" r="3" fill="currentColor" stroke="none"></circle>
      </svg>
      <span class="logo-text">透镜GEO</span>
    </a>

    <!-- 主体两栏 -->
    <div class="login-main">
      <!-- ===== 左侧：登录表单 ===== -->
      <div class="login-left">
        <main class="login-main-inner">
          <div class="login-card">
            <h1 class="login-title">登录</h1>
            <p class="login-subtitle">开启 GEO 搜索流量增长引擎</p>

            <!-- Tab 切换 -->
            <div class="login-tabs">
              <button class="login-tab" :class="{ active: activeTab === 'phone' }" @click="activeTab = 'phone'">
                <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>
                手机号登录
              </button>
              <button class="login-tab" :class="{ active: activeTab === 'account' }" @click="activeTab = 'account'">
                <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                账号登录
              </button>
            </div>

            <!-- 表单 -->
            <form class="login-form" @submit.prevent="handleSubmit">
              <!-- 账号密码登录 -->
              <template v-if="activeTab === 'account'">
                <div class="form-item">
                  <label class="form-label">账号</label>
                  <div class="input-wrap">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input v-model="account" class="form-input" placeholder="请输入账号" type="text" />
                  </div>
                </div>
                <div class="form-item">
                  <label class="form-label">密码</label>
                  <div class="input-wrap">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <input v-model="password" class="form-input" placeholder="请输入密码" type="password" />
                  </div>
                </div>
                <button type="submit" class="submit-btn" :disabled="!account || !password">
                  登录
                  <svg class="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
              </template>

              <!-- 手机号登录 -->
              <template v-else>
                <div class="form-item">
                  <label class="form-label">手机号码</label>
                  <div class="input-wrap">
                    <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>
                    <input
                      v-model="phone"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      class="form-input"
                      placeholder="请输入手机号"
                      maxlength="11"
                      required
                      type="tel"
                    />
                  </div>
                </div>
                <button type="submit" class="submit-btn" :disabled="!phone">
                  获取验证码
                  <svg class="submit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
              </template>

              <div class="register-link">
                没有账号？
                <button type="button" class="register-btn">注册</button>
              </div>
            </form>

            <!-- 底部条款 -->
            <div class="terms">
              <p>登录即表示您同意条款及<a href="/privacy" target="_blank" rel="noopener noreferrer" class="terms-link">隐私政策</a></p>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="login-footer">
          <div class="footer-links">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" class="footer-link">隐私政策</a>
            <span class="footer-sep">|</span>
            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" class="footer-link">服务条款</a>
          </div>
          <span class="footer-copy">© 2026 透镜GEO Inc. 版权所有</span>
        </footer>
      </div>

      <!-- ===== 右侧：引导区 ===== -->
      <div class="login-right">
        <!-- 径向渐变背景圆 -->
        <div class="right-bg-circle"></div>

        <div class="right-content">
          <div class="right-inner">
            <div class="right-card-wrap">
              <div class="right-card-inner">
                <!-- 新手指引标签 -->
                <div class="guide-badge">
                  <span class="guide-dot"></span>
                  <span class="guide-badge-text">新手指引</span>
                </div>

                <!-- 标题 -->
                <h2 class="guide-title">
                  三步开启<span class="guide-title-gradient"> GEO排名监测</span>
                </h2>
                <p class="guide-subtitle">快速配置，即刻掌握品牌在AI搜索中的表现</p>

                <!-- 三步骤 + 模拟界面 -->
                <div class="guide-steps-wrap">
                  <!-- 左侧步骤 -->
                  <div class="steps-left">
                    <button class="step-item inactive">
                      <div class="step-num inactive">1</div>
                      <div class="step-text">
                        <h3 class="step-title inactive">添加监测品牌</h3>
                        <p class="step-desc">录入品牌与业务信息</p>
                      </div>
                    </button>
                    <button class="step-item active">
                      <div class="step-num active">2</div>
                      <div class="step-text">
                        <h3 class="step-title active">提交问题及提示词</h3>
                        <p class="step-desc">配置监控问题与指令</p>
                      </div>
                    </button>
                    <button class="step-item inactive">
                      <div class="step-num inactive">3</div>
                      <div class="step-text">
                        <h3 class="step-title inactive">开启排名监测</h3>
                        <p class="step-desc">实时追踪AI搜索排名</p>
                      </div>
                    </button>
                  </div>

                  <!-- 右侧模拟界面 -->
                  <div class="mock-ui">
                    <div class="mock-search">
                      <svg class="mock-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                      <span class="mock-search-text">补充自定义问题...</span>
                      <div class="mock-search-plus">
                        <svg class="mock-plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                      </div>
                    </div>

                    <div class="mock-question-card active">
                      <div class="mock-q-body">
                        <div class="mock-q-title">AI数字人应用</div>
                        <div class="mock-q-tags">
                          <span class="mock-tag primary">核心关注</span>
                          <span class="mock-tag">排名词</span>
                        </div>
                      </div>
                      <svg class="mock-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                    </div>

                    <div class="mock-question-card active">
                      <div class="mock-q-body">
                        <div class="mock-q-title">SaaS排名优化</div>
                        <div class="mock-q-tags">
                          <span class="mock-tag primary">解决方案</span>
                          <span class="mock-tag">品牌词</span>
                        </div>
                      </div>
                      <svg class="mock-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                    </div>

                    <div class="mock-question-card active">
                      <div class="mock-q-body">
                        <div class="mock-q-title">GEO监控工具</div>
                        <div class="mock-q-tags">
                          <span class="mock-tag primary">工具软件</span>
                          <span class="mock-tag">长尾词</span>
                        </div>
                      </div>
                      <svg class="mock-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                    </div>

                    <div class="mock-footer">
                      <span class="mock-footer-text">已选 <span class="mock-count">3</span> / 3 个问题</span>
                      <div class="mock-next-btn">下一步: 确认指令 →</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref<'account' | 'phone'>('account');
const account = ref('');
const password = ref('');
const phone = ref('');
const canvasRef = ref<HTMLCanvasElement | null>(null);
let animId = 0;

// Canvas 粒子动画
function initCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  // 粒子
  const particles: { x: number; y: number; vx: number; vy: number; r: number; color: string }[] = [];
  const colors = ['rgba(99,102,241,0.3)', 'rgba(139,92,246,0.3)', 'rgba(79,70,229,0.2)'];
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // 连线
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(99,102,241,${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
    animId = requestAnimationFrame(animate);
  };
  animate();
}

onMounted(() => {
  initCanvas();
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
});

function handleSubmit() {
  // 账号密码登录：跳转到报告页面
  if (activeTab.value === 'account') {
    router.push('/dashboard/overview');
    return;
  }
  // 手机号登录：获取验证码逻辑
}
</script>

<style scoped lang="scss">
/* ============ 颜色变量 ============ */
$slate-50: #f8fafc;
$slate-100: #f1f5f9;
$slate-200: #e2e8f0;
$slate-300: #cbd5e1;
$slate-400: #94a3b8;
$slate-500: #64748b;
$slate-600: #475569;
$slate-700: #334155;
$slate-800: #1e293b;
$slate-900: #0f172a;
$indigo-200: #c7d2fe;
$indigo-500: #6366f1;
$indigo-600: #4f46e5;
$indigo-50: #eef2ff;
$purple-100: #f3e8ff;
$purple-500: #8b5cf6;
$purple-700: #7e22ce;

/* ============ 页面根容器 ============ */
.login-page {
  position: relative;
  min-height: 100vh;
  background: $slate-50;
  overflow: hidden;
}

/* ============ Canvas 背景 ============ */
.bg-canvas-wrap {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  .bg-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.4;
    pointer-events: none;
  }
}

.bg-radial-mask {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, transparent 0%, rgba(248, 250, 252, 0.8) 100%);
}

/* ============ Logo ============ */
.logo-link {
  position: absolute;
  top: 32px;
  left: 32px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;

  .logo-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
    color: $indigo-600;
  }

  .logo-text {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: $slate-900;
  }
}

/* ============ 主体两栏 ============ */
.login-main {
  position: relative;
  z-index: 10;
  display: flex;
  min-height: 100vh;
}

/* ============ 左侧 ============ */
.login-left {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 64px;
  position: relative;
  justify-content: center;
  z-index: 20;

  @media (min-width: 1024px) {
    width: 50%;
  }
}

.login-main-inner {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
}

/* ============ 登录卡片 ============ */
.login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(203, 213, 225, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 40px;
  }
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: $slate-900;
  margin: 0 0 8px;
  text-align: center;
}

.login-subtitle {
  color: $slate-500;
  text-align: center;
  margin: 0 0 32px;
  font-size: 16px;
}

/* ============ Tab 切换 ============ */
.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.login-tab {
  flex: 1;
  padding: 10px 0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: $slate-100;
  color: $slate-600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  .tab-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }

  &.active {
    background: $slate-900;
    color: #fff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

    &:hover {
      background: $slate-800;
    }
  }

  &:not(.active):hover {
    background: $slate-200;
  }
}

/* ============ 表单 ============ */
.login-form {
  display: flex;
  flex-direction: column;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: $slate-500;
  margin: 0 0 4px 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: $slate-400;
  pointer-events: none;
}

.form-input {
  width: 100%;
  background: $slate-50;
  border: 1px solid $slate-200;
  border-radius: 12px;
  padding: 14px 16px 14px 48px;
  font-size: 16px;
  font-weight: 500;
  color: $slate-900;
  outline: none;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  letter-spacing: 0.025em;
  box-sizing: border-box;

  &::placeholder {
    color: $slate-400;
    font-weight: 400;
  }

  &:focus {
    border-color: $slate-900;
    box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.05);
  }
}

/* ============ 提交按钮 ============ */
.submit-btn {
  width: 100%;
  background: $slate-900;
  color: #fff;
  font-weight: 700;
  padding: 16px 0;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
  margin: 16px 0 20px;

  .submit-icon {
    width: 16px;
    height: 16px;
  }

  &:hover:not(:disabled) {
    background: $slate-600;
    box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.2);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* ============ 注册链接 ============ */
.register-link {
  text-align: center;
  font-size: 14px;
  color: $slate-500;
  margin-top: 16px;
}

.register-btn {
  color: $slate-900;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  padding: 0;
  font-size: 14px;

  &:hover {
    text-decoration: underline;
  }
}

/* ============ 底部条款 ============ */
.terms {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid $slate-100;

  p {
    text-align: center;
    font-size: 12px;
    color: $slate-400;
    margin: 0;
  }

  .terms-link {
    text-decoration: underline;
    color: inherit;

    &:hover {
      color: $slate-600;
    }
  }
}

/* ============ Footer ============ */
.login-footer {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: $slate-400;

  .footer-links {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 8px;
  }

  .footer-link {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: $slate-600;
    }
  }

  .footer-sep {
    color: $slate-300;
  }

  .footer-copy {
    display: block;
  }
}

/* ============ 右侧引导区 ============ */
.login-right {
  display: none;
  position: relative;
  z-index: 10;
  align-items: center;
  justify-content: center;
  overflow: visible;

  @media (min-width: 1024px) {
    display: flex;
    width: 50%;
  }
}

.right-bg-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  height: 700px;
  border-radius: 50%;
  opacity: 0.6;
  pointer-events: none;
  background: radial-gradient(circle, rgba(219, 234, 254, 0.4) 0%, rgba(224, 231, 255, 0.2) 40%, transparent 70%);
}

.right-content {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  margin-top: -120px;
}

.right-inner {
  width: 100%;
  max-width: 620px;
  transform: scale(1.08) translateX(-64px);
  transform-origin: center;
}

.right-card-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
}

.right-card-inner {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ============ 新手指引标签 ============ */
.guide-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  background: #fff;
  border: 1px solid $purple-100;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  margin-bottom: 16px;

  .guide-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $purple-500;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .guide-badge-text {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.025em;
    color: $purple-700;
    text-transform: uppercase;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ============ 引导标题 ============ */
.guide-title {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.025em;
  color: $slate-900;
  margin: 0 0 4px;
  text-align: center;
}

.guide-title-gradient {
  background: linear-gradient(to right, $indigo-600, $purple-500);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.guide-subtitle {
  font-size: 16px;
  color: $slate-400;
  margin: 0 0 32px;
  text-align: center;
}

/* ============ 步骤 + 模拟界面 ============ */
.guide-steps-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.steps-left {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  width: 200px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  user-select: none;
  cursor: pointer;
  transition: all 0.3s;
  background: none;
  border: none;
  padding: 0;
  text-align: left;

  &.inactive {
    opacity: 0.7;

    &:hover {
      opacity: 0.9;
    }
  }

  &.active {
    opacity: 1;
  }
}

.step-num {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  border: 1px solid $slate-200;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
  font-weight: 900;
  transition: all 0.3s;

  &.inactive {
    background: rgba(255, 255, 255, 0.5);
    border-color: $slate-200;
    color: $slate-400;
  }

  &.active {
    background: #fff;
    border-color: $purple-100;
    color: $indigo-600;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
  }
}

.step-text {
  text-align: left;
}

.step-title {
  font-weight: 900;
  font-size: 14px;
  line-height: 1.25;
  white-space: nowrap;
  transition: color 0.3s;
  margin: 0;

  &.inactive { color: $slate-500; }
  &.active { color: $slate-900; }
}

.step-desc {
  font-size: 12px;
  font-weight: 700;
  margin: 2px 0 0;
  white-space: nowrap;
  transition: color 0.3s;
  color: $slate-400;
}

/* ============ 模拟界面 ============ */
.mock-ui {
  width: 390px;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.mock-search {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid $slate-100;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  .mock-search-icon {
    width: 14px;
    height: 14px;
    color: $slate-300;
    flex-shrink: 0;
  }

  .mock-search-text {
    font-size: 12px;
    color: $slate-400;
  }

  .mock-search-plus {
    margin-left: auto;
    width: 20px;
    height: 20px;
    background: $slate-50;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $slate-100;

    .mock-plus-icon {
      width: 12px;
      height: 12px;
      color: $slate-400;
    }
  }
}

.mock-question-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 2px solid $indigo-200;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  .mock-q-body {
    flex: 1;
    min-width: 0;
  }

  .mock-q-title {
    font-size: 12px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4px;
  }

  .mock-q-tags {
    display: flex;
    gap: 6px;
  }

  .mock-tag {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 500;
    background: $slate-50;
    color: $slate-500;

    &.primary {
      background: $indigo-50;
      color: $indigo-600;
    }
  }

  .mock-check {
    width: 16px;
    height: 16px;
    color: $indigo-500;
    flex-shrink: 0;
  }
}

.mock-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;

  .mock-footer-text {
    font-size: 10px;
    color: $slate-400;

    .mock-count {
      color: $indigo-600;
      font-weight: 700;
    }
  }

  .mock-next-btn {
    background: $slate-900;
    color: #fff;
    font-size: 10px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 4px;
  }
}

/* ============ 动画 ============ */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.login-main-inner {
  animation: slide-up 0.6s ease-out;
}

.logo-link {
  animation: fade-in 0.5s ease-out;
}
</style>
