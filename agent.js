(function () {
  var chatWidget = document.getElementById('chatWidget');
  var launcher = document.getElementById('chatLauncher');
  var panel = document.getElementById('chatPanel');
  var messages = document.getElementById('chatMessages');
  var quick = document.getElementById('chatQuick');
  var composer = document.getElementById('chatComposer');
  var closeButton = document.getElementById('chatClose');
  var input = document.getElementById('chatInput');
  var sendButton = document.getElementById('chatSend');
  var welcomeContent = '你好，我是雷敏捷的 AI 简历助手（Resume Agent）。我可以帮你快速了解雷敏捷的技术栈、工作经历、项目经验、教育背景与联系方式，方便你准备面试或 HR 筛选。可以直接输入问题，也可以点击下方推荐问题快速开始。';
  var defaultQuick = ['介绍一下雷敏捷', '他的技术栈有多深', '他有重要项目吗', '如何联系雷敏捷', '他的工作经历', '教育背景', '会做前端吗', '期望薪资？'];
  var welcomeEntry = { id: 'welcome', role: 'assistant', intent: 'welcome', content: welcomeContent, suggestions: defaultQuick };
  var state = { messages: [welcomeEntry], quick: defaultQuick, nextId: 1 };
  var typingTimer = null;
  var knowledge = [
    { id: 'intro', intent: 'intro', keywords: ['介绍', '自我', '评价', '背景', 'about', 'who', 'who', '介绍一下'], content: '雷敏捷是资深 Java 开发工程师，拥有 10 年互联网研发经验，目前就职于深圳的租赁科技公司，负责系统架构设计、核心开发、性能优化与交付。他熟悉 Java / Go / PHP，擅长 Spring Cloud 微服务、高并发资金业务与系统稳定性建设。', suggestions: ['他的技术栈有多深', '他有重要项目吗', '如何联系雷敏捷', '他的工作经历'] },
    { id: 'skill', intent: 'skill', keywords: ['技术栈', '技术', '栈', 'skill', 'java', 'spring', 'mysql', 'redis', 'mongodb', 'oracle', 'mongo'], content: '雷敏捷的技术栈较深：后端主线是 Java（Spring Boot / Spring Cloud / MyBatis / MyBatis-Plus），数据库使用 MySQL / Oracle / MongoDB，中间件涵盖 Redis / RabbitMQ / Elasticsearch / ActiveMQ；前端掌握 Vue / Angular / Layui，也具备 JavaScript 基础；运维熟悉 Git / Maven / Jenkins / Docker / Nginx / Linux。', suggestions: ['他有重要项目吗', '他的工作经历', '如何联系雷敏捷'] },
    { id: 'project', intent: 'project', keywords: ['项目', 'project', '经历', '工作', 'exp', '公司', '租赁', '金融', '微服务'], content: '雷敏捷有 7 个完整项目经历，主要集中在租赁与金融领域，包括：俏租机租赁平台（微服务 + E 签宝 + 支付 + 多资方资金）、南方国际租赁融资平台、京众租商户运营平台、ODR 在线综合调解平台、科技法庭庭审系统、鸡毛信 P2P 信贷系统、众乐乐催收系统。', suggestions: ['他的技术栈有多深', '他的工作经历', '如何联系雷敏捷'] },
    { id: 'experience', intent: 'experience', keywords: ['经历', '工作', '公司', 'exp', '开发'], content: '雷敏捷的工作经历覆盖多家公司：2015 至 2026 年先后在长沙五拓、深圳小贷、众乐乐、深圳传奇、深圳天道，以及目前的深圳租享生活从事后端研发、架构设计、项目交付与性能优化。', suggestions: ['介绍一下雷敏捷', '他的技术栈有多深', '如何联系雷敏捷'] },
    { id: 'edu', intent: 'edu', keywords: ['教育', '学校', '毕业', 'edu', '本科', '大学'], content: '教育背景为湖南交通工程学院，2011.09 - 2014.06，取得本科学历。', suggestions: ['介绍一下雷敏捷', '他的工作经历', '如何联系雷敏捷'] },
    { id: 'contact', intent: 'contact', keywords: ['联系', '电话', '手机', '邮箱', 'email', '微信', '微信号', 'contact', '电话号码', '怎么联系'], content: '联系方式：手机号 18850588930，邮箱 724216531@qq.com，现居住深圳。', suggestions: ['如何联系雷敏捷', '他的技术栈有多深', '介绍一下雷敏捷'] },
    { id: 'salary', intent: 'salary', keywords: ['薪资', '工资', '期望', '多少钱', '薪水', 'salary', 'offer', '待遇'], content: '关于雷敏捷的期望薪资，当前简历未填写，建议直接通过联系方式与他本人沟通。', suggestions: ['如何联系雷敏捷', '介绍一下雷敏捷'] },
    { id: 'frontend', intent: 'frontend', keywords: ['前端', 'vue', 'angular', 'layui', 'bootstrap', '前端开发', 'ui'], content: '会。他熟悉 Vue / Angular / Layui 等前端框架，也掌握前后端分离开发、RESTful API 接口调用与前端联调能力。', suggestions: ['他的技术栈有多深', '他有重要项目吗', '如何联系雷敏捷'] },
    { id: 'greeting', intent: 'greeting', keywords: ['你好', '您好', '在吗', 'hi', 'hello', '嗨'], content: '你好，很高兴为你服务。你可以问我雷敏捷的技术栈、工作经历、项目、教育背景或联系方式。', suggestions: ['介绍一下雷敏捷', '他的技术栈有多深', '他有重要项目吗', '如何联系雷敏捷'] }
  ];
  var fallbackEntry = { id: 'fallback', intent: 'fallback', content: '这个问题我还不太确定，建议你查看页面上的项目经验与工作经历，或者直接通过联系方式发起沟通。你也可以换个说法再问我。', suggestions: ['介绍一下雷敏捷', '他的技术栈有多深', '他有重要项目吗', '如何联系雷敏捷'] };
  function findEntry(text) {
    var lower = String(text || '').toLowerCase();
    var best = fallbackEntry;
    var bestScore = 0;
    knowledge.forEach(function (entry) {
      if (entry.intent === 'welcome') return;
      var score = 0;
      (entry.keywords || []).forEach(function (keyword) {
        var key = String(keyword || '').toLowerCase();
        if (!key) return;
        if (lower.indexOf(key) !== -1) {
          score += key.length >= 3 ? 2 : 1;
        }
      });
      if (lower.indexOf('雷敏捷') !== -1) score += 2;
      if (lower.indexOf('ayden') !== -1) score += 1;
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    return best;
  }
  function loadState() {
    var stored = null;
    try { var raw = window.localStorage.getItem('resume-agent-history'); if (raw) stored = JSON.parse(raw); } catch (error) { stored = null; }
    if (stored && Array.isArray(stored.messages) && stored.messages.length) {
      return { messages: stored.messages, quick: Array.isArray(stored.quick) ? stored.quick : defaultQuick, nextId: Number(stored.nextId) || 2 };
    }
    return { messages: [welcomeEntry], quick: defaultQuick, nextId: 2 };
  }
  function saveState() {
    try { window.localStorage.setItem('resume-agent-history', JSON.stringify(state)); } catch (error) { /* ignore */ }
  }
  function messageElement(role, content, id, intent, suggestions) {
    var article = document.createElement('article');
    article.className = 'chat-widget__message chat-widget__message--' + role;
    var paragraph = document.createElement('p');
    if (role === 'assistant') { paragraph.innerHTML = content; } else { paragraph.textContent = content; }
    article.appendChild(paragraph);
    if (role === 'assistant') {
      var actions = document.createElement('div');
      actions.className = 'chat-widget__message-actions';
      (suggestions || []).forEach(function (text) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'chat-widget__quick-button';
        button.textContent = text;
        button.addEventListener('click', function () { sendMessage(text); });
        actions.appendChild(button);
      });
      article.appendChild(actions);
    }
    return article;
  }
  function renderMessages() {
    if (!messages) return;
    messages.innerHTML = '';
    state.messages.forEach(function (entry) { messages.appendChild(messageElement(entry.role, entry.content, entry.id, entry.intent, entry.suggestions)); });
  }
  function setQuick(items) {
    if (!quick) return;
    quick.innerHTML = '';
    (items || []).forEach(function (text) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.addEventListener('click', function () { sendMessage(text); });
      quick.appendChild(button);
    });
  }
  function pushAssistant(entry) {
    state.messages.push(entry);
    if (state.messages.length > 24) state.messages.splice(0, state.messages.length - 24);
    state.quick = entry.suggestions || defaultQuick;
    renderMessages();
    setQuick(state.quick);
    saveState();
    scrollToBottom();
  }
  function scrollToBottom() {
    if (!messages) return;
    messages.scrollTop = messages.scrollHeight;
  }
  function showTyping() {
    if (!messages) return;
    var typing = document.createElement('div');
    typing.className = 'chat-widget__typing';
    typing.setAttribute('aria-live', 'polite');
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    saveState();
    scrollToBottom();
  }
  function hideTyping() {
    var typing = messages ? messages.querySelector('.chat-widget__typing') : null;
    if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
  }
  function sendMessage(text) {
    var question = String(text || '').trim();
    if (!question || !messages) return;
    var userEntry = { id: 'u' + state.nextId, role: 'user', content: question, intent: 'user' };
    state.nextId += 1;
    state.messages.push(userEntry);
    renderMessages();
    saveState();
    scrollToBottom();
    var answerEntry = findEntry(question);
    showTyping();
    var delay = Math.min(1400, 550 + answerEntry.content.length * 0.008);
    typingTimer = window.setTimeout(function () {
      hideTyping();
      var reply = { id: 'a' + state.nextId, role: 'assistant', intent: answerEntry.intent, content: answerEntry.content, suggestions: answerEntry.suggestions };
      state.nextId += 1;
      pushAssistant(reply);
    }, delay);
  }
  function init() {
    if (!chatWidget || !panel) return;
    renderMessages();
    setQuick(state.quick);
    scrollToBottom();
    function setOpen(value) {
      chatWidget.setAttribute('data-open', String(value));
      if (value) document.body.classList.add('chat-open');
      else document.body.classList.remove('chat-open');
    }
    if (launcher) launcher.addEventListener('click', function () { setOpen(true); });
    if (closeButton) closeButton.addEventListener('click', function () { setOpen(false); });
    if (composer) composer.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value : '';
      if (input) input.value = '';
      sendMessage(value);
    });
    if (sendButton) sendButton.addEventListener('click', function () {
      var value = input ? input.value : '';
      if (input) input.value = '';
      sendMessage(value);
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') setOpen(false); });
    document.addEventListener('click', function (event) { if (!chatWidget.contains(event.target)) setOpen(false); });
    if (messages) messages.addEventListener('click', function (event) {
      var target = event.target;
      if (target && target.closest) {
        var button = target.closest('.chat-widget__quick-button');
        if (button) { sendMessage(button.textContent); }
      }
    });
  }
  state = loadState();
  init();
})();
