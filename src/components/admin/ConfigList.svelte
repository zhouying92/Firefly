<script lang="ts">
  import { onMount } from 'svelte';
  
  interface ConfigItem {
    name: string;
    label: string;
    file: string;
    description?: string;
  }
  
  let configs: ConfigItem[] = [];
  let loading = true;
  let error = '';
  
  onMount(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/';
      return;
    }
    
    try {
      const response = await fetch('/api/config/list/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('获取配置列表失败');
      }
      
      const data = await response.json();
      configs = data.configs || [];
    } catch (e) {
      error = '加载失败，请刷新页面重试';
      console.error('Load configs error:', e);
    }
    
    loading = false;
  });
</script>

{#if loading}
  <div class="loading">
    <div class="spinner"></div>
    <p>加载配置列表...</p>
  </div>
{:else if error}
  <div class="error">
    <p>{error}</p>
    <button onclick={() => window.location.reload()}>刷新页面</button>
  </div>
{:else}
  <div class="config-grid">
    {#each configs as config}
      <a href="/admin/edit/{config.name}/" class="config-card">
        <div class="card-header">
          <span class="card-icon">📝</span>
          <h3>{config.label}</h3>
        </div>
        <p class="card-name">{config.name}.json</p>
        {#if config.description}
          <p class="card-desc">{config.description}</p>
        {/if}
        <div class="card-action">
          <span>点击编辑 →</span>
        </div>
      </a>
    {/each}
  </div>
{/if}

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
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
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error {
    text-align: center;
    padding: 40px;
    color: #c62828;
  }
  
  .error button {
    margin-top: 20px;
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .config-card {
    display: block;
    padding: 24px;
    background: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
  }
  
  .config-card:hover {
    border-color: #667eea;
    background: white;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .card-icon {
    font-size: 24px;
  }
  
  h3 {
    font-size: 18px;
    color: #333;
    font-weight: 600;
  }
  
  .card-name {
    font-size: 13px;
    color: #999;
    margin-bottom: 8px;
  }
  
  .card-desc {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    line-height: 1.5;
  }
  
  .card-action {
    font-size: 14px;
    color: #667eea;
    font-weight: 500;
  }
</style>