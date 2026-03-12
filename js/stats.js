document.addEventListener('DOMContentLoaded', function() {
    const workerUrl = 'https://blog-like.2220795057.workers.dev'; // 你的Worker地址
    const twikooEnvId = 'https://twikoo-peach-iota.vercel.app';   // 你的Twikoo环境ID

    // 判断当前页面是否是文章页
    const isPostPage = window.location.pathname.includes('/20') || 
                       window.location.pathname.includes('/post') ||
                       (window.location.pathname !== '/' && 
                        !window.location.pathname.startsWith('/page') &&
                        window.location.pathname.split('/').length > 2);

    // ===== 加载点赞数 =====
    async function loadLikeCounts() {
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

                // 检查 Cookie 是否已点赞
                const cookieKey = `liked_${btoa(url)}`;
                const hasLiked = document.cookie.split('; ').some(row => row.startsWith(cookieKey + '='));

                if (hasLiked) {
                    const icon = card.querySelector('span:first-child, i');
                    if (icon) icon.style.color = '#ff6b6b';
                    const btn = card.closest('.like-meta');
                    if (btn && isPostPage) {
                        btn.style.pointerEvents = 'none';
                    }
                }
            } catch (error) {
                console.error('加载点赞数失败:', error);
            }
        }
    }

    // ===== 加载评论数 =====
    function loadCommentCounts() {
        const commentMetas = document.querySelectorAll('.comment-meta');
        if (!commentMetas.length) return;

        // 确保 Twikoo 脚本已加载
        if (typeof twikoo === 'undefined') {
            console.log('Twikoo 未就绪，500ms后重试');
            setTimeout(loadCommentCounts, 500);
            return;
        }

        commentMetas.forEach(meta => {
            const url = meta.dataset.url;
            const countSpan = meta.querySelector('.comment-count');
            if (!url || !countSpan) return;

            twikoo.getCount({
                envId: twikooEnvId,
                url: url
            }).then(res => {
                countSpan.textContent = res.count || 0;
            }).catch(err => {
                console.error('获取评论数失败:', err, url);
                countSpan.textContent = '0';
            });
        });
    }

    // ===== 点赞功能（仅在文章页生效）=====
    if (isPostPage) {
        document.querySelectorAll('.like-meta').forEach(btn => {
            const url = btn.dataset.url;
            const countSpan = btn.querySelector('.like-count');
            const icon = btn.querySelector('span:first-child, i');

            if (!url || !countSpan || !icon) return;

            const cookieKey = `liked_${btoa(url)}`;
            const hasLiked = document.cookie.split('; ').some(row => row.startsWith(cookieKey + '='));

            if (hasLiked) {
                icon.style.color = '#ff6b6b';
                btn.style.pointerEvents = 'none';
                return;
            }

            btn.addEventListener('click', async function(e) {
                e.preventDefault();

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

    // 加载点赞数和评论数
    loadLikeCounts();
    loadCommentCounts();
});