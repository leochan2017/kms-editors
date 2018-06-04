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

  var $contextmenu = '' // 右键菜单ele
  var $currSketch = '' // 当前操作的锚点元素(弹出了右键菜单)

  var kmseditors = { options: {}, isInit: false, isUploadImage: false, $container: '', $position: '' }

  // 初始化函数
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

    // 非编辑模式下隐藏工具栏
    if (!options.editable) _unEditable()
  }

  // 获取当前视图的数据
  // node 传入则获取具体的一个
  kmseditors.getData = function(node) {
    function _objHandle(item) {
      var context = item.context
      var width = typeof item.width === 'number' ? item.width : context.offsetWidth
      var height = typeof item.height === 'number' ? item.height : context.offsetHeight
      return {
        ref: item.attr('ref'),
        top: item.top || context.offsetTop,
        left: item.left || context.offsetLeft,
        width: width,
        height: height
      }
    }

    // 获取具体的node的数据
    if (typeof node !== 'undefined') return _objHandle(node)

    // 获取所有node的数据集合
    var $arr = kmseditors.$position.find('.map-position[ref]')
    if ($arr.length <= 0) return []
    var arr = []
    for (var i = 0; i < $arr.length; i++) {
      var item = $arr[i]
      arr.push(_objHandle($(item)))
    }
    return arr
  }

  // 处理非编辑模式
  function _unEditable() {
    kmseditors.$container.find('#kmseditors-title').hide()
  }

  // 绑定事件处理函数
  function _bind_map_event() {
    var conrainer = kmseditors.$position
    // 拖动处理
    kmseditors.$position.find('.map-position-bg').each(function() {
      var map_position_bg = $(this)
      var isContextmenu = false
      // 右键菜单
      map_position_bg.off('contextmenu', _noop).on('contextmenu', function(event) {
        // console.log('右键拉拉拉拉', event)
        isContextmenu = true
        $currSketch = $(event.target).parent()
        // console.log('ref', $currSketch.attr('ref'))
        $currSketch.top = event.pageY
        $currSketch.left = event.pageX
        $currSketch.width = $($currSketch).width()
        $currSketch.height = $($currSketch).height()
        event.preventDefault()

        var dtype = parseInt($currSketch.attr('dtype'))
        var $colorConBtn = $('#kmseditors-contextmenu-color')
        var $editConBtn = $('#kmseditors-contextmenu-edit')

        if (dtype === 0) { // 锚点
          $colorConBtn.hide()
          $editConBtn.hide()
        } else if (dtype === 1) { // 文字
          $colorConBtn.show()
          $editConBtn.show()
        }

        // if (!kmsjsmap.editable) return;
        $contextmenu.show().css({
          left: event.pageX,
          top: event.pageY
        })

        map_position_bg.data('mousedown', false)
        map_position_bg.css('cursor', 'default')

        // 判断右键时间已过，flag复位
        setTimeout(function() {
          isContextmenu = false
        }, 100)
      })

      // var conrainer = $(this).parent().parent()
      // 锚点框内
      map_position_bg.unbind('mousedown').mousedown(function(event) {
        // console.log('map_position_bg 1 mousedown', event)
        // 因为右键事件没mousedown那么快触发，
        // 所以，先等一等看看用户是不是要右键，再继续处理
        return setTimeout(function() {
          if (isContextmenu) return false
          // console.log('map_position_bg 2 mousedown')
          $contextmenu.hide()
          map_position_bg.data('mousedown', true)
          map_position_bg.data('pageX', event.pageX)
          map_position_bg.data('pageY', event.pageY)
          map_position_bg.css('cursor', 'move')
          return false
        }, 50)
      }).unbind('mouseup').mouseup(function(event) {
        // console.log('map_position_bg mouseup')
        map_position_bg.data('mousedown', false)
        map_position_bg.css('cursor', 'default')
        return false
      })

      conrainer.mousemove(function(event) {
        // console.log('conrainer mousemove')
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
        // $('.link-conrainer p[ref=' + map_position.attr('ref') + '] .rect-value').val(new Array(left, top, right, bottom).join(','))
        return false
      }).mouseup(function(event) {
        // console.log('conrainer mouseup')
        $contextmenu.hide()
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
        // $('.link-conrainer p[ref=' + map_position.attr('ref') + '] .rect-value').val(new Array(left, top, right, bottom).join(','))
        return false
      }).mouseup(function(event) {
        map_position_resize.data('mousedown', false)
        return false
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
      document.exitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }

  // 锚点
  function _sketchHandle() {
    if (!kmseditors.isUploadImage) return alert('请先上传背景图片')

    _hideTips()

    var index = kmseditors.$position.find('.map-position[ref]').length + 1

    // 在这里写style是为了初始化就有值
    kmseditors.$position.append('<div ref="' + index + '" dtype="0" class="map-position" style="top:10px;left:10px;width:90px;height:30px;"><div class="map-position-bg"></div><span class="link-number-text">Link ' + index + '</span><span class="resize"></span></div>')

    _bind_map_event()
  }


  // 产生随机32位ID
  function _generateId() {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

    var nums = ''

    for (var i = 0; i < 32; i++) {
      var id = parseInt(Math.random() * 61)
      nums += chars[id]
    }

    return nums
  }


  // 图片上传完成后 - 初始化编辑区域
  function _initPositionConrainer() {
    kmseditors.isUploadImage = true

    var $images = kmseditors.$container.find('img[ref=imageMaps]')
    window.w = $images
    $images.after('<div class="position-conrainer"></div>')
    kmseditors.$position = kmseditors.$container.find('.position-conrainer')

    var $kmseditors_contant = $('#kmseditors-contant') // 编辑区
    var $tips_div = $('#kmseditors-contant-tips') // 提示文字区域
    // console.log(kmseditors.$kmseditors_contant)
    // 不知为何，不延时一下，width和height取不到
    setTimeout(function() {
      var top = $kmseditors_contant.offset().top - $tips_div.height() - 5
      var left = kmseditors.$position.offset().left
      var width = $images.width()
      var height = $images.height()
      // console.log('top', top)
      // console.log('left', left)
      // console.log('width', width)
      // console.log('height', height)
      kmseditors.$position.css({
        top: top,
        left: left,
        width: width,
        height: height
      })
    }, 50)
  }


  // 初始化上传图片
  function _initImgUpload() {
    var BASE_URL = '../../lib/webuploader-0.1.5/'

    var serverURL = kmseditors.options.uploadImgUrl += '&fdModelId=' + _generateId()

    // 创建Web Uploader实例
    var uploader = WebUploader.create({
      // 选完文件后，是否自动上传。
      auto: true,
      // swf文件路径
      swf: BASE_URL + 'Uploader.swf',
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

    // 去掉被插件强奸的样式
    kmseditors.$container.find('#kmseditors-uploadimg').removeClass('webuploader-container')
    kmseditors.$container.find('#kmseditors-uploadimg > div.webuploader-pick').removeClass('webuploader-pick')


    // 监听fileQueued事件，通过uploader.makeThumb来创建图片预览图。
    // PS: 这里得到的是Data URL数据，IE6、IE7不支持直接预览。可以借助FLASH或者服务端来完成预览。
    // 当有文件添加进来的时候
    uploader.on('fileQueued', function(file) {
      return
      var $li = $(
          '<div id="' + file.id + '" class="file-item thumbnail">' +
          '<img>' +
          '<div class="info">' + file.name + '</div>' +
          '</div>'
        ),
        $img = $li.find('img')


      // $list为容器jQuery实例
      // $list.append($li);
      kmseditors.$container.find('#kmseditors-contant').append($li)

      // 创建缩略图
      // 如果为非图片文件，可以不用调用此方法。
      // thumbnailWidth x thumbnailHeight 为 100 x 100
      var thumbnailWidth = thumbnailHeight = 100
      uploader.makeThumb(file, function(error, src) {
        if (error) {
          $img.replaceWith('<span>不能预览</span>');
          return;
        }

        $img.attr('src', src);
      }, thumbnailWidth, thumbnailHeight);
    });

    // 当文件被加入队列之前触发，此事件的handler返回值为false，则此文件不会被添加进入队列。
    uploader.on('beforeFileQueued', function(file) {
      var $images = kmseditors.$container.find('img[ref=imageMaps]')
      if ($images.length > 0 && !confirm('再次上传将会覆盖原来的背景图片，是否继续？')) {
        return uploader.cancelFile(file)
      }
      // 默认清空已有内容
      $images.remove()
    })


    // 然后剩下的就是上传状态提示了，当文件上传过程中, 上传成功，上传失败，上传完成都分别对应uploadProgress, uploadSuccess, uploadError, uploadComplete事件。
    // 文件上传过程中创建进度条实时显示。
    uploader.on('uploadProgress', function(file, percentage) {
      var $li = $('#' + file.id),
        $percent = $li.find('.progress span');

      // 避免重复创建
      if (!$percent.length) {
        $percent = $('<p class="progress"><span></span></p>')
          .appendTo($li)
          .find('span');
      }

      $percent.css('width', percentage * 100 + '%');
    });

    // 文件上传成功，给item添加成功class, 用样式标记上传成功。
    uploader.on('uploadSuccess', function(file, response) {
      // console.log(response)
      var raw = response._raw
      if (!raw) return console.log('_raw error', raw)
      var imgSrc = kmseditors.options.host + raw
      var htmlStr = '<img src="' + imgSrc + '" ref="imageMaps">'
      kmseditors.$container.find('#kmseditors-contant').append(htmlStr)
      _initPositionConrainer()
      // $('#' + file.id).addClass('upload-state-done');
    });

    // 文件上传失败，显示上传出错。
    uploader.on('uploadError', function(file) {
      var $li = $('#' + file.id),
        $error = $li.find('div.error');

      // 避免重复创建
      if (!$error.length) {
        $error = $('<div class="error"></div>').appendTo($li);
      }

      $error.text('上传失败');
    });

    // 完成上传完了，成功或者失败，先删除进度条。
    uploader.on('uploadComplete', function(file) {
      $('#' + file.id).find('.progress').remove();
    });
  }


  // 右键菜单 - 关联
  function _relationHandle() {
    $contextmenu.hide()
    // console.log($currSketch)
    var onRelation = kmseditors.options.onRelation || _noop
    onRelation(kmseditors.getData($currSketch))
  }


  // 右键菜单 - 删除
  function _deleteHandle() {
    $contextmenu.hide()
    $currSketch.remove() // 最简单的写法
    return
  }

  // 右键菜单 - 编辑
  function _editHandle() {
    $contextmenu.hide()
  }


  // 右键菜单 - 颜色
  function _colorHandle() {
    $contextmenu.hide()
  }


  // 隐藏tips
  function _hideTips() {
    kmseditors.$container.find('#kmseditors-contant-tips').hide()
  }


  // 初始化各种按钮绑定
  $(function() {
    // 内容编辑区点击隐藏提示文字
    $('#kmseditors-contant').on('click', _hideTips)

    // 退出全屏
    var $exitfullscreenbtn = $('#kmseditors-exitfullscreen')
    $exitfullscreenbtn.hide() // 隐藏退出全屏按钮

    // 退出全屏按钮点击处理
    $exitfullscreenbtn.on('click', function() {
      _hideTips()
      _cancelFullScreen()
      $exitfullscreenbtn.hide()
      $fullscreenbtn.show()
    })

    // 全屏按钮点击处理
    var $fullscreenbtn = $('#kmseditors-fullscreen')
    $fullscreenbtn.on('click', function() {
      _hideTips()
      _launchFullScreen()
      $fullscreenbtn.hide()
      $exitfullscreenbtn.show()
    })

    // 锚点按钮点击处理
    var $sketchbtn = $('#kmseditors-sketch')
    $sketchbtn.on('click', _sketchHandle)

    // 上传图片按钮点击处理
    var $uploadImgBtn = $('#kmseditors-uploadimg')
    $uploadImgBtn.on('click', _hideTips)

    // 初始化上传图片
    _initImgUpload()


    // 这里需要跑一个初始化，插入内容到body的方法

    // 然后把右键菜单隐藏掉
    $contextmenu = $('#kmseditors-contextmenu')
    $contextmenu.hide()

    // 右键菜单 - 关联
    $contextmenu.find('#kmseditors-contextmenu-relation').on('click', _relationHandle)
    // 右键菜单 - 颜色
    $contextmenu.find('#kmseditors-contextmenu-color').on('click', _colorHandle)
    // 右键菜单 - 编辑
    $contextmenu.find('#kmseditors-contextmenu-edit').on('click', _editHandle)
    // 右键菜单 - 删除
    $contextmenu.find('#kmseditors-contextmenu-delete').on('click', _deleteHandle)


    // dev code - 正式上线时去掉
    // $('#kmseditors-contant').click()
    // $sketchbtn.click()
  })


  if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = kmseditors
  } else if (typeof define === 'function' && (define.amd || define.cmd)) {
    define(function() { return kmseditors })
  } else {
    $w[__NAME__] = kmseditors
  }
})(window);