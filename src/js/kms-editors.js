

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

    // 锚点
    function _sketchHandle() {
        var $contant = $(this).parent().find('#kmseditors-contant')
        // console.log($contant)
        // return
        var _link_conrainer = $contant.find('.link-conrainer');
        console.log(_link_conrainer)
        var _position_conrainer = $contant.find('.position-conrainer');
        var index = _link_conrainer.find('.map-link').length +1;
        var image = $contant.find('img[ref=imageMaps]').attr('name');
        image = (image == '' ? '' : '['+ image + ']');
        _link_conrainer.append('<p ref="'+index+'" class="map-link"><span class="link-number-text">Link '+index+'</span>: <input type="text" size="60" name="link'+image+'[]" value="" /><input type="hidden" class="rect-value" name="rect'+image+'[]" value="10,10,100,40" /></p>');
        _position_conrainer.append('<div ref="'+index+'" class="map-position" style="left:10px;top:10px;width:90px;height:30px;"><div class="map-position-bg"></div><span class="link-number-text">Link '+index+'</span><span class="delete">X</span><span class="resize"></span></div>');
        bind_map_event();
        define_css();
    }

    $(function() {
        // 内容区点击隐藏提示文字
        $('#kmseditors-contant').click(function() {
            $('#kmseditors-contant-tips').hide()
        })

        var $exitfullscreenbtn = $('#exitfullscreenbtn')
        $exitfullscreenbtn.hide() // 隐藏退出全屏按钮

        // 退出全屏按钮点击处理
        $exitfullscreenbtn.click(function() {
            _cancelFullScreen()
            $exitfullscreenbtn.hide()
            $fullscreenbtn.show()
        })
        
        // 全屏按钮点击处理
        var $fullscreenbtn = $('#fullscreenbtn')
        $fullscreenbtn.click(function() {
            _launchFullScreen()
            $fullscreenbtn.hide()
            $exitfullscreenbtn.show()
        })


        // 锚点按钮点击处理
        var $sketchbtn = $('#sketchbtn')
        $sketchbtn.click(_sketchHandle)

        $('#kmseditors-contant').imageMaps()

        // _sketchHandle()
    })


    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = kmseditors
    } else if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function() { return kmseditors })
    } else {
        $w[__NAME__] = kmseditors
    }
})(window);