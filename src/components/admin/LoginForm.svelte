<script lang="ts">
  let password = '';
  let error = '';
  let loading = false;
  
  async function handleLogin() {
    if (!password.trim()) {
      error = '请输入密码';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const response = await fetch('/api/auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_login_time', Date.now().toString());
        window.location.href = '/admin/dashboard/';
      } else {
        error = data.error || '登录失败，请检查密码';
      }
    } catch (e) {
      error = '网络错误，请稍后重试';
      console.error('Login error:', e);
    }
    
    loading = false;
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !loading) {
      handleLogin();
    }
  }
</script>

<div class="login-form">
  <div class="logo">
    <span class="icon">⚙️</span>
    <h1>后台管理</h1>
  </div>
  
  <p class="subtitle">请输入管理密码登录</p>
  
  <form on:submit|preventDefault={handleLogin}>
    <div class="input-group">
      <label for="password">密码</label>
      <input 
        id="password"
        type="password" 
        bind:value={password}
        on:keydown={handleKeydown}
        placeholder="请输入管理密码"
        disabled={loading}
        autocomplete="current-password"
      />
    </div>
    
    {#if error}
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        {error}
      </div>
    {/if}
    
    <button type="submit" disabled={loading || !password.trim()}>
      {#if loading}
        <span class="spinner"></span>
        登录中...
      {:else}
        登录
      {/if}
    </button>
  </form>
  
  <div class="footer">
    <p>Firefly Blog Admin</p>
  </div>
</div>

<style>
  .login-form {
    background: white;
    padding: 40px 30px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 100%;
  }
  
  .logo {
    text-align: center;
    margin-bottom: 30px;
  }
  
  .icon {
    font-size: 48px;
    display: block;
    margin-bottom: 10px;
  }
  
  h1 {
    font-size: 24px;
    color: #333;
    font-weight: 600;
  }
  
  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
    font-size: 14px;
  }
  
  .input-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-size: 14px;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.2s;
  }
  
  input:focus {
    outline: none;
    border-color: #667eea;
  }
  
  input:disabled {
    background: #f5f5f5;
  }
  
  .error-message {
    background: #fff3f3;
    border: 1px solid #ffcdd2;
    color: #c62828;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  
  .error-icon {
    font-size: 16px;
  }
  
  button {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .footer {
    margin-top: 30px;
    text-align: center;
    color: #999;
    font-size: 12px;
  }
</style>