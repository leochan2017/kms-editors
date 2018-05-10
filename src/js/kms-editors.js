(function($w) {
    var __NAME__ = 'kmseditors'
    var _noop = function() {}
    var logger = (typeof console === 'undefined') ? {
        log: _noop,
        debug: _noop,
        error: _noop,
        warn: _noop,
        info: _noop
    } : console

    if (typeof module === 'undefined' || !module.exports) {
        if (typeof $w[__NAME__] !== 'undefined') {
            logger.log(__NAME__ + '已经存在啦啦啦啦~')
            return
        }
    }

    var kmseditors = { options: '', isInit: false, editable: true }

    kmseditors.init = function(options) {
        // console.log('init:', options)
        if (!options || Object.keys(options).length === 0) {
            logger.warn('请对' + __NAME__ + '.init()传入必要的参数')
            return
        }
        if (this.isInit) return
        this.isInit = true
        this.options = options
        this.editable = options.editable === true ? true : false
    }

    // 全屏
    function _launchFullScreen() {
        var element = document.documentElement
        if (element.requestFullscreen) {
            element.requestFullscreen()
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen()
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen()
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        }
    }

    // 退出全屏
    function _cancelFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    $(function() {
        // 内容区点击隐藏提示文字
        $('#kmseditors-contant').click(function() {
            $('#kmseditors-contant-tips').hide()
        })

        // 隐藏退出全屏按钮
        var $exitfullscreenbtn = $('#exitfullscreenbtn')
        $exitfullscreenbtn.hide()

        // 全屏按钮点击处理
        var $fullscreenbtn = $('#fullscreenbtn')
        $fullscreenbtn.click(function() {
            _launchFullScreen()
            $fullscreenbtn.hide()
            $exitfullscreenbtn.show()
        })

        // 窗口按钮点击处理
        $exitfullscreenbtn.click(function() {
            _cancelFullScreen()
            $exitfullscreenbtn.hide()
            $fullscreenbtn.show()
        })
    })


    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = kmseditors
    } else if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function() { return kmseditors })
    } else {
        $w[__NAME__] = kmseditors
    }
})(window);