"use strict";
class Util {
    constructor() {
    }
    $(selector) {
        return document.querySelector(selector);
    }
    $$(selector) {
        return document.querySelectorAll(selector);
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
    downloadImg(url) {
        let image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
        image.onload = () => {
            let canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, image.width, image.height);
            let ext = image.src.substring(image.src.lastIndexOf('.') + 1).toLowerCase();
            let dataURL = canvas.toDataURL('image/' + ext);
            let a = document.createElement('a');
            a.download = 'download.' + ext;
            a.href = dataURL;
            a.click();
            a.remove();
        };
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
    getURLParams(url) {
        let params = new URLSearchParams(url.replace(/.*#[\w-]+\b[?&]?/g, ''));
        let params_obj = Object.fromEntries(params.entries());
        return params_obj;
    }
    checkEmptyValue(value) {
        return [undefined, null, ''].includes(value);
    }
}
class UI {
    loading() {
        Vue.prototype.$loading();
    }
    unloading() {
        Vue.prototype.$loading().close();
    }
    alert(error) {
        Vue.prototype.$alert(error);
    }
    confirm(text) {
        return Vue.prototype.$confirm(text);
    }
    prompt(text, title, option_data) {
        return Vue.prototype.$prompt(text, title, option_data);
    }
    toast(message, type = 'info', duration = 1500) {
        Vue.prototype.$toast(message, type = 'info', duration = 1500);
    }
}
window.util = new Util();
window.ui = new UI();
