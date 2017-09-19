/*
* 导入所需要的模块包
*
* body-parser实现的要点如下：
 处理不同类型的请求体：比如text、json、urlencoded等，对应的报文主体的格式不同。
 处理不同的编码：比如utf8、gbk等。
 处理不同的压缩类型：比如gzip、deflare等。
 其他边界、异常的处理。
* */
var request = require("request"); //协议交互模块
var http = require("http");
var fs = require("fs");  //文件操作模块
var express = require("express");  //express 4框架
var path = require("path");
var bodyParser = require("body-parser");//body-parser是非常常用的一个express中间件，作用是对post请求的请求体进行解析
var AipFaceClient = require("baidu-ai").face;
var cp  = require('child_process'); //自动打开浏览器
cp.exec('start chrome http://localhost:3000'); //打开chrome浏览器
// var user = require('./routes/users');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
//设置APPID/AK/SK
var APP_ID = "10153571";
var API_KEY = "oG3u4fTuH6nHYOQmsPP0mfjP";
var SECRET_KEY = "cTNUdrN2RN32n9FgES36bTYx5rIAG4tT";
//实例化人脸识别对象
var client = new AipFaceClient(APP_ID, API_KEY, SECRET_KEY);
//要对一张图片进行人脸识别，具体的人脸信息在返回的result字段中：
var image = fs.readFileSync('image/1.jpg');//读取照片源文件
//img文件对象，利用buffer toString base64方法转化为base64格式数据
var base64Img = new Buffer(image).toString('base64')
client.detect(base64Img,{face_fields:"age,beauty"}).then(function(result) {

});
/*
* 人脸识别  准备一个 标准图片
* 通过别人人脸检测 生成参数图片
* 标准图片 对比   参数图片  进行计算
* */

app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

//监听的端口
app.get('/', function(req, res) {
   res.sendFile(__dirname +'/login/index.html');
});
app.get('/result', function(req, res) {
   res.sendFile(__dirname +'/result/index.html');
});
app.get('/people', function(req, res) {
   res.sendFile(__dirname +'/index.html');
});

app.post('/result',function(req,res){
    var imgData = req.body.imgUrl;//传输过来的图片
    var base64Data = imgData.replace(/\s/g,"+");
    base64Data = base64Data.replace(/^data:image\/\w*;base64,/,'');
    var age,beauty,faceProbability,expression,gender,glasses;

    client.detect(base64Data,{face_fields:"age,beauty,expression,gender,glasses"}).then(function(result) {
        age = result.result[0].age; //年龄。face_fields包含age时返回
        beauty = result.result[0].beauty; //美丑打分，范围0-100，越大表示越美。face_fields包含beauty时返回
        faceProbability = result.result[0].face_probability; //人脸置信度，范围0-1
        expression = result.result[0].expression; //表情，0，不笑；1，微笑；2，大笑。face_fields包含expression时返回
        gender = result.result[0].gender; //male、female。face_fields包含gender时返回
        glasses = result.result[0].glasses; //是否带眼镜，0-无眼镜，1-普通眼镜，2-墨镜。face_fields包含glasses时返回
        client.match([base64Img, base64Data]).then(function(result) {
            var score = result.result[0].score;
            res.send({score:score,age:age,beauty:beauty,faceProbability:faceProbability,expression:expression,gender:gender,glasses:glasses});//向客户端发送数据  对比分数
        });
    });

})

app.post('/people',function(req,res){
    var imgData = req.body.imgUrl;//传输过来的图片
    var base64Data = imgData.replace(/\s/g,"+");
    base64Data = base64Data.replace(/^data:image\/\w*;base64,/,'');
    client.match([base64Img, base64Data]).then(function(result) {
        var Length = result.result.length;
        switch (Length){
            case 0:
                res.send("请拍摄全脸照片");
                break;
            case 1:
                var score = result.result[0].score;
                res.send({score:score,success:1})
                break;
            default:
                res.send("请重新拍摄");
                break;
        }
    });
}).listen(3000);