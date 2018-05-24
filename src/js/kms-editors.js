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

  var kmseditors = { options: {}, isInit: false, $container: '', $position: '' }

  kmseditors.init = function(options) {
    // console.log('init:', options)
    if (!options || Object.keys(options).length === 0) {
      logger.warn('请对' + __NAME__ + '.init()传入必要的参数')
      return
    }
    if (this.isInit) return
    this.isInit = true
    this.$container = $('#' + options.container)
    this.options = options
    var $images = this.$container.find('img[ref=imageMaps]')
    $images.after('<div class="position-conrainer"></div>')
    this.$position = this.$container.find('.position-conrainer')
    var $kmseditors_contant = $('#kmseditors-contant') // 编辑区
    var $tips_div = $('#kmseditors-contant-tips') // 提示文字区域
    // console.log(this.$kmseditors_contant)
    this.$position.css({
      top: $kmseditors_contant.offset().top - $tips_div.height() - 5,
      left: this.$position.offset().left,
      width: $images.width(),
      height: $images.height()
    })
  }

  function _bind_map_event() {
    var conrainer = kmseditors.$position
    // 拖动
    kmseditors.$position.find('.map-position-bg').each(function() {
      var map_position_bg = $(this)
      // var conrainer = $(this).parent().parent()
      map_position_bg.unbind('mousedown').mousedown(function(event) {
        map_position_bg.data('mousedown', true)
        map_position_bg.data('pageX', event.pageX)
        map_position_bg.data('pageY', event.pageY)
        map_position_bg.css('cursor', 'move')
        return false
      }).unbind('mouseup').mouseup(function(event) {
        map_position_bg.data('mousedown', false)
        map_position_bg.css('cursor', 'default')
        return false
      })
      conrainer.mousemove(function(event) {
        if (!map_position_bg.data('mousedown')) return false
        var dx = event.pageX - map_position_bg.data('pageX')
        var dy = event.pageY - map_position_bg.data('pageY')
        if ((dx == 0) && (dy == 0)) {
          return false
        }
        var map_position = map_position_bg.parent()
        var p = map_position.position()
        var left = p.left + dx
        if (left < 0) left = 0
        var top = p.top + dy
        if (top < 0) top = 0
        var bottom = top + map_position.height()
        if (bottom > conrainer.height()) {
          top = top - (bottom - conrainer.height())
        }
        var right = left + map_position.width()
        if (right > conrainer.width()) {
          left = left - (right - conrainer.width())
        }
        map_position.css({
          left: left,
          top: top
        })
        map_position_bg.data('pageX', event.pageX)
        map_position_bg.data('pageY', event.pageY)

        bottom = top + map_position.height()
        right = left + map_position.width()
        $('.link-conrainer p[ref=' + map_position.attr('ref') + '] .rect-value').val(new Array(left, top, right, bottom).join(','))
        return false
      }).mouseup(function(event) {
        map_position_bg.data('mousedown', false)
        map_position_bg.css('cursor', 'default')
        return false
      })
    })

    // 改变大小
    kmseditors.$position.find('.resize').each(function() {
      var map_position_resize = $(this)
      // var conrainer = $(this).parent().parent()
      map_position_resize.unbind('mousedown').mousedown(function(event) {
        map_position_resize.data('mousedown', true)
        map_position_resize.data('pageX', event.pageX)
        map_position_resize.data('pageY', event.pageY)
        return false
      }).unbind('mouseup').mouseup(function(event) {
        map_position_resize.data('mousedown', false)
        return false
      })
      conrainer.mousemove(function(event) {
        if (!map_position_resize.data('mousedown')) return false
        var dx = event.pageX - map_position_resize.data('pageX')
        var dy = event.pageY - map_position_resize.data('pageY')
        if ((dx == 0) && (dy == 0)) {
          return false
        }
        var map_position = map_position_resize.parent()
        var p = map_position.position()
        var left = p.left
        var top = p.top
        var height = map_position.height() + dy
        if ((top + height) > conrainer.height()) {
          height = height - ((top + height) - conrainer.height())
        }
        if (height < 20) height = 20
        var width = map_position.width() + dx
        if ((left + width) > conrainer.width()) {
          width = width - ((left + width) - conrainer.width())
        }
        if (width < 50) width = 50
        map_position.css({
          width: width,
          height: height
        })
        map_position_resize.data('pageX', event.pageX)
        map_position_resize.data('pageY', event.pageY)

        bottom = top + map_position.height()
        right = left + map_position.width()
        $('.link-conrainer p[ref=' + map_position.attr('ref') + '] .rect-value').val(new Array(left, top, right, bottom).join(','))
        return false
      }).mouseup(function(event) {
        map_position_resize.data('mousedown', false)
        return false
      })
    })

    // 删除
    kmseditors.$position.find('.delete').unbind('click').click(function() {
      var ref = $(this).parent().attr('ref')
      // var _link_conrainer = $(this).parent().parent().parent().find('.link-conrainer')
      // _link_conrainer.find('.map-link[ref=' + ref + ']').remove()
      kmseditors.$position.find('.map-position[ref=' + ref + ']').remove()
      // _link_conrainer.find('.map-link').each(function() {
      //   $(this).attr('ref', index).find('.link-number-text').html('Link ' + index)
      //   index++
      // })
      // 重新给其余的调整ref ? 不知道又没作用
      var index = 1
      kmseditors.$position.find('.map-position').each(function() {
        $(this).attr('ref', index)
        // .find('.link-number-text').html('Link ' + index)
        index++
      })
    })
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
    var index = kmseditors.$position.find('.map-position[ref]').length + 1
    // var index = 1 // leo: 测试开发，先写死
    
    kmseditors.$position.append('<div ref="' + index + '" class="map-position"><div class="map-position-bg"></div><span class="link-number-text">Link ' + index + '</span><span class="delete">X</span><span class="resize"></span></div>')

    _bind_map_event()
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

    // $('#kmseditors-contant').imageMaps()

    $('#kmseditors-contant').click()
    $sketchbtn.click()
  })


  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = kmseditors
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function() { return kmseditors })
  } else {
    $w[__NAME__] = kmseditors
  }
})(window);