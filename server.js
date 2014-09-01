var express = require("express");
var app = express();


app.use('/static', express.static(__dirname + '/'));

var statusFunction = {
    "-901":function (res,httpstatus){

        //停留5秒后返回信息
        setTimeout(function(){
            console.log("response ", httpstatus);
            res.status(200).send({ error: '-901' });
        },6000);

    },
    "-910":function (res,httpstatus){
        var len = 50000;
        var o = new Array(len).join("o");
        var k = new Array(len).join("k");
        res.writeHead(200,{
            "Content-Length":Buffer.byteLength(o+k)
        });

        res.write(o);
        //停留5秒后返回信息
        setTimeout(function(){
            console.log("response ", httpstatus);
            res.end(k);
        },6000);

    },
    "-903":function (res,httpstatus){
        console.log("response ", httpstatus);
        //开始loading之后5秒内没有处理完
        res.writeHead(200, {
             'Content-Type': 'text/json',
             'Content-Length': 5454 });
        //console.log(res.headersSent);
        res.write('some data');
        res.end();
    },
    "-905":function (res,httpstatus){
        console.log("response ", httpstatus);
        //返回的不是json格式
        res.set('Content-Type', 'application/json');
        res.status(200).send("no json");
    },
    "200":function (res,httpstatus){
        console.log("response ", httpstatus);
        //业务完成,正常返回
        res.status(200).send({ code: '200' });
    }
};

app.use('/error',function(req, res){

    var httpstatus = req.query['httpstatus'];
    console.log("request ",httpstatus);
    statusFunction[httpstatus](res,httpstatus);

});


app.listen(3000,function(){
    console.log("started at",3000);
});


//error?httpstatus=-910,触发超时
//error?httpstatus=200,正常返回
//error?httpstatus=-905,json返回格式不对