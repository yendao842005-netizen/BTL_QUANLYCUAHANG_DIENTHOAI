var url = new URL(window.location.href);
window.zsp_width = Number(url.searchParams.get("width"));
window.zsp_height = Number(url.searchParams.get("height"));

window.zsp_max_width = 1096;
window.zsp_max_height = 813;

window.zsp_min_width = 60;
window.zsp_min_height = 60;

window.zsp_left_side = url.searchParams.get("leftside");

window.zsp_referrer = url.searchParams.get("domain");


(function (w, d, i) {
    if (w.ztr) {
        return
    }
    var s = d.getElementsByTagName("script")[0];
    if (!w.ztr) {
        var n = w.ztr = function (act, evt, arg) {
            if (n && n.callMethod) {
                n.callMethod.apply(act, evt, arg)
            } else {
                n.queue.push({ action: act, event: evt, arguments: arg })
            }
        };

        n.queue = n.queue || [];
        var zs = d.createElement("script");
        zs.src = "https://px.dmp.zaloapp.com/ztr.js?id=" + i;
        zs.async = true; s.parentNode.insertBefore(zs, s);
        w.ztr('init', i);
    }
})(window, document, window.APP_ID);

ztr('track', 'PageView');

function onChangeSizeIframe(width, height, isOpening) {
    var data = {
        width,
        height
    };
    if (isOpening) {
        data.isOpening = isOpening
    }
    ZSDKServer.postMessage('zchat_widget_toggle_sticker', data);
}

function initIframeSize() {
    var width = "auto";
    var height = "auto";
    ZSDKServer.postMessage('zchat_widget_open_chat_box', { width, height });
}

window.onload = function () {
    ZSDKServer.init();
    initIframeSize();
};

var FullScreen = {
    open: function (elem) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    },

    close: function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    },

    isOn: function () {
        return document.fullscreenElement ||
            document.webkitFullscreenElement || /* Safari and Opera */
            document.msFullscreenElement /* IE11 */;
    }
}

var ZaloPC = {
    open: function (uri, callback) {
        openCustomProtocol(uri, callback);
    }
}

var BrowserUtil = {
    osName: osName,
    detectOS: function () {
        return detectOS();
    }

}