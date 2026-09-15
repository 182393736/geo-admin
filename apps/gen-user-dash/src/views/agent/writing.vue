<template>
  <div class="ws-page">
    <div class="ws-shell">
      <div class="ws-header">
        <div class="ws-title" :title="session?.title">{{ session?.title || '…' }}</div>
        <button type="button" class="ws-credit" title="查看积分明细 / 充值" @click="goCredits">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>
          <span class="ws-credit-muted">本轮消耗</span>
          <span class="ws-credit-num">{{ session?.cost ?? 0 }}</span>
          <span class="ws-credit-dot">·</span>
          <span class="ws-credit-muted">可用余额</span>
          <span class="ws-credit-bal">{{ balance }}</span>
        </button>
      </div>

      <div class="ws-status">
        <div class="ws-status-ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="11" height="11" class="ws-spin"><path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M4.93 19.07l2.83-2.83M12 22v-4M19.07 19.07l-2.83-2.83M22 12h-4M19.07 4.93l-2.83 2.83"/></svg>
        </div>
        <div class="ws-status-tx">{{ session?.ended ? '已结束' : (session?.status_label || '等用户追加') }}</div>
        <div class="ws-status-pct">{{ session?.progress ?? 5 }}%</div>
      </div>

      <div ref="feedRef" class="ws-feed">
        <div class="ws-thread">
          <template v-for="(m, i) in session?.messages || []" :key="i">
            <div v-if="m.role === 'user'" class="ws-user-wrap">
              <div class="ws-user-bubble">{{ m.content }}</div>
            </div>
            <div v-else class="ws-ai-wrap">
              <div class="ws-ai-bubble agent-answer-markdown">
                <p>{{ m.content }}</p>
              </div>
            </div>
          </template>
          <div v-if="sending" class="ws-ai-wrap">
            <div class="ws-ai-bubble ws-typing">思考中…</div>
          </div>
        </div>
      </div>

      <div class="ws-composer">
        <div class="ws-composer-inner">
          <div class="ws-input-card">
            <textarea
              v-model="draft"
              rows="1"
              placeholder="继续和 AI 对话..."
              :disabled="!!session?.ended"
              @keydown="onKeydown"
              @input="autoGrow"
              ref="taRef"
            />
            <button
              type="button"
              class="ws-send"
              title="发送"
              :disabled="!canSend"
              @click="send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="m5 12 14-9-6 18-2-8-6-1z"/></svg>
            </button>
          </div>
          <div class="ws-end-row">
            <button type="button" class="ws-end" title="结束本轮写作(关闭 run, 不可续聊)" @click="endSession">
              × 结束本篇
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { agentApi, type AgentChatSession } from '@/api/modules/agent';
import { userApi } from '@/api/modules/user';

const route = useRoute();
const router = useRouter();
const session = ref<AgentChatSession | null>(null);
const balance = ref(0);
const draft = ref('');
const sending = ref(false);
const feedRef = ref<HTMLElement | null>(null);
const taRef = ref<HTMLTextAreaElement | null>(null);

const canSend = computed(() => !sending.value && !session.value?.ended && !!draft.value.trim());

async function load() {
  const id = String(route.params.id || '');
  if (!id) return;
  try {
    session.value = await agentApi.detail(id);
    await nextTick();
    scrollBottom();
  } catch {
    ElMessage.error('会话不存在');
    router.replace('/dashboard/new-agent');
  }
}

async function loadBalance() {
  try {
    const acc: any = await userApi.creditAccount();
    balance.value = Math.round(Number(acc?.available ?? acc?.balance ?? 0));
  } catch { /* ignore */ }
}

function scrollBottom() {
  const el = feedRef.value;
  if (el) el.scrollTop = el.scrollHeight;
}

