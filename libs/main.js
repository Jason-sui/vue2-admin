"use strict";
if (location.protocol === 'http:' && location.hostname.includes('kvker.com')) {
    location.replace(location.href.replace('http:', 'https:'));
}
console.log("%c欢迎使用一步AI，如果使用有问题，请联系开发者团队：develop@kvker.com。", "color: blue; font-size: 20px; font-weight: bold;");
class Util {
    constructor() {
        this.integration_data_storage = {};
        this.cache = {};
        this.platform = { is_dev: false, is_pc: true, is_wap: false, is_app: false, is_android: false, is_ios: false, is_wx: false, is_qw: false };
        let is_dev = !location.hostname.indexOf('localhost') || !location.hostname.indexOf('127.0.0.1') || !location.hostname.indexOf('192.168') || !location.hostname.indexOf('stg-') || !location.hostname.indexOf('m-dev');
        // 手动强制设置dev
        // is_dev = true
        this.platform.is_dev = is_dev;
        this.platform.is_wap = this.screen.width <= 768;
        this.platform.is_pc = !this.platform.is_wap;
        this.platform.is_app = navigator.userAgent.includes('Html5PlusAPP');
        let ua = navigator.userAgent.toLowerCase();
        this.platform.is_android = /(android|adr)/i.test(ua);
        this.platform.is_ios = /(iPhone|iPod|iPad|IOS)/i.test(ua);
        this.platform.is_wx = /micromessenger/i.test(ua);
        this.platform.is_qw = /wxwork/i.test(ua);
        console.log(this.platform);
        window.addEventListener('resize', () => {
            this.platform.is_wap = this.screen.width <= 768;
            this.platform.is_pc = !this.platform.is_wap;
        });
    }
    set md(value) {
        this._md = value;
    }
    get md() {
        if (this._md)
            return this._md;
        else
            return this._md = markdownit();
    }
    get screen() {
        if (this._screen)
            return this._screen;
        else
            return this._screen = { width: window.innerWidth, height: window.innerHeight };
    }
    $(selector) {
        return document.querySelector(selector);
    }
    $$(selector) {
        return document.querySelectorAll(selector);
    }
    //获取地址栏参数，name:参数名称
    getUrlParms(name) {
        let url = window.location.href; //获取请求进来的完整url
        let tstr = url.substring(url.indexOf('?') + 1).split('&'); //先截取url的?后面的参数部分，在根据&分割成参数数组
        let result = {};
        tstr.forEach((item) => {
            let res = item.split('='); //res为type,my-component1.vue。  res[0]为type，res[1为]my-component1.vue
            result[res[0]] = res[1]; //构造成键值对形式 res[0]为键，res[1]为值 例：type: "my-component1.vue" 
        });
        return result[name]; //通过键取值
    }
    errorMessage(error) {
        return error.message;
    }
    sleep(time = 10000) {
        return new Promise(s => {
            setTimeout(() => {
                s({ is_sleep: time });
            }, time);
        });
    }
    copyText(text, success) {
        if (navigator.clipboard) {
            console.log('copy navigator.clipboard');
            navigator.clipboard.writeText(text)
                .then(ret => {
                if (success) {
                    success();
                }
                else {
                    ui.toast('拷贝成功');
                }
            }).catch((error) => {
                console.log('copy error');
                console.error(error);
                console.log('copy input: ' + copyTextToClipboard(text));
                if (success) {
                    success();
                }
                else {
                    ui.toast('拷贝成功');
                }
            });
        }
        else {
            console.log('copy input: ' + copyTextToClipboard(text));
            if (success) {
                success();
            }
            else {
                ui.toast('拷贝成功');
            }
        }
        function copyTextToClipboard(text, { target = document.body } = {}) {
            if (typeof text !== 'string') {
                throw new TypeError(`Expected parameter \`text\` to be a \`string\`, got \`${typeof text}\`.`);
            }
            const element = document.createElement('textarea');
            const previouslyFocusedElement = document.activeElement;
            element.value = text;
            // Prevent keyboard from showing on mobile
            element.setAttribute('readonly', '');
            element.style.contain = 'strict';
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.fontSize = '12pt'; // Prevent zooming on iOS
            const selection = document.getSelection();
            const originalRange = selection.rangeCount > 0 && selection.getRangeAt(0);
            target.append(element);
            element.select();
            // Explicit selection workaround for iOS
            element.selectionStart = 0;
            element.selectionEnd = text.length;
            let isSuccess = false;
            try {
                isSuccess = document.execCommand('copy');
            }
            catch (_a) { }
            element.remove();
            if (originalRange) {
                selection.removeAllRanges();
                selection.addRange(originalRange);
            }
            // Get the focus back on the previously focused element, if any
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus();
            }
            return isSuccess;
        }
    }
    handlePhone(phone_number) {
        if (!phone_number)
            return '';
        const regex = /^(\d{3})(\d{4})(\d{4})$/;
        return phone_number.replace(regex, '$1 $2 $3');
    }
    containsChinese(str) {
        const reg = /[\u4e00-\u9fa5]/gm;
        return reg.test(str);
    }
    downloadImg(url, file_name = '') {
        let image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
        return new Promise((resolve, reject) => {
            image.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, image.width, image.height);
                let ext = image.src.substring(image.src.lastIndexOf('.') + 1).toLowerCase();
                let dataURL = canvas.toDataURL('image/' + ext);
                let a = document.createElement('a');
                a.download = (file_name || 'download') + '.' + ext;
                a.href = dataURL;
                a.click();
                a.remove();
                resolve('');
            };
        });
    }
    downloadBlobUrl(blob_url, filename = '') {
        const downloadLink = document.createElement('a');
        downloadLink.href = blob_url;
        downloadLink.download = filename;
        // 将链接添加到 DOM 中
        document.body.appendChild(downloadLink);
        // 模拟点击链接以触发下载
        downloadLink.click();
        // 清理临时链接
        URL.revokeObjectURL(blob_url);
    }
    uploadBlob(blob_url, filename) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = (event) => {
                const base64 = event.target.result;
                lc.upload(base64, filename)
                    .then((res) => {
                    resolve(res);
                })
                    .catch((err) => {
                    reject(err);
                });
            };
            reader.readAsDataURL(blob_url);
        });
    }
    //判断用户是否登录
    isUserLogin() {
        let user_info = lc.currentUser();
        return user_info && user_info.isAnonymous && !(user_info.isAnonymous());
    }
    //判断是否为会员
    isVIP() {
        let lc_user = lc.currentUser();
        if (!lc_user)
            return false;
        let current_time = new Date().getTime();
        let userinfo = lc_user.toJSON();
        return userinfo && userinfo.vip && (userinfo.vip_expired_time > current_time);
    }
    //日期转换
    formatTime(number, format) {
        var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
        var returnArr = [];
        // var date = new Date(number * 1000);//时间戳为10位
        var date = new Date(number); //时间戳为13位
        returnArr.push(date.getFullYear());
        returnArr.push(formatNumber(date.getMonth() + 1));
        returnArr.push(formatNumber(date.getDate()));
        returnArr.push(formatNumber(date.getHours()));
        returnArr.push(formatNumber(date.getMinutes()));
        returnArr.push(formatNumber(date.getSeconds()));
        for (var i in returnArr) {
            format = format.replace(formateArr[i], returnArr[i]);
        }
        return format;
    }
    //更新用户信息
    updateUserInfoPublic(cb) {
        if (!lc.currentUser()) {
            let anonymously_username = localStorage.getItem('anonymously_username');
            if (window.is_dev && !anonymously_username) {
                anonymously_username = 'mtsuox2ivdohoxiw4rwfgt31p';
            }
            if (!anonymously_username) {
                lc.AV.User.loginAnonymously().then((user) => {
                    // 登录一个匿名用户,并保存在手机缓存里
                    localStorage.setItem('anonymously_username', user.get('username'));
                    user.setPassword("cat!@#123");
                    user.set("login_platform", 'WEB');
                    return user.save();
                })
                    .then((user) => {
                    console.log(user);
                    cb && cb();
                });
            }
            else {
                lc.login(anonymously_username, "cat!@#123")
                    .then(() => {
                    cb && cb();
                })
                    .catch((err) => {
                    console.log(err);
                    lc.AV.User.loginAnonymously().then((user) => {
                        // 登录一个匿名用户,并保存在手机缓存里
                        localStorage.setItem('anonymously_username', user.get('username'));
                        user.setPassword("cat!@#123");
                        return user.save();
                    })
                        .then((user) => {
                        console.log(user);
                        cb && cb();
                    });
                });
            }
        }
        else {
            let session_token = lc.currentUser() && lc.currentUser().getSessionToken();
            lc.AV.User.become(session_token)
                .then(() => {
                cb && cb();
                //绑定更新用户的事件
                // const event = new CustomEvent('stepUpdate');
                // window.dispatchEvent(event);
            })
                .catch((err) => {
                console.log(err);
            });
        }
    }
    //自定义事件
    buriedPointEvent(data, usersign) {
        let path = location.origin + location.pathname;
        let search = location.search;
        let event_data = Object.assign(Object.assign({}, data), { path, search, usersign });
        if (lc.currentUser()) {
            event_data.user = lc.currentUser();
        }
        lc.create('KSTempEvent', event_data)
            .then((res) => {
            console.log(res);
        })
            .catch((err) => {
            console.log(err);
        });
    }
    getFileStatus(id) {
        return lc.run('fileCheck', { id })
            .then((res) => {
            return res.data.status;
        });
    }
    shuffleArray(array) {
        const new_array = array.slice(); // 创建原数组的副本
        for (let i = new_array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = new_array[i];
            new_array[i] = new_array[j];
            new_array[j] = temp;
        }
        return new_array;
    }
    getFuncConfig({ func_name = '', func_key = 'common' } = {}) {
        if (!this.integration_data_storage[func_name] || !this.integration_data_storage[func_name][func_key]) {
            return lc.read('KSFunctionConfig', (q) => {
                q.equalTo('name', func_name);
                q.equalTo('key', func_key);
                q.limit(1);
            })
                .then(([res]) => {
                if (!res)
                    throw '配置获取失败';
                let data = res.toJSON();
                if (!this.integration_data_storage[func_name])
                    this.integration_data_storage[func_name] = {};
                this.integration_data_storage[func_name][func_key] = data;
                return data;
            })
                .catch((err) => {
                throw err;
            });
        }
        else {
            return Promise.resolve(this.integration_data_storage[func_name][func_key]);
        }
    }
    checkFile(file) {
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                lc.run('fileCheck', { id: file.objectId })
                    .then((res) => {
                    if (res.data.status) {
                        clearInterval(interval);
                        clearTimeout(timer);
                        let status = res.data.status;
                        resolve(status);
                    }
                });
            }, 1000);
            let timer = setTimeout(() => {
                clearInterval(interval);
                clearTimeout(timer);
                reject('查询超时');
            }, 10000);
        });
    }
    checkEmptyValue(value) {
        return [undefined, null, ''].includes(value);
    }
    expandList(tree_list) {
        let res = [];
        tree_list.forEach((el) => {
            res.push(el);
            el.children && res.push(...this.expandList(el.children));
        });
        return res;
    }
    // 获取使用次数
    getCount() {
        return lc.readItem('KSFunctionHistory', { id: '647ed842aa61440c5e8c0fdc' })
            .then((res) => {
            return res.toJSON();
        })
            .catch((err) => {
            console.log(err);
            throw err;
        });
    }
}
class UI {
    loading() {
        let loading = document.querySelector('#loading');
        if (loading)
            loading.style.display = 'flex';
        else {
            document.body.insertAdjacentHTML('beforeend', `<div id="loading">
      <svg t="1676896431729" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="3162" width="64" height="64">
        <path d="M204.8 204.8m-204.8 0a204.8 204.8 0 1 0 409.6 0 204.8 204.8 0 1 0-409.6 0Z" fill="#EBF2FC" p-id="3163">
        </path>
        <path d="M819.2 204.8m-204.8 0a204.8 204.8 0 1 0 409.6 0 204.8 204.8 0 1 0-409.6 0Z" fill="#B5D2F3" p-id="3164">
        </path>
        <path d="M819.2 819.2m-204.8 0a204.8 204.8 0 1 0 409.6 0 204.8 204.8 0 1 0-409.6 0Z" fill="#7FB0EA" p-id="3165">
        </path>
        <path d="M204.8 819.2m-204.8 0a204.8 204.8 0 1 0 409.6 0 204.8 204.8 0 1 0-409.6 0Z" fill="#4A90E2" p-id="3166">
        </path>
      </svg>
    </div>`);
        }
    }
    unloading() {
        let loading = util.$('#loading');
        loading.style.display = 'none';
    }
    alert(text) {
        if (typeof text === 'string') {
            alert(text);
        }
        else {
            const message = text.message || text.rawMessage || '';
            alert(message);
        }
    }
    confirm(text) {
        return confirm(text);
    }
    prompt(text) {
        return prompt(text) || '';
    }
    toast(text = '成功') {
        let toast = util.$('#ui_toast');
        if (toast) {
            if (toast.style.display === 'block')
                return;
            toast.innerText = text;
        }
        else {
            document.body.insertAdjacentHTML('beforeend', `<div id="ui_toast">${text}</div>`);
            toast = util.$('#ui_toast');
        }
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 2000);
    }
}
window.util = new Util();
window.ui = new UI();
const path_route = getPathRoute();
function getPathRoute() {
    if (!window.location.pathname)
        return '';
    let route_list = window.location.pathname.split('/');
    if (route_list.length) {
        return Array.from({ length: route_list.length - 2 }).map(i => '../').join('');
    }
    return '';
}
function formatNumber(arg) {
    return arg < 10 ? "0" + arg : arg;
}
