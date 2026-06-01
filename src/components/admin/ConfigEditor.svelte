<script lang="ts">
  import { onMount } from 'svelte';
  
  export let configName: string;
  
  let content: any = {};
  let originalContent: any = {};
  let sha = '';
  let loading = true;
  let saving = false;
  let message = '';
  let messageType = 'info';
  let hasChanges = false;
  
  const configLabels: Record<string, string> = {
    siteConfig: '站点配置',
    profileConfig: '个人资料',
    sponsorConfig: '赞助配置',
    announcementConfig: '公告配置',
    musicConfig: '音乐播放器',
    friendsConfig: '友链配置',
    footerConfig: '页脚配置',
    navBarLinks: '导航栏链接'
  };
  
  onMount(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/';
      return;
    }
    
    try {
      const response = await fetch(`/api/config/get/?name=${configName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('获取配置失败');
      }
      
      const data = await response.json();
      content = data.content;
      originalContent = JSON.parse(JSON.stringify(data.content));
      sha = data.sha;
    } catch (e) {
      message = '加载配置失败，请返回重试';
      messageType = 'error';
      console.error('Load config error:', e);
    }
    
    loading = false;
  });
  
  function handleContentChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    try {
      content = JSON.parse(target.value);
      hasChanges = JSON.stringify(content) !== JSON.stringify(originalContent);
    } catch (e) {
      message = 'JSON 格式错误，请检查语法';
      messageType = 'error';
    }
  }
  
  async function handleSave() {
    if (!hasChanges) {
      message = '没有修改，无需保存';
      messageType = 'info';
      return;
    }
    
    saving = true;
    message = '';
    
    const token = localStorage.getItem('admin_token');
    
    try {
      const response = await fetch('/api/config/update/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          configName,
          content,
          sha
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        message = '✅ 保存成功！网站将自动重新部署，请稍候...';
        messageType = 'success';
        sha = data.content?.sha || sha;
        originalContent = JSON.parse(JSON.stringify(content));
        hasChanges = false;
      } else {
        message = data.error || '保存失败';
        messageType = 'error';
      }
    } catch (e) {
      message = '网络错误，请稍后重试';
      messageType = 'error';
      console.error('Save config error:', e);
    }
    
    saving = false;
  }
  
  function handleReset() {
    content = JSON.parse(JSON.stringify(originalContent));
    hasChanges = false;
    message = '已恢复到原始内容';
    messageType = 'info';
  }
</script>

{#if loading}
  <div class="loading">
    <div class="spinner"></div>
    <p>加载配置中...</p>
  </div>
{:else}
  <div class="editor-container">
    <div class="editor-header">
      <h2>📝 编辑 {configLabels[configName] || configName}</h2>
      {#if hasChanges}
        <span class="change-indicator">有未保存的修改</span>
      {/if}
    </div>
    
    {#if message}
      <div class="message {messageType}">
        {message}
      </div>
    {/if}
    
    <div class="editor-body">
      <div class="json-section">
        <label>JSON 配置内容：</label>
        <textarea 
          value={JSON.stringify(content, null, 2)}
          on:input={handleContentChange}
          rows="25"
          spellcheck="false"
        ></textarea>
      </div>
    </div>
    
    <div class="editor-actions">
      <button 
        class="save-btn" 
        on:click={handleSave} 
        disabled={saving || !hasChanges}
      >
        {#if saving}
          <span class="spinner-small"></span>
          保存中...
        {:else}
          💾 保存配置
        {/if}
      </button>
      
      <button 
        class="reset-btn" 
        on:click={handleReset}
        disabled={!hasChanges}
      >
        ↩️ 恢复原始
      </button>
      
      <a href="/admin/dashboard/" class="back-btn">
        返回列表
      </a>
    </div>
    
    <div class="tips">
      <p>💡 提示：保存后 GitHub 仓库会自动更新，Cloudflare Pages 会自动重新部署。</p>
      <p>⚠️ 注意：请确保 JSON 格式正确，错误的格式可能导致网站无法正常运行。</p>
    </div>
  </div>
{/if}

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 20px;
    gap: 20px;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e0e0e0;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  .spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
    margin-right: 8px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .editor-container {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .editor-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }
  
  h2 {
    font-size: 20px;
    color: #333;
  }
  
  .change-indicator {
    background: #fff3e0;
    color: #e65100;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
  }
  
  .message {
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  .message.success {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }
  
  .message.error {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }
  
  .message.info {
    background: #e3f2fd;
    color: #1565c0;
    border: 1px solid #90caf9;
  }
  
  .editor-body {
    margin-bottom: 24px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
  
  textarea {
    width: 100%;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    padding: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    resize: vertical;
    background: #fafafa;
  }
  
  textarea:focus {
    outline: none;
    border-color: #667eea;
    background: white;
  }
  
  .editor-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .save-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s;
  }
  
  .save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  
  .save-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
  
  .reset-btn {
    padding: 12px 24px;
    background: #f5f5f5;
    color: #666;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
  }
  
  .reset-btn:hover:not(:disabled) {
    background: #e0e0e0;
  }
  
  .reset-btn:disabled {
    color: #999;
    cursor: not-allowed;
  }
  
  .back-btn {
    padding: 12px 24px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    text-decoration: none;
    color: #666;
    font-size: 14px;
  }
  
  .back-btn:hover {
    background: #f5f5f5;
  }
  
  .tips {
    margin-top: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 13px;
    color: #666;
    line-height: 1.8;
  }
</style>