function autoGrow() {
  const el = taRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(100, Math.max(33, el.scrollHeight))}px`;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
}

async function send() {
  if (!canSend.value || !session.value) return;
  const content = draft.value.trim();
  draft.value = '';
  autoGrow();
  sending.value = true;
  try {
    session.value = await agentApi.message(session.value.session_id, content);
    window.dispatchEvent(new CustomEvent('agent-sessions-changed'));
    await nextTick();
    scrollBottom();
  } catch (err: any) {
    ElMessage.error(err?.message || '发送失败');
    draft.value = content;
  } finally {
    sending.value = false;
  }
}

async function endSession() {
  if (!session.value || session.value.ended) {
    router.push('/dashboard/new-agent');
    return;
  }
  try {
    await ElMessageBox.confirm('结束本篇后将不可继续对话，确认结束？', '结束本篇', {
      confirmButtonText: '结束',
      cancelButtonText: '取消',
      type: 'warning',
    });
  } catch { return; }
  try {
    session.value = await agentApi.end(session.value.session_id);
    window.dispatchEvent(new CustomEvent('agent-sessions-changed'));
    ElMessage.success('已结束');
    router.push('/dashboard/new-agent');
  } catch (err: any) {
    ElMessage.error(err?.message || '结束失败');
  }
}

function goCredits() {
  router.push('/dashboard/plan-upgrade');
}

watch(() => route.params.id, () => load());

onMounted(() => {
  load();
  loadBalance();
});
</script>

<style lang="scss" scoped>
.ws-page {
  margin: 0;
  min-height: 100vh;
  background: rgba(255, 255, 255, 0.65);
  font-family: Inter, 'Noto Sans SC', system-ui, -apple-system, sans-serif;
}

.ws-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background: transparent;
  min-width: 0;
}

.ws-header {
  padding: 12px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ws-title {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0f1115;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.ws-credit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  background: #f3f0ff;
  border: 1px solid #e3deff;
  color: #6b5bd2;
  white-space: nowrap;
  font-family: inherit;
}
.ws-credit-muted { color: #8a8398; }
.ws-credit-dot { color: #cbc7d6; }
.ws-credit-num, .ws-credit-bal {
  font-variant-numeric: tabular-nums;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  font-weight: 800;
  color: #6b5bd2;
}

.ws-status {
  margin: 0 20px 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #efecff 0%, #fbf9ff 100%);
  border: 1px solid rgba(100, 82, 255, 0.22);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #4a3edf;
  flex-shrink: 0;
}
.ws-status-ic {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: #6452ff;
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  animation: ai-status-pulse 1.5s ease-in-out infinite;
}
.ws-status-tx {
  flex: 1;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ws-status-pct {
  font-size: 11px;
  font-weight: 700;
  color: #4a3edf;
  opacity: 0.7;
  flex-shrink: 0;
}

@keyframes ai-status-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(100, 82, 255, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(100, 82, 255, 0); }
}
.ws-spin { animation: spin 1.4s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.ws-feed {
  flex: 1;
  overflow: auto;
  padding: 24px 20px 16px;
  min-height: 0;
}
.ws-thread {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ws-user-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 10px;
}
.ws-user-bubble {
  max-width: 75%;
  padding: 11px 14px;
  background: #f0f0f2;
  color: #0f1115;
  border-radius: 16px 16px 4px;
  font-size: 13.5px;
  line-height: 1.65;
  letter-spacing: -0.01em;
  word-break: break-word;
}

.ws-ai-wrap {
  display: flex;
  margin-bottom: 6px;
}
.ws-ai-bubble {
  max-width: 90%;
  color: #2a2d36;
  font-size: 13.5px;
  line-height: 1.55;
  letter-spacing: -0.01em;
  word-break: break-word;
  p { margin: 0 0 6px; &:last-child { margin-bottom: 0; } }
}
.ws-typing { color: #8a8f9b; font-style: italic; }

.ws-composer {
  padding: 14px 20px 18px;
  background: transparent;
  flex-shrink: 0;
}
.ws-composer-inner {
  max-width: 680px;
  margin: 0 auto;
}
.ws-input-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 9px 9px 16px;
  background: #fff;
  border: 1.5px solid #d8d8d8;
  border-radius: 16px;
  box-shadow: rgba(0, 0, 0, 0.08) 0 4px 24px, rgba(0, 0, 0, 0.04) 0 1px 4px;
  transition: border-color 0.2s, box-shadow 0.2s;
  overflow: hidden;

  &:focus-within {
    border-color: #c4b5fd;
    box-shadow: rgba(79, 70, 229, 0.1) 0 0 0 3px, rgba(0, 0, 0, 0.08) 0 4px 24px;
  }

  textarea {
    flex: 1;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 14px;
    resize: none;
    padding: 6px 0;
    outline: none;
    min-height: 22px;
    max-height: 100px;
    line-height: 1.5;
    color: #0f1115;
    height: 33px;
    &::placeholder { color: #9a9aa6; }
    &:disabled { cursor: not-allowed; opacity: 0.6; }
  }
}

.ws-send {
  width: 34px;
  height: 34px;
  border: none;
  background: #0f1115;
  color: #fff;
  border-radius: 9px;
  cursor: pointer;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.15s, opacity 0.15s;
  &:disabled { opacity: 0.45; cursor: not-allowed; }
  &:not(:disabled):hover { transform: translateY(-1px); }
}

.ws-end-row {
  margin-top: 8px;
  text-align: right;
}
.ws-end {
  padding: 0;
  border: none;
  background: transparent;
  color: #8a8f9b;
  font-size: 11.5px;
  cursor: pointer;
  letter-spacing: 0.02em;
  font-family: inherit;
  &:hover { color: #5b606a; }
}
</style>
