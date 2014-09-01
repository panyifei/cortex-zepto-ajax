'use strict';

var request = module.exports = {};
var Zepto = require("./zepto");

request.Zepto = Zepto;

var tempZepto = {};
tempZepto.ajax = Zepto.ajax;


function createNewXhr(options){
    var xhr = new window.XMLHttpRequest();
    var timeSet = 5000;//设置限制时间
    var errorTimeout;//一个timeout
    var hasError = false;//是否出错了
    var queue = [];
    Zepto.queue = queue;//一个全局的数组

    //发送数据到监控台
    function sentmessage(timeLast,hs,ec){
        if(hasError) return;//如果已经出了问题,直接return
        var ts = Date.now();
        var url = "http://114.80.165.63/broker-service/api/single?" + toQuery({
          v:1,
          ts:ts,
          tu:options.url,
          d:ts - timeLast,
          hs:hs,
          ec:ec
        });
        var img = new Image();
        queue.push(img);
        img.onerror = function(){
          queue.pop();
        }//防止img对象提前被回收
        img.src = url;
        hasError = true;
    }//通过img发送一个请求

    //用来设置和清除定时
    function setAndClearTimeout(readyState){
        if(errorTimeout || errorTimeout !== null){
            clearTimeout(errorTimeout);
        }
        if(readyState !== 4){
          var errorStatus = "-90" + readyState;
          errorTimeout = setTimeout(sentmessage,timeSet,Date.now(),errorStatus,null);
        }
    }

    function toQuery(obj){
        var e = encodeURIComponent;
        var query = [];
        for(var key in obj){
          if(obj[key]){
            query.push(key + "=" + e(obj[key]));
          }
        }
        return query.join("&");
    }

    //用来得到httpStatus
    function getStatus(xhr){
        var status;
        try{
          status = xhr.status;
        }catch(e){
          return null;
        }
        return status;
    }

    xhr.addEventListener('readystatechange',function(){
        if(xhr.readyState === 1  && options.timeout){
            setTimeout(sentmessage,options.timeout,Date.now(),"-910",null);
        }
        if(!hasError){
            setAndClearTimeout(xhr.readyState);
          }//如果没有出错,进行timeout的设定和解除
        if (xhr.readyState === 4) {
            if(!hasError){
                var httpStatus = getStatus(xhr);
                var type = xhr.getResponseHeader("Content-Type");
                var resultJson;
                if(type.indexOf("application/json") !== -1 ){
                  try{
                    resultJson = JSON.parse(xhr.responseText);
                    sentmessage(Date.now(),httpStatus,resultJson.code);
                    //成功,返回业务码
                  }catch(e){
                    sentmessage(Date.now(),"-905",null);
                    //json.parse失败
                  }
                }
            }//到4为止都没出错,进行最后的检验
        }
    });
    
    return xhr;
}


Zepto.ajax = function(options){
    var newOptions={},key;
    for (key in options) {
        if (newOptions[key] === undefined) {
            newOptions[key] = options[key];
        }
    }
    newOptions.xhr = function(){
       return createNewXhr(options); 
    };
    tempZepto.ajax(newOptions);
}