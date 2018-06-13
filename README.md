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

3. Require dependent files

```
<script src="./lib/jquery-1.11.0.min.js"></script>
<script src="./lib/jquery.contextmenu.r2.js"></script>
<script src="./lib/webuploader-0.1.5/webuploader.js"></script>
```


4. Require kmseditors js file.

```
<script src="./kms-editors/kms-editors.min.js"></script>
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
fdModelId | String | Yes | fdModelId, length: 32
host | String | Yes | The host path prefix
uploadImgUrl | String | Yes | Background image upload interface server path
onRelation | Function | No | The related button on click callback


#### data description:
name | type | required | description
---- | ---- | -------- | ---------
backgroundUrl | String | No | Background image url
sketchList | Array(Object) | No | Sketch list


##### sketchList description:
name   | type    | required | description
-----  | ------- | -------- | ---------
ref    | String  | Yes      | Unique id
top    | Number  | Yes      | Specifying the vertical position of a positioned sketch element
left   | Number  | Yes      | Specifying the vertical position of a positioned sketch element
width  | Number  | Yes      | Sketch element's width
height | Number  | Yes      | Sketch element's height
isLink | Boolean | No       | Set the sketch element's status


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
                { ref: "1", top: 70, left: 692, width: 80, height: 32, isLink: true },
                { ref: "2", top: 70, left: 428, width: 73, height: 32 }
            ]
        },
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
        }
    })
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


---

### kmseditors.setLinkStatus(Object)
Set the sketch element's status

name   | type    | required | description
------ | ------- | -------- | ---------
ref    | String  | true     | Sketch element's unique id
isLink | Boolean | true     | Set the sketch element's status

#### Usage

```
kmseditors.setLinkStatus({
    ref: item.sketchList.ref,
    isLink: true
})
```