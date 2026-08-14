/*
 * Cookie 同意与广告加载（合规：GDPR / ePrivacy）
 * - 首次访问弹出横幅，区分「必要 Cookie」与「广告 Cookie」
 * - 仅在用户「接受全部」后，才动态加载 Google AdSense 广告脚本
 * - 拒绝则只保留必要功能，不加载任何广告/追踪脚本
 * - 状态保存在 localStorage，用户可通过页脚「Cookie 设置」重新选择
 *
 * 接入 AdSense 时请修改下方 ADSENSE_PUB_ID 为你自己的发布商 ID
 * （形如 ca-pub-xxxxxxxxxxxxxxxx）。保留占位值时不会加载广告。
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'etm_cookie_consent';
  var ADSENSE_PUB_ID = 'ca-pub-0000000000000000'; // TODO: 替换为你的 Google AdSense 发布商 ID
  var GA_MEASUREMENT_ID = 'G-VJLJ6NM3G4'; // Google Analytics 4 衡量 ID（替换为你自己的）

  function basePath() {
    return location.pathname.indexOf('/blog/') !== -1 ? '../' : '';
  }

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
  }

  function loadAdSense() {
    if (!ADSENSE_PUB_ID || ADSENSE_PUB_ID.indexOf('0000000000000000') !== -1) return;
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
      encodeURIComponent(ADSENSE_PUB_ID);
    document.head.appendChild(s);
    s.addEventListener('load', function () {
      var ins = document.querySelectorAll('ins.adsbygoogle');
      for (var i = 0; i < ins.length; i++) {
        if (!ins[i].dataset.adInitialized) {
          ins[i].dataset.adInitialized = '1';
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    });
  }

  function loadAnalytics() {
    if (!GA_MEASUREMENT_ID) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' +
      encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }

  function showBanner() {
    var b = document.getElementById('cc-banner');
    if (!b) buildBanner();
    b = document.getElementById('cc-banner');
    if (b) b.hidden = false;
  }
  function hideBanner() {
    var b = document.getElementById('cc-banner');
    if (b) b.hidden = true;
  }

  function buildBanner() {
    var base = basePath();
    var b = document.createElement('div');
    b.id = 'cc-banner';
    b.className = 'cc-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookie 同意');
    b.innerHTML =
      '<p class="cc-text">为保障本网站的正常运行并持续优化您的访问体验，我们使用 Cookie。' +
      '其中<strong>必要的 Cookie</strong>为网站功能所必需；<strong>其他 Cookie</strong>仅会在获得您的同意后启用。' +
      '了解更多信息，请查阅我们的<a href="' + base + 'privacy.html">隐私政策</a>。</p>' +
      '<div class="cc-actions">' +
      '<button type="button" class="cc-btn" id="cc-reject">仅必要</button>' +
      '<button type="button" class="cc-btn primary" id="cc-accept">接受全部</button>' +
      '</div>';
    document.body.appendChild(b);
    document.getElementById('cc-accept').addEventListener('click', function () {
      setConsent('accepted'); hideBanner(); loadAnalytics(); loadAdSense();
    });
    document.getElementById('cc-reject').addEventListener('click', function () {
      setConsent('rejected'); hideBanner();
    });
  }

  function init() {
    var c = getConsent();
    if (c === 'accepted') {
      loadAnalytics(); loadAdSense();
    } else if (c !== 'rejected') {
      buildBanner();
    }
    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'cc-manage') {
        e.preventDefault();
        showBanner();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
