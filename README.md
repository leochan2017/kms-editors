## kmseditors - Hot spot map editor for javascript
![By Leo](https://img.shields.io/badge/Powered_by-Leo-red.svg?style=flat) 
![Libscore](https://img.shields.io/libscore/s/jQuery.svg?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/leochan2017/kms-editors.svg)
![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg)


## How to use
1. Clone this repo.

```
git clone git@github.com:leochan2017/kms-jsmind.git
```

2. Copy the "dist/kms-editors" files to your own project.

3. Require kmseditors css file.

```
<link rel="stylesheet" href="./kms-editors/kms-editors.min.css">
```

4. Require dependent files

```
<script src="./lib/jquery-1.11.0.min.js"></script>
<script src="./lib/webuploader-0.1.5/webuploader.js"></script>
```

5. Require kmseditors js file.

```
<script src="./kms-editors/kms-editors.min.js"></script>
```

---

## API

### kmseditors.init(Object)
Initialize kmseditors.

name         | type     | required | description
------------ | -------- | -------- | ---------
container    | Stirng   | Yes | Container element's id
data         | Object   | No  | Initialize view data
editable     | Boolean  | No  | Is it allowed to edit content？Default: True
fdModelId    | String   | Yes | fdModelId, length: 32
host         | String   | Yes | The host path prefix
uploadImgUrl | String   | Yes | Background image upload interface server path
onRelation   | Function | No  | The related button on click callback
debug        | Boolean  | No  | debug mode, Default: False


#### data description:
name | type | required | description
---- | ---- | -------- | ---------
backgroundUrl | String | No | Background image url
sketchList | Array(Object) | No | Sketch list


##### sketchList description:
name        | type        | required | description
------------- | ------------- | -------- | ---------
ref		 | String	| Yes | Unique id
top		| Number  | Yes | Specifying the vertical position of a positioned sketch element
left	   | Number  | Yes | Specifying the vertical position of a positioned sketch element
width	 | Number  | Yes | Sketch element's width
height	  | Number  | Yes | Sketch element's height
text	  | String	  | No  | Set the text input value
color	  | String	  | No  | Hexadecimal color code
font	 | String	| No  | Set the font style
size	 | String	| No  | Set the text size 
isLink	   | Boolean  | No  | Set the text element's status


#### Usage

```
function _generateId() {
    var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

    var nums = ''

    for (var i = 0; i < 32; i++) {
        var id = parseInt(Math.random() * 61)
        nums += chars[id]
    }

    return nums
}

var fdModelId = _generateId()

kmseditors.init({
    container: 'container',
    data: {
    backgroundUrl: './src/style/images/wwhm.jpg',
    sketchList: [
        { ref: '1', top: 70, left: 692, width: 80, height: 32, isLink: true },
        { ref: '2', top: 70, left: 428, width: 73, height: 32 },
        { ref: '3', color: '#39CCCC', font: '仿宋', height: 43, left: 388, size: '23px', text: '我們仍未知道那天所看見的花名', top: 125, width: 343 },
        { ref: '4', color: '#39CCCC', font: '仿宋', height: 31, left: 570, size: '19px', text: '這段字可以點擊', top: 200, width: 190, isLink: true }
    ]},
    editable: true,
    fdModelId: fdModelId,
    host: 'http://192.168.2.207:8080/ekp',
    uploadImgUrl: 'http://192.168.2.207:8080/ekp/kms/kmaps/kms_kmaps_main/kmsKmapsAtt.do?method=uploading',
    onRelation: function(item) {
        console.log('index.html onRelation: ', item)
        if (!item) return
        kmseditors.setLinkStatus({
        ref: item.sketchList.ref,
        isLink: true
        })
    },
    debug: true
})
```

---

### kmseditors.getData()
Get the kmseditors's data

#### return

name          | type          | required | description
------------- | ------------- | -------- | ---------
backgroundUrl | String        | No       | Background image url
sketchList    | Array(Object) | No       | Sketch list

#### Usage

```
$('#saveBtn').on('click', function() {
    var res = kmseditors.getData()
    console.log('index.html save: ', res)
})
```

---

## kmseditors.screenshot(Object) (Not yet started)
Get screenshot picture.

name   | type   | required | description
-----  | ------ | -------- | ---------
width  | Number | Yes      | The screenshot picture's width
height | Number | Yes      | The screenshot picture's height

#### Usage

```
$('#screenshot').on('click', function() {
    kmseditors.screenshot()
})
```

---

### kmseditors.setLinkStatus(Object)
Set the status of the sketch element's.

name   | type    | required | description
------ | ------- | -------- | ---------
ref    | String  | Yes      | Sketch element's unique id
isLink | Boolean | Yes      | Set the sketch element's status

#### Usage

```
kmseditors.setLinkStatus({
    ref: item.sketchList.ref,
    isLink: true
})
```

---

### kmseditors.setZoom(Number)
Set the container's zoom value.

type    | required | description
------- | -------- | ---------
Number  | No       | zoom value(0~1),  Default: 1

#### Usage

```
kmseditors.setZoom(0.5)
```

---

### kmseditors.getZoom()
Get the container's zoom value.

Name     | type    | description
-------- | ------- | ---------
currZoom | Number  | current zoom value(0~1)
initZoom | Number  | init zoom value(0~1)

#### Usage

```
var val = kmseditors.getZoom()
console(val)
// {
//    currZoom: 0.5
//    initZoom: 1
// }
```

---

### kmseditors.zoomIn()
Magnify the container. The maximum allowable is twice the initial value.

#### Usage

```
kmseditors.zoomIn()
```

---

### kmseditors.zoomOut()
Shrink the container. The maximum allowable value is 0.6 times the initial value.

#### Usage

```
kmseditors.zoomOut()
```

---

### kmseditors.zoomReset()
Reset container initialization size

#### Usage

```
kmseditors.zoomReset()
```