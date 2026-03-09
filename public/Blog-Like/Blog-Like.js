(function(){
  var BLOG_LIKE_CONFIG = {
  "enable": true,
  "Backend": "Cloudflare",
  "CloudflareBackend": "blog-like.2220795057.workers.dev",
  "PHPBackend": "",
  "AppID": "",
  "AppKEY": "",
  "xianzhi": true,
  "number": 1,
  "GoogleAnalytics": true,
  "GAEventCategory": "Engagement",
  "GAEventAction": "Like"
};

  function showAlert(msg) {
    var alertBox = document.createElement("div");
    alertBox.innerText = msg;
    alertBox.style.position = "fixed";
    alertBox.style.top = "20%";
    alertBox.style.left = "50%";
    alertBox.style.transform = "translate(-50%, -50%)";
    alertBox.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
    alertBox.style.color = "white";
    alertBox.style.padding = "15px 30px";
    alertBox.style.borderRadius = "8px";
    alertBox.style.zIndex = "1000";
    alertBox.style.fontSize = "16px";
    alertBox.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
    document.body.appendChild(alertBox);
    setTimeout(function () {
      document.body.removeChild(alertBox);
    }, 1800);
  }
  function heartAnimation() {
    var heart = document.querySelector('.heart');
    if (!heart) return;
    heart.classList.remove('heartAnimation');
    void heart.offsetWidth;
    heart.classList.add('heartAnimation');
    setTimeout(function(){
      heart.classList.remove('heartAnimation');
    },800);
  }
  function getVisitorLikes(url) {
    var likes = getCookie("likes_" + url);
    return likes ? parseInt(likes) : 0;
  }
  function setVisitorLikes(url, likes) {
    setCookie("likes_" + url, likes, 30);
  }
  function getCookie(name) {
    var cookieArr = document.cookie.split(";");
    for (var i = 0; i < cookieArr.length; i++) {
      var cookie = cookieArr[i].trim();
      if (cookie.startsWith(name + "=")) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }
  function setCookie(name, value, days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    var expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
  function updateZanText(num) {
    var el = document.getElementById("zan_text");
    if (el) el.innerHTML = num;
  }
  function sendGAEvent() {
    if (BLOG_LIKE_CONFIG.GoogleAnalytics && typeof window.gtag === 'function') {
      gtag('event', BLOG_LIKE_CONFIG.GAEventAction || 'Like', {
        'event_category': BLOG_LIKE_CONFIG.GAEventCategory || 'Engagement',
        'event_label': window.url
      });
    }
  }
  

  function mainCloudflare() {
    var BLOG_LIKE_CONFIG = {
  "enable": true,
  "Backend": "Cloudflare",
  "CloudflareBackend": "blog-like.2220795057.workers.dev",
  "PHPBackend": "",
  "AppID": "",
  "AppKEY": "",
  "xianzhi": true,
  "number": 1,
  "GoogleAnalytics": true,
  "GAEventCategory": "Engagement",
  "GAEventAction": "Like"
};
    var url = location.host + location.pathname;
    var flag = 0;
    window.flag = 0;
    window.url = url;

    function getCloudflareApiUrl() {
      if (!BLOG_LIKE_CONFIG.CloudflareBackend) return null;
      var backend = BLOG_LIKE_CONFIG.CloudflareBackend.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return 'https://' + backend + '/like';
    }

    function cloudflareLike(flag) {
      var apiUrl = getCloudflareApiUrl();
      if (!apiUrl) {
        showAlert("Cloudflare Workers 后端未配置");
        console.error('Cloudflare后端地址未配置！');
        return;
      }

      var bodyData = {
        Url: url,
        Add: flag ? 1 : 0
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      })
      .then(function(resp){
        if (resp.status === 429) {
          showAlert("您已达到速率限制");
          throw new Error("429");
        }
        return resp.json();
      })
      .then(function(d){
        if (typeof d['likes'] !== "undefined") {
          updateZanText(d['likes']);
          if(flag) {
            var currentLikes = getVisitorLikes(url);
            setVisitorLikes(url, currentLikes + 1);
            showAlert("点赞成功");
          }
        } else {
          showAlert("获取点赞数失败");
        }
      })
      .catch(function(e){
        if(e && e.message === "429") return;
        showAlert("后端请求失败, 请检查Cloudflare配置");
        console.error("Cloudflare 请求失败：", e);
      });
    }

    function likeBackend(flag) {
      cloudflareLike(flag);
    }

    window.goodplus = function(u, f) {
      if(BLOG_LIKE_CONFIG.xianzhi) {
        var currentLikes = getVisitorLikes(url);
        if (currentLikes >= BLOG_LIKE_CONFIG.number) {
          showAlert("最多只能点 " + BLOG_LIKE_CONFIG.number + " 个赞");
          return;
        }
      }
      sendGAEvent();
      likeBackend(true);
      heartAnimation();
    };

    document.addEventListener('DOMContentLoaded', function() {
      likeBackend(false);
    });
  }
  
  mainCloudflare();
})();
