if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({
        toString: null
      }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [],
        prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

(function($w) {
  var __NAME__ = 'kmseditors'
  var _noop = function() {}
  var __INIT_ZOOM__ = ''
  var __SKETCH_MIN_WIDTH__ = 30 // 锚点最小宽
  var __SKETCH_MIN_HEIGHT__ = 18 // 锚点最小高
  // 可选颜色组
  var __COLOR__ = ['#111111', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144b', '#F012BE', '#B10DC9', '#001f3f', '#AAAAAA', '#DDDDDD', '#ffffff']
  // 可选字体组
  var __FONT__ = ['系统默认', '微软雅黑', '黑体', '宋体', '新宋体', '仿宋', '华文行楷', '楷体', '方正舒体', '幼圆', '隶书']
  // 可选字号组
  var __SIZE__ = ['12px', '14px', '16px', '18px', '20px', '22px', '28px', '36px']
  var __REF__ = 1 // 顺序

  var logger = (typeof console === 'undefined') ? {
    log: _noop,
    debug: _noop,
    error: _noop,
    warn: _noop,
    info: _noop
  } : console

  if (!logger.debug) logger.debug = _noop

  if (typeof module === 'undefined' || !module.exports) {
    if (typeof $w[__NAME__] !== 'undefined') {
      logger.error(__NAME__ + '已经存在啦啦啦啦~')
      return
    }
  }

  var $contextmenu = '' // 右键菜单ele
  var $currSketch = '' // 当前操作的锚点元素(弹出了右键菜单)
  var isCanAddText = false
  var kmseditors = {
    options: {},
    isInit: false,
    $container: '',
    $position: ''
  }

  // 初始化函数
  kmseditors.init = function(options) {
    var errMsg = ''
    if (!options || Object.keys(options).length === 0) {
      logger.warn('请对' + __NAME__ + '.init()传入必要的参数')
      return
    }

    if (this.isInit) return

    if (!options.container) return logger.warn('container 不能为空')

    this.isInit = true
    this.$container = $('#' + options.container)
    this.options = options

    if (!options.debug) {
      window.console = {
        log: _noop,
        debug: _noop,
        error: _noop,
        warn: _noop,
        info: _noop
      }
    }

    _initElement()

    var tElement = setInterval(function() {
      if ($(kmseditors.$container).find('.kmseditors').length === 0) return

      clearInterval(tElement)

      if (kmseditors.options.editable) _bind_map_event()

      // 如果有传入图片 则跑初始化函数
      var data = options.data
      if (data) {
        var bgUrl = data.backgroundUrl
        var sketchList = data.sketchList

        if (bgUrl) {
          _hideTips()
          _initPositionConrainer(bgUrl)

          var tSketch = setInterval(function() {
            if (kmseditors.$position.length === 0) return

            clearInterval(tSketch)

            var sLen = sketchList.length
            if (sLen > 0) {
              for (var i = 0; i < sLen; i++) {
                var item = sketchList[i]
                _sketchHandle(item)
              }
            }
          }, 10)


          // 计算编辑器容器与图片的缩放比例
          // 如果图片的宽大于容器的宽，则需要设置zoom比例
          var conWidth = 0
          var imgWidth = 0

          var tZoom = setInterval(function() {
            if (conWidth > 0 && imgWidth > 0) {
              clearInterval(tZoom)
              var zoom = 1
              if (imgWidth > conWidth) zoom = conWidth / imgWidth
              kmseditors.setZoom(zoom)
            } else {
              conWidth = $(kmseditors.$container).width()
              imgWidth = $(kmseditors.$container).find('img[ref=imageMaps]').width()
            }
          }, 10)
        }
      }

      // if (!options.editable) setTimeout(_unEditable, 150) // 处理非编辑模式
      if (!options.editable) _unEditable()

    }, 10)

  }

  // 获取当前视图的数据
  // node 传入则获取具体的一个
  kmseditors.getData = function(node) {
    var dataObj = {
      backgroundUrl: '',
      sketchList: []
    }

    // 单个锚点数据获取
    function _getSketchItemData(item) {
      var context = item.context
      var ref = item.attr('ref')
      var top = item.top || context.offsetTop
      var left = item.left || context.offsetLeft
      var width = typeof item.width === 'number' ? item.width : context.offsetWidth
      var height = typeof item.height === 'number' ? item.height : context.offsetHeight
      var text = context.innerText || ''
      var color = item.attr('data-color') || ''
      var font = item.attr('data-font') || ''
      var size = item.attr('data-size') || ''
      var obj = {
        ref: ref,
        top: top,
        left: left,
        width: width,
        height: height,
        text: text,
        color: color,
        font: font,
        size: size
      }
      return obj
    }

    // 获取背景图片的url
    var $images = $(kmseditors.$container).find('img[ref=imageMaps]')
    if ($images.length > 0) dataObj.backgroundUrl = $images.attr('src')

    // 获取具体的node的数据
    if (typeof node !== 'undefined') {
      dataObj.sketchList = _getSketchItemData(node)
      return dataObj
    }

    // 获取所有node的数据集合
    var $p = this.$position

    if (!$p) return dataObj

    var $arr = $p.find('.map-position[dtype="1"]')
    if ($arr.length <= 0) return dataObj

    var arr = []
    var pWidth = $p.width() // 当前操作区的宽
    var pHeight = $p.height() // 当前操作区的高
    for (var i = 0; i < $arr.length; i++) {
      var $item = $($arr[i])
      var itemObj = _getSketchItemData($item)
      // 如果当前锚点宽和高在图片内，那么还是能留下的。
      // 溢出了图片的，那么就不要了
      var itemX = itemObj.left + itemObj.width
      var itemY = itemObj.top + itemObj.height
      if (itemX < pWidth && itemY < pHeight) {
        arr.push(itemObj)
      }
    }
    dataObj.sketchList = arr
    return dataObj
  }

  // 初始化编辑器元素
  function _initElement() {
    var htmlStr = '<div class="kmseditors"><div id="kmseditors-title" class="kmseditors-title"><div id="kmseditors-fullscreen" class="kmseditors-title-btngroup"><div class="kmseditors-title-btngroup-icon b1"></div><p>全屏</p></div><div id="kmseditors-exitfullscreen" class="kmseditors-title-btngroup"><div class="kmseditors-title-btngroup-icon b5"></div><p>退出全屏</p></div><div id="kmseditors-sketch" class="kmseditors-title-btngroup"><div class="kmseditors-title-btngroup-icon b2"></div><p>热点</p></div><div id="kmseditors-uploadimg" class="kmseditors-title-btngroup"><div class="kmseditors-title-btngroup-icon b4"></div><p>上传背景</p></div></div><div id="kmseditors-contant"><div id="kmseditors-contant-tips"><p>地图绘制操作指引</p><p>第一步：点击上传背景，上传制作好的地图背景</p><p>第二步：根据需求，添加热点加上关联信息</p><p>第三步：绘制完成后，点击完成，填写基本信息即可</p></div><div id="kmseditors-contextmenu"><div id="kmseditors-contextmenu-edit" title="编辑内容" class="kmseditors-contextmenu-group c3"></div><div id="kmseditors-contextmenu-font" title="更换字体" class="kmseditors-contextmenu-group c5"></div><div id="kmseditors-contextmenu-size" title="字体大小" class="kmseditors-contextmenu-group c6"></div><div id="kmseditors-contextmenu-color" title="选择颜色" class="kmseditors-contextmenu-group c2"></div><div id="kmseditors-contextmenu-relation" title="关联" class="kmseditors-contextmenu-group c1"></div><div id="kmseditors-contextmenu-delete" title="删除" class="kmseditors-contextmenu-group c4"></div></div></div></div>'

    // 初始化各种按钮绑定
    $(function() {
      // 啦啦啦啦啦啦啦啦啦
      $(kmseditors.$container).append(htmlStr)

      _initSidebar()

      // 非编辑模式下，内容区域居中
      if (!kmseditors.options.editable) {
        $(kmseditors.$container).css({
          'text-align': 'center'
        })
      }

      // 内容编辑区点击隐藏提示文字
      $('#kmseditors-contant').on('click', _hideTips)

      // 退出全屏按钮
      var $exitfullscreenbtn = $('#kmseditors-exitfullscreen')
      $exitfullscreenbtn.hide() // 隐藏退出全屏按钮

      // 全屏按钮
      var $fullscreenbtn = $('#kmseditors-fullscreen')

      if (_checkFullScreen() === false) {
        $fullscreenbtn.hide()
      } else {
        // 退出全屏按钮点击处理
        $exitfullscreenbtn.on('click', function() {
          _hideTips()
          _cancelFullScreen()
          $exitfullscreenbtn.hide()
          $fullscreenbtn.show()
        })
        // 全屏按钮点击处理
        $fullscreenbtn.on('click', function() {
          _hideTips()
          _launchFullScreen()
          $fullscreenbtn.hide()
          $exitfullscreenbtn.show()
        })
      }

      // 锚点&添加文字 按钮点击处理
      var $sketchBtn = $('#kmseditors-sketch')
       // 注意这里不要简写
      // 免得接收时把even当作了需要入参的obj，免除不得要的麻烦
      $sketchBtn.on('click', function(event) {
        isCanAddText = true
        $sketchBtn.find('.kmseditors-title-btngroup-icon').addClass('active')
      })

      // 上传背景按钮点击处理
      var $uploadImgBtn = $('#kmseditors-uploadimg')
      $uploadImgBtn.on('click', _hideTips)

      // 初始化上传背景
      _initImgUpload()

      // 把右键菜单隐藏掉
      $contextmenu = $('#kmseditors-contextmenu')

      $($contextmenu).hide()

      if (kmseditors.options.editable) {
        // 右键菜单 - 关联
        $($contextmenu).find('#kmseditors-contextmenu-relation').on('click', _relationHandle)
        // 右键菜单 - 颜色
        $($contextmenu).find('#kmseditors-contextmenu-color').on('click', _colorHandle)
        // 右键菜单 - 编辑
        $($contextmenu).find('#kmseditors-contextmenu-edit').on('click', _editHandle)
        // 右键菜单 - 删除
        $($contextmenu).find('#kmseditors-contextmenu-delete').on('click', _deleteHandle)
        // 右键菜单 - 字体
        $($contextmenu).find('#kmseditors-contextmenu-font').on('click', _fontHandle)
        // 右键菜单 - 字号
        $($contextmenu).find('#kmseditors-contextmenu-size').on('click', _sizeHandle)
        // 颜色组初始化
        _initColor(kmseditors.options.data.colors || __COLOR__)
        // 字体初始化
        _initFont(kmseditors.options.data.fonts || __FONT__)
        // 初始化字号
        _initSize(kmseditors.options.data.sizes || __SIZE__)
      }
    })

  }

  // 初始字体
  function _initFont(arr) {
    var html = '<div class="kmseditors-font-container" style="display: none">'
    for (var i = 0; i < arr.length; i++) {
      html += '<div class="font_div" data-font="' + arr[i] + '" style="font-family:' + arr[i] + '">' + arr[i] + '</div>'
    }
    html += '</div>'
    $($contextmenu).append(html)
    $($contextmenu).find('.font_div').off('click').on('click', function() {
      var font = $(this).attr('data-font')
      $($currSketch).find('.map-position-bg').css({
        'font-family': font
      })
      $($currSketch).attr('data-font', font)
      $($contextmenu).find('.kmseditors-font-container').hide()
    })
  }

  // 初始化颜色
  function _initColor(arr) {
    var html = '<div class="kmseditors-color-container" style="display: none">'
    for (var i = 0; i < arr.length; i++) {
      html += '<div class="color_div" data-color="' + arr[i] + '" style="background-color:' + arr[i] + ';border: 2px solid ' + arr[i] + '"></div>'
    }
    html += '</div>'
    $($contextmenu).append(html)
    $($contextmenu).find('.color_div').off('click').on('click', function() {
      var color = $(this).attr('data-color')
      $($currSketch).find('.map-position-bg').css({
        color: color
      })
      $($currSketch).attr('data-color', color)
      $($contextmenu).find('.kmseditors-color-container').hide()
    })
  }

  // 初始化字号
  function _initSize(arr) {
    var html = '<div class="kmseditors-size-container" style="display: none">'
    for (var i = 0; i < arr.length; i++) {
      html += '<div class="size_div" data-size="' + arr[i] + '" style="font-size:' + arr[i] + '">' + arr[i] + '</div>'
    }
    html += '</div>'
    $($contextmenu).append(html)
    $($contextmenu).find('.size_div').off('click').on('click', function() {
      console.log('啥')
      var fontSize = $(this).attr('data-size')
      $($currSketch).find('.map-position-bg').css({
        'font-size': fontSize
      })
      $($currSketch).attr('data-size', fontSize)
      $($contextmenu).find('.kmseditors-size-container').hide()
    })
  }

  // 初始化放大缩小的工具栏
  function _initSidebar() {
    if (kmseditors.options.editable) return

    var sidebar = $('<div id="kmseditors-sidebar"></div>'),
      barhtml = '<ul><li class="lui_map_icon_zoom_reset mui mui-history_handler_back" title="还原" data-opt="zoomReset"></li>' +
      '<li class="lui_map_icon_zoom_in mui mui-addition" title="放大" data-opt="zoomIn"></li>' +
      '<li class="lui_map_icon_zoom_out mui mui-delete" title="缩小" data-opt="zoomOut"></li></ul>'
    $(kmseditors.$container).append(sidebar)
    $(kmseditors.$container).css('position', 'relative')
    sidebar.append(barhtml)
    sidebar.on('click', function(evt) {
      var target = $(evt.target),
        opt = target.attr('data-opt')
      if (opt && kmseditors[opt]) {
        kmseditors[opt]()
      }
    })
  }

  // 处理非编辑模式
  function _unEditable() {
    _hideTips();
    // 非编辑模式下隐藏工具栏
    $(kmseditors.$container).find('#kmseditors-title').hide()

    // 给所有锚点隐藏，加上hover手势
    var tPosition = setInterval(function() {
      if (kmseditors.$position.length === 0) return

      clearInterval(tPosition)

      var positionList = $(kmseditors.$container).find('div.map-position[dtype]')
      var onRelation = kmseditors.options.onRelation || _noop

      if (!positionList) return

      for (var i = 0; i < positionList.length; i++) {
        var $item = $(positionList[i])
        $item.on('click', function() {
          onRelation(kmseditors.getData($(this)))
        })

        // opacity 设置透明有时候不管用，只能这样了
        $item.find('div.map-position-bg').css({
          border: 'none',
          cursor: 'pointer',
          'background-color':'transparent'
        })

        $item.find('span.resize').css({
          border: 'none',
          background: 'none',
          display: 'none'
        })
      }
    }, 50)
  }
  // 点击添加文字 点击图片 出现文字
  function _bind_add_text() {
    var func =  function(e) {
      if (!isCanAddText) return
      var obj = {
        top: e.pageY - 72,
        left: e.pageX
      }
      isCanAddText = false
      $('#kmseditors-sketch').find('.kmseditors-title-btngroup-icon').removeClass('active')
      _sketchHandle(obj)
    }
    $(kmseditors.$position).off('click').on('click', func)
    $(kmseditors.$position).prev().off('click').on('click', func)
  }
  // 隐藏菜单
  function _hideMenu() {
    $($contextmenu).hide().find('.kmseditors-color-container').hide()
    $($contextmenu).find('.kmseditors-font-container').hide()
    $($contextmenu).find('.kmseditors-size-container').hide()
  }
  // 监听字体数量大小
  // function _watchFont(map_position) {
  //   var $bg = $(map_position)[0].children[0]
  //   var innerText = $($bg)[0].innerText
  //   var height = $($bg)[0].clientHeight
  //   var width = $($bg)[0].clientWidth
  //   var size = parseInt(Math.sqrt(height * width / innerText.length)) - 8
  //   if (size > width) size = width - 5
  //   if (size > height) size = height - 5
  //   if (size < 0) size = 12
  //   $(map_position).attr('data-size', size).find('.map-position-bg').css({
  //     fontSize: size + 'px'
  //   })
  // }
  // 绑定事件处理函数
  function _bind_map_event() {
    var currDom = null
    var currDomType = null
    // 全局监听mousemove
    $(document).on('mousemove', function(event) {
      if (!currDomType) return
      var pageX = event.pageX
      var pageY = event.pageY
      var conrainer = kmseditors.$position

      // console.log('pageY', pageY, '|', 'conrainer.height():', conrainer.height())

      // 没变化 return
      var dx = pageX - $(currDom).data('pageX')
      var dy = pageY - $(currDom).data('pageY')
      // console.log('dx:', dx, ', dy:', dy)
      if ((dx == 0) && (dy == 0)) return false

      var map_position = $(currDom).parent()
      var p = $(map_position).position()
      var pLeft = p.left
      var pTop = p.top

      if (currDomType === 'map-position-bg') { // 锚点内移动
        var left = pLeft + dx
        if (left < 0) left = 0

        var top = pTop + dy
        if (top < 0) top = 0

        var bottom = top + map_position.height()
        var right = left + map_position.width()

        $(map_position).css({
          left: left,
          top: top
        })

        $(currDom).data('pageX', pageX)
        $(currDom).data('pageY', pageY)
      } else if (currDomType === 'resize') { // 改变大小时鼠标移动
        var left = pLeft
        var top = pTop
        var height = map_position.height() + dy
        var width = map_position.width() + dx

        if ($(map_position).attr('dtype') == 1) {
          if (width < __SKETCH_MIN_WIDTH__) width = __SKETCH_MIN_WIDTH__
          if (height < __SKETCH_MIN_HEIGHT__) height = __SKETCH_MIN_HEIGHT__
        } else {
          if (width < __SKETCH_MIN_WIDTH__) width = __SKETCH_MIN_WIDTH__
          if (height < __SKETCH_MIN_HEIGHT__) height = __SKETCH_MIN_HEIGHT__
        }
        $(map_position).css({
          'width': width,
          'height': height
        })

        // $(map_position).find('.map-position-bg').css({
        //   'display': 'table-cell',
        //   'vertical-align': 'middle',
        //   'text-align': 'center'
        //   // 'height': height,
        //   // 'line-height': height + 'px'
        // })

        // 监听改变锚点大小时改变字体大小
        // if ($(map_position).attr('dtype') == 1) {
        //   _watchFont(map_position)
        // }
        $(currDom).data('pageX', pageX)
        $(currDom).data('pageY', pageY)
      }
    })
    // 全局点击事件
    $(document).on('click', '#kmseditors-contant', function(event) {
      event.preventDefault()
      var dom = event.target
      var className = dom.className

      // 锚点点击 -> 显示菜单
      if (className === 'map-position-bg' || className === 'kmseditors-contextmenu-group c2' || className === 'kmseditors-contextmenu-group c5' || className === 'kmseditors-contextmenu-group c6') {
        var pageX = event.pageX
        var pageY = event.pageY

        $currSketch = className.indexOf('kmseditors-contextmenu-group') > -1 ? $currSketch : $(dom).parent()
        $currSketch.top = pageY
        $currSketch.left = pageX
        $currSketch.width = $($currSketch).width()
        $currSketch.height = $($currSketch).height()

        var dtype = parseInt($currSketch.attr('dtype'))
        var $colorConBtn = $('#kmseditors-contextmenu-color')
        var $editConBtn = $('#kmseditors-contextmenu-edit')
        var $fontConBtn = $('#kmseditors-contextmenu-font')
        var $sizeConBtn = $('#kmseditors-contextmenu-size')

        if (dtype === 0) { // 锚点
          $colorConBtn.hide()
          $editConBtn.hide()
          $fontConBtn.hide()
        } else if (dtype === 1) { // 文字
          $colorConBtn.show()
          $editConBtn.show()
          $fontConBtn.show()
          $sizeConBtn.show()
        }

        // 取当前鼠标位置
        var cLeft = pageX
        var cTop = pageY

        // 取当前锚点位置，目的是显示到右下角
        var $c0 = $currSketch[0]
        if ($c0) {
          $($c0).show()
          cTop = $c0.offsetTop + $($currSketch).height()
          cLeft = $c0.offsetLeft + $($currSketch).width() - $($contextmenu).width()
        }

        $($contextmenu).show().css({
          left: cLeft,
          top: cTop
        })
      } else {
        _hideMenu()
      }
    })
    // 锚点按下 -> flag = true
    $(document).on('mousedown', '.map-position-bg', function(event) {
      kmseditors.$position.addClass('unselectable') // 开启禁止选择文字
      var dom = event.target
      currDom = dom
      currDomType = 'map-position-bg'
      $(dom).data('pageX', event.pageX)
      $(dom).data('pageY', event.pageY)
      $(dom).css('cursor', 'move')
      _hideMenu()
    })
    // 改变大小按下 -> flag = true
    $(document).on('mousedown', '.resize', function(event) {
      kmseditors.$position.addClass('unselectable') // 开启禁止选择文字
      var dom = event.target
      currDom = dom
      currDomType = 'resize'
      $(dom).data('pageX', event.pageX)
      $(dom).data('pageY', event.pageY)
      _hideMenu()
    })
    // 全局弹起
    $(document).on('mouseup', function(event) {
      if(!kmseditors.$position) return
      kmseditors.$position.removeClass('unselectable') // 关闭禁止选择文字
      if (currDomType === 'map-position-bg') {
        kmseditors.$position.find('.map-position-bg').css('cursor', 'default')
      }
      currDom = null
      currDomType = null
      $($contextmenu).hide()
    })
  }
  // 检查是否支持全屏
  function _checkFullScreen() {
    var ele = document.documentElement
    return ele.requestFullscreen || ele.msRequestFullscreen || ele.mozRequestFullScreen || ele.webkitRequestFullscreen || false
  }
  // 全屏
  function _launchFullScreen() {
    var ele = document.documentElement
    if (ele.requestFullscreen) {
      ele.requestFullscreen()
    } else if (ele.msRequestFullscreen) {
      ele.msRequestFullscreen()
    } else if (ele.mozRequestFullScreen) {
      ele.mozRequestFullScreen()
    } else if (ele.webkitRequestFullscreen) {
      ele.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    }
  }
  // 退出全屏
  function _cancelFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }

  // 生成锚点&文字
  function _sketchHandle(obj) {
    var $images = $(kmseditors.$container).find('img[ref=imageMaps]')
    if ($images.length === 0) {
      var txt = '请先上传背景！'
      if (window.seajs) {
        seajs.use('lui/dialog', function(dialog) {
          dialog.alert(txt)
        })
      } else {
        alert(txt)
      }
      return
    }

    _hideTips()

    var top = '10'
    var left = '10'
    var width = __SKETCH_MIN_WIDTH__
    var height = __SKETCH_MIN_HEIGHT__
    var index = __REF__++
    var isLink = false
    var color = __COLOR__[0]
    var size = __SIZE__[0]
    var text = ''
    var font = ''

    if (obj && typeof obj === 'object') {
      if (obj.top) top = obj.top
      if (obj.left) left = obj.left
      if (obj.width) width = obj.width
      if (obj.height) height = obj.height
      if (obj.ref) index = obj.ref
      if (obj.isLink) isLink = obj.isLink
      if (obj.color) color = obj.color
      if (obj.text) text = obj.text
      if (obj.font) font = obj.font
      if (obj.size) size = obj.size
    }

    var classIsLink = isLink ? ' isLink' : ''
    var strHtml = '<div ref="' + index + '" dtype="1" data-color="' + color + '" data-font="' + font + '" data-size="' + size + '" class="map-position' + classIsLink + '" style="top:' + top + 'px;left:' + left + 'px;width:' + width + 'px;height:' + height + 'px;">' +
      '<div class="map-position-bg" style="color:' + color + ';font-family: ' + font + ';font-size: ' + size + '">' + text + '</div><span class="resize"></span>' +
      '</div>'
    // 在这里写style是为了初始化就有值
    kmseditors.$position.append(strHtml)
    // 新文字
    if (!obj.text) {
      $currSketch = kmseditors.$position.find('.map-position[dtype=1]').last()
      _editHandle()
    }
    // 双击编辑
    $('.map-position[dtype=1]').dblclick(function() {
      _editHandle()
    })
    // 监听改变锚点大小时改变字体大小
    // $('.map-position[dtype=1]').on('input', function() {
    //   var position = $(this)
    //   _watchFont(position)
    // })
  }
  // 图片上传完成后 - 初始化编辑区域
  function _initPositionConrainer(imgSrc) {
    if (!imgSrc) return

    var $warp = $('<div id="kmseditors-contant-sketch-warp"></div>')
    var $img = $('<img ref="imageMaps">')
    var $container = $('<div class="position-conrainer"></div>')
    var isContainerInit = false

    if (window.seajs) {
      seajs.use('lui/topic', function(topic) {
        topic.subscribe('/kms/kmaps/edit/canvas', function() {
          if (isContainerInit === false) {
            var $img = $('[ref="imageMaps"]')
            if (kmseditors.$position && kmseditors.$position.length > 0) {
              kmseditors.$position.css({
                width: $img.width(),
                height: $img.height()
              })
              isContainerInit = true
            }
          }
        })
      })
    }

    $img.on('load', function(evt) {
      kmseditors.$position = $(kmseditors.$container).find('.position-conrainer')
      _bind_add_text()
      var _$img = $(evt.target)
      var $kmseditors_contant = $('#kmseditors-contant') // 编辑区
      var $tips_div = $('#kmseditors-contant-tips') // 提示文字区域
      var top = 0
      var left = 0
      var iw = _$img.width()
      var ih = _$img.height()
      if (iw > 0 && ih > 0) isContainerInit = true
      kmseditors.$position.css({
        top: top,
        left: left,
        width: iw,
        height: ih
      })
    })
    $warp.append($img)
    $warp.append($container)

    $(kmseditors.$container).find('#kmseditors-contant').append($warp)

    if (imgSrc.indexOf('?') !== -1) {
      imgSrc += '&x='
    } else {
      imgSrc += '?x='
    }

    imgSrc += new Date().getTime()

    $img.attr('src', imgSrc)
  }
  // 初始化上传背景
  function _initImgUpload() {
    if (typeof WebUploader === 'undefined') return

    var uploadImgUrl = kmseditors.options.uploadImgUrl
    if (!uploadImgUrl) return logger.error('参数uploadImgUrl 未在init方法中传入')

    var fdModelId = kmseditors.options.fdModelId
    if (!fdModelId) return logger.error('参数fdModelId 未在init方法中传入')

    var BASE_URL = '../../lib/webuploader-0.1.5/'

    var serverURL = uploadImgUrl += '&fdModelId=' + fdModelId
    var swf = serverURL + 'Uploader.swf'

    if (kmseditors.options.swfUrl) {
      swf = kmseditors.options.swfUrl
    }

    // 创建Web Uploader实例
    var uploader = WebUploader.create({
      runtimeOrder: 'html5,flash',
      duplicate: true,
      // 选完文件后，是否自动上传。
      auto: true,
      // swf文件路径
      swf: swf,
      // 文件接收服务端。
      server: serverURL,
      // 选择文件的按钮。可选。
      // 内部根据当前运行是创建，可能是input元素，也可能是flash.
      pick: '#kmseditors-uploadimg',
      sendAsBinary: true,
      // 只允许选择图片文件。
      accept: {
        title: 'Images',
        extensions: 'gif,jpg,jpeg,bmp,png',
        mimeTypes: 'image/*'
      }
    })

    $(kmseditors.$container).find('#kmseditors-uploadimg').removeClass('webuploader-container')
    $(kmseditors.$container).find('#kmseditors-uploadimg > div.webuploader-pick').removeClass('webuploader-pick')


    // 当文件被加入队列之前触发，此事件的handler返回值为false，则此文件不会被添加进入队列。
    uploader.on('beforeFileQueued', function(file) {
      var $images = $(kmseditors.$container).find('img[ref=imageMaps]')
      if ($images.length > 0 && !confirm('再次上传将会覆盖原来的背景图片，是否继续？')) {
        return uploader.cancelFile(file)
      }
      // 默认清空已有内容
      $images.remove()
    })

    // 文件上传成功，给item添加成功class, 用样式标记上传成功。
    uploader.on('uploadSuccess', function(file, response) {
      var raw = response.path || response._raw
      if (!raw) return logger.error('_raw error', raw)

      if (window.seajs) {
        seajs.use('lui/topic', function(topic) {
          topic.publish('kms.editor.map.img.change', {
            fdAttId: response.fdAttId
          })
        })
      }

      // 清除锚点前，记录下来现在有的数据，等下用于重新渲染
      var nowData = kmseditors.getData()
      var _sketchList = nowData.sketchList

      // 清除锚点操作区域
      var $warp = $(kmseditors.$container).find('#kmseditors-contant-sketch-warp')
      if ($warp && $warp.length > 0) $warp.remove()

      var imgSrc = kmseditors.options.host + raw
      _initPositionConrainer(imgSrc)
      // $('#' + file.id).addClass('upload-state-done')

      // 还记得上面清除了锚点吗？现在重现搞回来
      var sLen = _sketchList.length
      if (sLen > 0) {
        setTimeout(function() {
          for (var i = 0; i < sLen; i++) {
            var item = _sketchList[i]
            _sketchHandle(item)
          }
        }, 300)
      }
    })

    // 文件上传失败，显示上传出错。
    uploader.on('uploadError', function(file) {
      var $li = $('#' + file.id),
        $error = $li.find('div.error')

      // 避免重复创建
      if (!$error.length) {
        $error = $('<div class="error"></div>').appendTo($li)
      }

      $error.text('上传失败')
    })
  }
  // 右键菜单 - 关联
  function _relationHandle() {
    $($contextmenu).hide()
    var onRelation = kmseditors.options.onRelation || _noop
    onRelation(kmseditors.getData($currSketch))
  }
  // 右键菜单 - 删除
  function _deleteHandle() {
    _hideMenu()
    $($currSketch).remove() // 最简单的写法
    return
  }
  // div focus 光标在最后
  function getC(that) {
    if (document.all) {
      that.range = document.selection.createRange();
      that.range.select();
      that.range.moveStart('character', -1);
    } else {
      that.range = window.getSelection().getRangeAt(0);
      that.range.setStart(that.range.startContainer, that.context.innerText && that.context.innerText.length);
    }
  }

  // 右键菜单 - 编辑
  function _editHandle() {
    if (!kmseditors.options.editable) return
    var bg = $($currSketch).find('.map-position-bg')
    $(bg).attr('contenteditable', true).focus()
    getC($(bg))
    $(bg).on('blur', function() {
      $(bg).attr('contenteditable', false)
    })
    _hideMenu()
  }

  // 右键菜单 - 颜色
  function _colorHandle() {
    $($contextmenu).find('.kmseditors-font-container').hide()
    $($contextmenu).find('.kmseditors-size-container').hide()
    $($contextmenu).find('.kmseditors-color-container').show()
  }

  // 右键菜单 - 字体
  function _fontHandle() {
    $($contextmenu).find('.kmseditors-color-container').hide()
    $($contextmenu).find('.kmseditors-size-container').hide()
    $($contextmenu).find('.kmseditors-font-container').show()
  }

  // 右键菜单 - 字号
  function _sizeHandle() {
    console.log('???')
    $($contextmenu).find('.kmseditors-color-container').hide()
    $($contextmenu).find('.kmseditors-font-container').hide()
    $($contextmenu).find('.kmseditors-size-container').show()
  }

  // 隐藏tips
  function _hideTips() {
    $(kmseditors.$container).find('#kmseditors-contant-tips').hide()
  }

  // 设置当前锚点是否为添加链接状态
  kmseditors.setLinkStatus = function(options) {
    var ref = options.ref
    var isLink = options.isLink
    if (!ref || typeof isLink !== 'boolean') return logger.error('setLinkStatus传入参数有误')
    var $dom = $(kmseditors.$container).find('div.map-position[dtype="0"][ref="' + ref + '"]')
    if (!$dom.length === 0) return
    if (isLink) {
      $dom.addClass('isLink')
    } else {
      $dom.removeClass('isLink')
    }
  }
  // 设置整体缩放比例
  kmseditors.setZoom = function(value) {
    var zoom = value || 1

    if (__INIT_ZOOM__ === '') __INIT_ZOOM__ = zoom

   
    if(kmseditors.options.transformType == 'transform') {
	     $(kmseditors.$container).find('#kmseditors-contant-sketch-warp').css({
	      'transform': 'scale(' + zoom + ')'
	    });
    } else {
    	 $(kmseditors.$container).find('#kmseditors-contant-sketch-warp').css({
    	      zoom: zoom,
    	      '-moz-transform': 'scale(' + zoom + ')'
    	 });
    }
    
    if(kmseditors.options.aftersetZoom) {
    	kmseditors.options.aftersetZoom(value);
    }
  }
  // 获取当前zoom的值
  kmseditors.getZoom = function() {
    var $warp = $(kmseditors.$container).find('#kmseditors-contant-sketch-warp')
    var currZoom = $warp[0].style.zoom
    if (currZoom) {
      if (/%$/.test(currZoom)) {
        currZoom = parseFloat(currZoom) / 100
      }
    }
    // 特别的浏览器取不到值,如：火狐
    if (!currZoom) {
      var wStr = $warp.attr('style')
      if (wStr) {
        var wArr = wStr.split(';')
        for (var i = 0; i < wArr.length; i++) {
          var item = wArr[i]
          var index = item.indexOf('scale')
          if (index === -1) break
          currZoom = item.substring(index + 6, item.length - 1)
          break
        }
      }
    }

    var obj = {
      initZoom: __INIT_ZOOM__,
      currZoom: parseFloat(currZoom)
    }

    return obj
  }
  // 放大
  kmseditors.zoomIn = function() {
    var v = kmseditors.getZoom().currZoom + 0.1
    var max = __INIT_ZOOM__ * 2
    if (v >= max) v = max
    kmseditors.setZoom(v)
  }
  // 缩小
  kmseditors.zoomOut = function() {
    var v = kmseditors.getZoom().currZoom - 0.1
    var min = __INIT_ZOOM__ * 0.6
    if (v <= min) v = min
    kmseditors.setZoom(v)
  }
  // 还原
  kmseditors.zoomReset = function() {
    kmseditors.setZoom(__INIT_ZOOM__)
  }

  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = kmseditors
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function() {
      return kmseditors
    })
  } else {
    $w[__NAME__] = kmseditors
  }
})(window);
