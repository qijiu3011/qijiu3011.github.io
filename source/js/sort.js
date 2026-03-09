// 文章排序功能
document.addEventListener('DOMContentLoaded', function() {
  // 获取文章列表容器和所有文章卡片
  const container = document.querySelector('#board .container > .row > .col-12.col-md-10.m-auto');
  const articles = Array.from(document.querySelectorAll('.row.mx-auto.index-card'));
  
  // 如果找不到文章，退出
  if (!container || articles.length === 0) return;
  
  // 创建排序按钮容器
  const sortContainer = document.createElement('div');
  sortContainer.className = 'sort-container';
  sortContainer.innerHTML = `
    <div class="sort-buttons">
      <button class="sort-btn active" data-sort="date" data-order="desc">时间 ↓</button>
      <button class="sort-btn" data-sort="date" data-order="asc">时间 ↑</button>
      <button class="sort-btn" data-sort="views" data-order="desc">阅读量 ↓</button>
      <button class="sort-btn" data-sort="views" data-order="asc">阅读量 ↑</button>
    </div>
  `;
  
  // 将排序按钮插入到文章列表上方
  container.parentNode.insertBefore(sortContainer, container);
  
  // 当前排序状态
  let currentSort = 'date';
  let currentOrder = 'desc';
  
  // 排序函数
  function sortArticles(sortBy, order) {
    // 克隆文章数组进行排序
    const sortedArticles = [...articles].sort((a, b) => {
      let valA, valB;
      
      if (sortBy === 'date') {
        // 获取日期
        const dateA = a.querySelector('time')?.getAttribute('datetime') || '0';
        const dateB = b.querySelector('time')?.getAttribute('datetime') || '0';
        valA = new Date(dateA).getTime();
        valB = new Date(dateB).getTime();
      } else {
        // 获取阅读数（不蒜子会在加载后替换数字）
        const viewsSpanA = a.querySelector('.icon-eye + span, .post-views, .views-count');
        const viewsSpanB = b.querySelector('.icon-eye + span, .post-views, .views-count');
        
        // 提取数字（可能包含"0"或实际数字）
        valA = viewsSpanA ? parseInt(viewsSpanA.textContent) || 0 : 0;
        valB = viewsSpanB ? parseInt(viewsSpanB.textContent) || 0 : 0;
      }
      
      // 根据升序降序返回比较结果
      if (order === 'desc') {
        return valB - valA;
      } else {
        return valA - valB;
      }
    });
    
    // 重新排列DOM中的文章
    sortedArticles.forEach(article => {
      container.appendChild(article); // appendChild会自动移动元素
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
  
  // 绑定按钮点击事件
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const sortBy = this.dataset.sort;
      const order = this.dataset.order;
      
      currentSort = sortBy;
      currentOrder = order;
      sortArticles(sortBy, order);
    });
  });
  
  // 等待不蒜子加载完成后重新排序（确保阅读数已更新）
  setTimeout(() => {
    if (currentSort === 'views') {
      sortArticles('views', currentOrder);
    }
  }, 500);
});