document.addEventListener('DOMContentLoaded', function() {
    const workerUrl = 'https://blog-like.2220795057.workers.dev'; // 你的Worker地址

    // 判断当前页面是否是文章页（根据你的 URL 结构调整）
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
                // 使用 GET 请求获取点赞数
                const response = await fetch(`${workerUrl}/like?url=${encodeURIComponent(url)}`);
                const data = await response.json();
                if (data.likes !== undefined) {
                    span.textContent = data.likes;
                }

                // 检查 Cookie 是否已点赞
                const cookieKey = `liked_${btoa(url)}`;
                const hasLiked = document.cookie.split('; ').some(row => row.startsWith(cookieKey + '='));

                if (hasLiked) {
                    const icon = card.querySelector('span:first-child, i');
                    if (icon) icon.style.color = '#ff6b6b'; // 变红
                    const btn = card.closest('.like-meta');
                    if (btn && isPostPage) {
                        btn.style.pointerEvents = 'none'; // 禁用点击
                    }
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

            if (!url || !countSpan || !icon) return;

            // 检查是否已点赞
            const cookieKey = `liked_${btoa(url)}`;
            const hasLiked = document.cookie.split('; ').some(row => row.startsWith(cookieKey + '='));

            if (hasLiked) {
                icon.style.color = '#ff6b6b';
                btn.style.pointerEvents = 'none';
                return;
            }

            btn.addEventListener('click', async function(e) {
                e.preventDefault();

                // 再次检查（防止快速双击）
                if (document.cookie.split('; ').some(row => row.startsWith(cookieKey + '='))) {
                    alert('你已经点过赞啦～');
                    return;
                }

                try {
                    const response = await fetch(`${workerUrl}/like`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ Url: url, Add: 1 })
                    });
                    const data = await response.json();
                    if (data.likes !== undefined) {
                        countSpan.textContent = data.likes;
                        icon.style.color = '#ff6b6b';
                        document.cookie = `${cookieKey}=1; max-age=2592000; path=/`;
                        btn.style.pointerEvents = 'none';
                    }
                } catch (error) {
                    console.error('点赞失败:', error);
                }
            });
        });
    } else {
        // 首页禁用点赞按钮点击
        document.querySelectorAll('.like-meta').forEach(btn => {
            btn.style.pointerEvents = 'none';
        });
    }

    // 页面加载后获取所有统计数据
    loadAllStats();
});