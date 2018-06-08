## kmseditors - Hot spot map editor for javascript
![By Leo](https://img.shields.io/badge/Powered_by-Leo-red.svg?style=flat) 
![Libscore](https://img.shields.io/libscore/s/jQuery.svg?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/leochan2017/kms-editors.svg)
![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg)


## How to use
1. Clone this repo to your own project.

```
git clone git@github.com:leochan2017/kms-jsmind.git
```

2. Require kmseditors css file.

```
<link rel="stylesheet" type="text/css" href="./dist/kms-editors.min.css">
```

3. Require dependent files

```
<script src="./lib/jquery-1.11.0.min.js"></script>
<script src="./lib/jquery.contextmenu.r2.js"></script>
<script src="./lib/webuploader-0.1.5/webuploader.js"></script>
```


4. Require kmseditors js file.

```
<script type="text/javascript" src="./dist/kms-editors.min.js"></script>
```

---

## API

### kmseditors.init(Object)
Initialization kmseditors

name | type | required | description
---- | ---- | -------- | ---------
container | Stirng | Yes | Container element's id
data | Object | No | Initialize view data
editable | Boolean | No | Is it allowed to edit content？Default: Yes
host | String | Yes | The host path prefix
uploadImgUrl | String | Yes | Background image upload interface server path
onRelation | Function | No | The related button on click callback


#### data description:
name | type | required | description
---- | ---- | -------- | ---------
backgroundUrl | String | No | Background image url
sketchList | Array(Object) | No | Sketch list


##### sketchList description:
name   | type   | required | description
-----  | -----  | -------- | ---------
ref    | String | Yes      | Unique id
top    | Number | Yes      | Specifying the vertical position of a positioned sketch element
left   | Number | Yes      | Specifying the vertical position of a positioned sketch element
width  | Number | Yes      | Sketch element's width
height | Number | Yes      | Sketch element's height


#### Usage

```
kmseditors.init({
    container: 'container',
    editable: true,
    data: {
        backgroundUrl: './src/images/wwhm.jpg',
        sketchList: [
            { ref: "1", S: 70, left: 692, width: 80, height: 32 },
            { ref: "2", top: 70, left: 428, width: 73, height: 32 }
        ]
    },
    onRelation: function(item) {
        console.log('index.html onRelation: ', item)
    },
    host: 'http://192.168.2.207:8080/ekp',
    uploadImgUrl: 'http://192.168.2.207:8080/ekp/kms/kmaps/kms_kmaps_main/kmsKmapsAtt.do?method=uploading'
})
```

---

### kmseditors.getData()
Get the kmseditors's data

#### return

name | type | required | description
---- | ---- | -------- | ---------
backgroundUrl | String | No | Background image url
sketchList | Array(Object) | No | Sketch list

#### Usage

```
$('#saveBtn').on('click', function() {
    var res = kmseditors.getData()
    console.log('index.html save: ', res)
})
```

---

## kmseditors.screenshot(Object)
Get screenshot picture

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