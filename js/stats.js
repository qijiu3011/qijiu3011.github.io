document.addEventListener('DOMContentLoaded', function() {
    const workerUrl = 'https://blog-like.2220795057.workers.dev';
    
    // 判断当前页面是否是文章页
    const isPostPage = window.location.pathname.includes('/20') || 
                       window.location.pathname.includes('/post') ||
                       (window.location.pathname !== '/' && 
                        !window.location.pathname.startsWith('/page') &&
                        window.location.pathname.split('/').length > 2);
    
    // ===== 加载所有统计数据 =====
    async function loadAllStats() {
        // 加载阅读数
        const viewSpans = document.querySelectorAll('.view-count');
        for (const span of viewSpans) {
            const url = span.dataset.url;
            if (!url) continue;
            try {
                const response = await fetch(`${workerUrl}/views?url=${encodeURIComponent(url)}`);
                const data = await response.json();
                if (data.views !== undefined) {
                    span.textContent = data.views;
                }
            } catch (error) {
                console.error('加载阅读数失败:', error);
            }
        }
        
        // 加载点赞数
        const likeSpans = document.querySelectorAll('.like-count');
        for (const span of likeSpans) {
            const card = span.closest('[data-url]') || span.closest('.like-meta, .like-display');
            const url = card?.dataset?.url;
            if (!url) continue;
            
            try {
                const response = await fetch(`${workerUrl}/like?url=${encodeURIComponent(url)}`);
                const data = await response.json();
                if (data.likes !== undefined) {
                    span.textContent = data.likes;
                }
            } catch (error) {
                console.error('加载点赞数失败:', error);
            }
        }
    }

    // ===== 点赞功能（仅在文章页生效）=====
    if (isPostPage) {
        document.querySelectorAll('.like-meta').forEach(btn => {
            const url = btn.dataset.url;
            const countSpan = btn.querySelector('.like-count');
            const icon = btn.querySelector('span:first-child, i');
            
            if (!url || !countSpan) return;
            
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                
                // 发送点赞请求
                try {
                    const response = await fetch(`${workerUrl}/like`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ Url: url, Add: 1 })
                    });
                    const data = await response.json();
                    if (data.likes !== undefined) {
                        countSpan.textContent = data.likes;
                    }
                } catch (error) {
                    console.error('点赞失败:', error);
                }
            });
        });
    } else {
        // 如果是首页，禁用所有点赞按钮的点击
        document.querySelectorAll('.like-meta').forEach(btn => {
            btn.style.pointerEvents = 'none';
        });
    }

    // 页面加载后获取所有统计数据
    loadAllStats();
});