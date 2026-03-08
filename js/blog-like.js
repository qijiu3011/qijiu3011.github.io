document.addEventListener('DOMContentLoaded', function() {
    const workerUrl = 'https://blog-like.2220795057.workers.dev/like'; // 你的Worker地址

    // 绑定所有点赞按钮
    document.querySelectorAll('.like-meta').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.dataset.url;   // 文章链接
            const countSpan = this.querySelector('.like-count');
            const currentLikes = parseInt(countSpan.textContent) || 0;

            // 发送 POST 请求
            fetch(workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Url: url, Add: 1 })
            })
            .then(response => response.json())
            .then(data => {
                if (data.likes !== undefined) {
                    countSpan.textContent = data.likes;
                }
            })
            .catch(error => console.error('点赞失败:', error));
        });
    });
});