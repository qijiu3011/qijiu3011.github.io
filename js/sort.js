// 文章排序功能（按时间、点赞数）
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('#board .container > .row > .col-12.col-md-10.m-auto');
    const articles = Array.from(document.querySelectorAll('.row.mx-auto.index-card'));

    if (!container || articles.length === 0) return;

    // 创建排序按钮容器
    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-container';
    sortContainer.innerHTML = `
        <div class="sort-buttons">
            <button class="sort-btn active" data-sort="date" data-order="desc">时间 ↓</button>
            <button class="sort-btn" data-sort="date" data-order="asc">时间 ↑</button>
            <button class="sort-btn" data-sort="likes" data-order="desc">点赞 ↓</button>
            <button class="sort-btn" data-sort="likes" data-order="asc">点赞 ↑</button>
        </div>
    `;

    container.parentNode.insertBefore(sortContainer, container);

    let currentSort = 'date';
    let currentOrder = 'desc';

    // 排序函数
    function sortArticles(sortBy, order) {
        const sortedArticles = [...articles].sort((a, b) => {
            let valA, valB;

            if (sortBy === 'date') {
                // 获取日期
                const dateA = a.querySelector('time')?.getAttribute('datetime') || '0';
                const dateB = b.querySelector('time')?.getAttribute('datetime') || '0';
                valA = new Date(dateA).getTime();
                valB = new Date(dateB).getTime();
            } else {
                // 获取点赞数（从 .like-count 中读取）
                const likesA = a.querySelector('.like-count')?.textContent;
                const likesB = b.querySelector('.like-count')?.textContent;
                valA = likesA ? parseInt(likesA) : 0;
                valB = likesB ? parseInt(likesB) : 0;
            }

            if (order === 'desc') {
                return valB - valA;
            } else {
                return valA - valB;
            }
        });

        // 重新排列 DOM
        sortedArticles.forEach(article => {
            container.appendChild(article);
        });

        // 更新按钮状态
        document.querySelectorAll('.sort-btn').forEach(btn => {
            const btnSort = btn.dataset.sort;
            const btnOrder = btn.dataset.order;
            if (btnSort === sortBy && btnOrder === order) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 绑定点击事件
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sortBy = this.dataset.sort;
            const order = this.dataset.order;
            currentSort = sortBy;
            currentOrder = order;
            sortArticles(sortBy, order);
        });
    });

    // 初始化排序（默认为时间降序）
    sortArticles('date', 'desc');
});