/*!
 * kdl-preload.js — 作品详情弹窗图片加载进度 + 零跳动占位
 * 1. 内置全站切图尺寸表：弹窗打开瞬间即为每张图写入 width/height 占位，
 *    未加载的图片也保留真实高度，彻底避免上下错位跳动。
 * 2. 显示加载进度（N / 总数 + 百分比），加载完成前锁定图片区滚动与「设计稿目录」跳转。
 * 3. 预取所有图片（绕过浏览器对滚动容器外图片的延迟加载），超时兜底自动解锁。
 * 纯外挂脚本，不侵入 React 渲染。
 */
(function () {
  'use strict';

  /* 全站图片尺寸表（构建时从线上图源实测生成，格式: 路径: [宽, 高]） */
  var DIMS = {"portfolio/ai-web-p4.jpg":[1400,12439],"portfolio/ai-web-p5.jpg":[1400,8292],"portfolio/chain-admin-1.jpg":[1400,2260],"portfolio/chain-admin-2.jpg":[1400,1849],"portfolio/chain-web-p1-1.jpg":[1400,12439],"portfolio/chain-web-p1-2.jpg":[1400,8292],"portfolio/chain-web-p1.jpg":[1400,4589],"portfolio/chain-web-p2.jpg":[1400,2994],"portfolio/chain-web-p3.jpg":[1400,3927],"portfolio/gain-ads-1.jpg":[1400,3980],"portfolio/gain-ads-2.jpg":[1400,3369],"portfolio/gain-ads-3.jpg":[1400,3369],"portfolio/gain-ads-4.jpg":[1400,3753],"portfolio/gain-ads-5.jpg":[1400,3329],"portfolio/gain-ads-6.jpg":[1400,3329],"portfolio/gain-download-1.jpg":[1400,4918],"portfolio/gain-download.jpg":[1400,2203],"portfolio/gain-fitness-app.jpg":[1400,5244],"portfolio/gain-fitness-nft.jpg":[1400,3500],"portfolio/gain-fitness.jpg":[1400,6896],"portfolio/gain-web.jpg":[1400,5418],"portfolio/moveit-beat/beat_1.jpg":[1080,608],"portfolio/moveit-beat/beat_10.jpg":[1080,743],"portfolio/moveit-beat/beat_11.jpg":[1080,706],"portfolio/moveit-beat/beat_12.jpg":[1080,701],"portfolio/moveit-beat/beat_13.jpg":[1080,835],"portfolio/moveit-beat/beat_14.jpg":[1080,834],"portfolio/moveit-beat/beat_15.jpg":[1080,643],"portfolio/moveit-beat/beat_16.jpg":[1080,644],"portfolio/moveit-beat/beat_17.jpg":[1080,999],"portfolio/moveit-beat/beat_18.jpg":[1080,823],"portfolio/moveit-beat/beat_19.jpg":[1080,929],"portfolio/moveit-beat/beat_2.jpg":[1080,789],"portfolio/moveit-beat/beat_20.jpg":[1080,360],"portfolio/moveit-beat/beat_21.jpg":[1080,400],"portfolio/moveit-beat/beat_22.jpg":[1080,380],"portfolio/moveit-beat/beat_23.jpg":[1080,897],"portfolio/moveit-beat/beat_24.jpg":[1080,656],"portfolio/moveit-beat/beat_25.jpg":[1080,678],"portfolio/moveit-beat/beat_26.jpg":[1080,849],"portfolio/moveit-beat/beat_27.jpg":[1080,284],"portfolio/moveit-beat/beat_28.jpg":[1080,703],"portfolio/moveit-beat/beat_29.jpg":[1080,703],"portfolio/moveit-beat/beat_3.jpg":[1080,861],"portfolio/moveit-beat/beat_30.jpg":[1080,632],"portfolio/moveit-beat/beat_31.jpg":[1080,961],"portfolio/moveit-beat/beat_32.jpg":[1079,714],"portfolio/moveit-beat/beat_33.jpg":[1078,1209],"portfolio/moveit-beat/beat_34.gif":[1080,1283],"portfolio/moveit-beat/beat_35.gif":[480,240],"portfolio/moveit-beat/beat_36.gif":[1080,1077],"portfolio/moveit-beat/beat_37.gif":[780,872],"portfolio/moveit-beat/beat_38.gif":[1080,1186],"portfolio/moveit-beat/beat_4.jpg":[1080,615],"portfolio/moveit-beat/beat_5.jpg":[1080,711],"portfolio/moveit-beat/beat_6.jpg":[1080,281],"portfolio/moveit-beat/beat_7.jpg":[1080,728],"portfolio/moveit-beat/beat_8.jpg":[1080,460],"portfolio/moveit-beat/beat_9.jpg":[1080,473],"portfolio/moveit-hula/hula_1.jpg":[1080,695],"portfolio/moveit-hula/hula_10.jpg":[1080,677],"portfolio/moveit-hula/hula_11.jpg":[1080,1084],"portfolio/moveit-hula/hula_12.jpg":[1080,475],"portfolio/moveit-hula/hula_13.jpg":[1080,1255],"portfolio/moveit-hula/hula_14.jpg":[1080,1194],"portfolio/moveit-hula/hula_15.jpg":[1080,671],"portfolio/moveit-hula/hula_16.jpg":[1080,1103],"portfolio/moveit-hula/hula_17.jpg":[1080,851],"portfolio/moveit-hula/hula_18.jpg":[1080,1147],"portfolio/moveit-hula/hula_19.jpg":[1080,824],"portfolio/moveit-hula/hula_2.jpg":[1080,893],"portfolio/moveit-hula/hula_20.jpg":[1080,1046],"portfolio/moveit-hula/hula_21.jpg":[1080,631],"portfolio/moveit-hula/hula_22.jpg":[1080,1052],"portfolio/moveit-hula/hula_23.jpg":[1080,682],"portfolio/moveit-hula/hula_24.jpg":[1080,1073],"portfolio/moveit-hula/hula_25.jpg":[1080,764],"portfolio/moveit-hula/hula_26.jpg":[1080,1038],"portfolio/moveit-hula/hula_27.jpg":[1080,533],"portfolio/moveit-hula/hula_28.jpg":[1080,768],"portfolio/moveit-hula/hula_29.jpg":[1080,221],"portfolio/moveit-hula/hula_3.jpg":[1080,684],"portfolio/moveit-hula/hula_30.jpg":[1080,543],"portfolio/moveit-hula/hula_31.jpg":[1080,543],"portfolio/moveit-hula/hula_32.jpg":[1080,542],"portfolio/moveit-hula/hula_33.jpg":[1080,543],"portfolio/moveit-hula/hula_34.jpg":[1080,872],"portfolio/moveit-hula/hula_35.jpg":[1080,1518],"portfolio/moveit-hula/hula_36.jpg":[1080,35],"portfolio/moveit-hula/hula_37.gif":[1080,582],"portfolio/moveit-hula/hula_38.gif":[1080,939],"portfolio/moveit-hula/hula_39.gif":[1080,648],"portfolio/moveit-hula/hula_4.jpg":[1080,805],"portfolio/moveit-hula/hula_5.jpg":[1080,598],"portfolio/moveit-hula/hula_6.jpg":[1080,930],"portfolio/moveit-hula/hula_7.jpg":[1080,824],"portfolio/moveit-hula/hula_8.jpg":[1080,783],"portfolio/moveit-hula/hula_9.jpg":[1080,808],"portfolio/moveit-punch/punch_1.jpg":[1080,1181],"portfolio/moveit-punch/punch_10.jpg":[1080,665],"portfolio/moveit-punch/punch_11.jpg":[1080,339],"portfolio/moveit-punch/punch_12.jpg":[1080,362],"portfolio/moveit-punch/punch_13.jpg":[1080,280],"portfolio/moveit-punch/punch_14.jpg":[1080,592],"portfolio/moveit-punch/punch_15.jpg":[1080,1050],"portfolio/moveit-punch/punch_16.jpg":[1080,482],"portfolio/moveit-punch/punch_17.jpg":[1080,371],"portfolio/moveit-punch/punch_18.jpg":[1080,564],"portfolio/moveit-punch/punch_19.jpg":[1080,538],"portfolio/moveit-punch/punch_2.jpg":[1080,800],"portfolio/moveit-punch/punch_20.jpg":[1080,896],"portfolio/moveit-punch/punch_21.jpg":[1080,281],"portfolio/moveit-punch/punch_22.jpg":[1080,817],"portfolio/moveit-punch/punch_23.jpg":[1080,718],"portfolio/moveit-punch/punch_24.jpg":[1080,821],"portfolio/moveit-punch/punch_25.jpg":[1080,871],"portfolio/moveit-punch/punch_26.jpg":[1080,469],"portfolio/moveit-punch/punch_27.jpg":[1080,424],"portfolio/moveit-punch/punch_28.jpg":[1080,821],"portfolio/moveit-punch/punch_29.jpg":[1080,1171],"portfolio/moveit-punch/punch_3.jpg":[1080,615],"portfolio/moveit-punch/punch_30.jpg":[1080,282],"portfolio/moveit-punch/punch_31.jpg":[1080,773],"portfolio/moveit-punch/punch_32.jpg":[1080,767],"portfolio/moveit-punch/punch_33.jpg":[1080,878],"portfolio/moveit-punch/punch_34.jpg":[1080,783],"portfolio/moveit-punch/punch_35.jpg":[1080,939],"portfolio/moveit-punch/punch_36.jpg":[1080,933],"portfolio/moveit-punch/punch_37.jpg":[1080,1028],"portfolio/moveit-punch/punch_38.jpg":[1080,828],"portfolio/moveit-punch/punch_39.jpg":[1080,763],"portfolio/moveit-punch/punch_4.jpg":[1080,722],"portfolio/moveit-punch/punch_40.gif":[500,441],"portfolio/moveit-punch/punch_41.gif":[1080,871],"portfolio/moveit-punch/punch_5.jpg":[1080,273],"portfolio/moveit-punch/punch_6.jpg":[1080,347],"portfolio/moveit-punch/punch_7.jpg":[1080,306],"portfolio/moveit-punch/punch_8.jpg":[1080,718],"portfolio/moveit-punch/punch_9.jpg":[1080,748],"portfolio/moveit-swift-gloves.webp":[1200,5220],"portfolio/nimbl3-app-main.jpg":[1400,3465],"portfolio/nimbl3-app-sport.jpg":[1400,3519],"portfolio/nimbl3-board.jpg":[1400,2925],"portfolio/nimbl3-nft.jpg":[1400,3465],"portfolio/soccern-ads-1.jpg":[1400,3774],"portfolio/soccern-ads-2.jpg":[1400,3269],"portfolio/soccern-app-club.jpg":[1400,4103],"portfolio/soccern-app-data-dark.jpg":[1400,3760],"portfolio/soccern-app-data-light.jpg":[1400,3760],"portfolio/soccern-app-features.jpg":[1400,4600],"portfolio/soccern-app-home.jpg":[1400,3949],"portfolio/soccern-app-icon.jpg":[1400,4151],"portfolio/soccern-mini-game.jpg":[1400,5681],"portfolio/soccern-nft-buy.jpg":[1400,3647],"portfolio/soccern-nft.jpg":[1400,2996],"portfolio/soccern-web-features.jpg":[1400,3730],"portfolio/soccern-web-hero.jpg":[1400,1744],"portfolio/soccern-web-presale-mobile.jpg":[1400,9653],"portfolio/soccern-web-presale.jpg":[1400,6616]};

  var STYLE = [
    '.lb-images[data-kdl-loading]{overflow:hidden!important;position:relative}',
    '.lb-images[data-kdl-loading]::before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;z-index:8;background:#0c0c0ce8;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}',
    '.lb-images[data-kdl-loading]::after{content:attr(data-kdl-text);position:absolute;z-index:9;left:50%;top:50%;transform:translate(-50%,-50%);',
    'display:block;min-width:200px;padding:20px 30px 26px;border-radius:14px;border:1px solid #2f2f2b;background-color:#141413;',
    'background-image:linear-gradient(to right,#00e5c0 0 var(--kdl-p,0%),#33332f var(--kdl-p,0%) 100%);',
    'background-repeat:no-repeat;background-position:15px calc(100% - 11px);background-size:calc(100% - 30px) 3px;',
    'box-shadow:0 16px 50px #000000a6;color:#f2f2ee;font:500 13px/1.6 "DM Sans",system-ui,-apple-system,sans-serif;',
    'letter-spacing:.06em;text-align:center;white-space:pre}',
    '.lb-images[data-kdl-loading]+.lb-text .lb-figs{pointer-events:none;opacity:.35;transition:opacity .3s}'
  ].join('');

  var TIMEOUT = 20000;

  function pathOf(src) {
    return String(src || '').replace(/^\.?\//, '');
  }
  function dimOf(src) {
    return DIMS[pathOf(src)] || null;
  }
  function reserve(img, w, h) {
    if (w && h && img.getAttribute('width') !== String(w)) {
      img.setAttribute('width', w);
      img.setAttribute('height', h);
    }
  }

  function handle(col) {
    var imgs = [].slice.call(col.querySelectorAll('.lb-figure img'));
    if (!imgs.length) return;

    var key = imgs.map(function (img) {
      return img.getAttribute('src') || '';
    }).join('|');

    /* 同一组图片只处理一次；切换项目时 src 变化会重新触发 */
    if (col.__kdlKey === key) return;
    col.__kdlKey = key;

    var total = imgs.length;
    var done = 0;
    var finished = false;

    col.scrollTop = 0;
    col.setAttribute('data-kdl-loading', '');

    function paint() {
      var p = total ? Math.round((done / total) * 100) : 0;
      col.style.setProperty('--kdl-p', p + '%');
      col.setAttribute('data-kdl-text', '图片加载中  ' + done + ' / ' + total + '\n' + p + '%');
    }

    function unlock() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      col.removeAttribute('data-kdl-loading');
      col.removeAttribute('data-kdl-text');
      col.style.removeProperty('--kdl-p');
    }

    var timer = setTimeout(unlock, TIMEOUT);
    paint();

    imgs.forEach(function (img) {
      var src = img.getAttribute('src');
      if (!src) return;

      /* 尺寸表命中：立即占位，零跳动 */
      var d = dimOf(src);
      if (d) reserve(img, d[0], d[1]);

      var probe = new Image();
      var settled = false;

      function settle() {
        if (settled) return;
        settled = true;
        if (probe.naturalWidth) reserve(img, probe.naturalWidth, probe.naturalHeight);
        done++;
        paint();
        if (done >= total) unlock();
      }

      probe.onload = settle;
      probe.onerror = settle;
      probe.src = src;

      if (probe.complete && probe.naturalWidth) settle();
    });
  }

  var pending = null;
  function scan() {
    pending = null;
    var col = document.querySelector('.lightbox .lb-images');
    if (!col) return;
    handle(col);
  }
  function schedule() {
    if (pending) return;
    pending = setTimeout(scan, 80);
  }

  var style = document.createElement('style');
  style.setAttribute('data-kdl', 'preload');
  style.textContent = STYLE;

  function mount() {
    (document.head || document.documentElement).appendChild(style);
    if (document.body) {
      new MutationObserver(schedule).observe(document.body, {
        childList: true,
        subtree: true
      });
      scan();
    } else {
      document.addEventListener('DOMContentLoaded', scan, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }

  /* 兜底：页面从往返缓存恢复时重置状态 */
  window.addEventListener('pageshow', function () {
    var col = document.querySelector('.lightbox .lb-images');
    if (col) {
      col.__kdlKey = null;
      scan();
    }
  });
})();
