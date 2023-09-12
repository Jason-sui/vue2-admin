"use strict";
const routes = [
    { path: '/', component: { template: `<div>管理后台</div>` } },
    { path: '/template-page', component: () => importHtmlVue('./pages/template-page.vue') },
];
const router = new VueRouter({
    routes
});
Vue.prototype.$ELEMENT = {
    size: 'small'
};
Vue.prototype.$toast = (message, type = 'info', duration = 1500) => {
    Vue.prototype.$message({
        type,
        showClose: true,
        message,
        duration
    });
};
Vue.prototype.$alert = (error) => {
    Vue.prototype.$message({
        type: 'error',
        showClose: true,
        message: error.rawMessage || error.message || error,
        duration: 1500
    });
};
Vue.prototype.$mock_data = admin_mock_data;
Vue.prototype.$setQuery = (q, form = {}, query_data = {}) => {
    for (let key in form) {
        let value = form[key];
        if (!util.checkEmptyValue(value)) {
            if (query_data[key])
                q[query_data[key]](key, value);
            else if (key === 'user_id') {
                console.log(value);
                q.equalTo('user', lc.createObject('_User', value));
            }
            else
                q.equalTo(key, value);
        }
    }
    return q;
};
Vue.directive('copy-text', {
    bind(el, binding) {
        el.addEventListener('click', () => {
            util.copyText(binding.value, () => {
                Vue.prototype.$toast('复制成功');
            });
        });
    },
});
new Vue({
    el: '#app',
    name: 'index',
    router,
    template: "<App/>",
    components: {
        'App': () => importHtmlVue('./App.vue'),
    }
});
