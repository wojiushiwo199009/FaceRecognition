function Post(opt){
    this.init(opt);
    this.format();
}
Post.prototype={
    constructor:"Post",
    init: function (opt) {  //初始化，参数 URL 地址 data参数  method方法
    	this.url = opt.url || '';
    	this.method = 'POST';
    	this.data = opt.data || '';
        this.async = true;//异步
        this.success = opt.success || function () {} //回调函数
    },
    format:function(){
    	var data = this.data;
    	var params = [];
    	for(var key in data){
    		params.push(key+"="+data[key]);
    	}
    	this.postData = params.join("&");
    	this.xhr();
    },
    xhr:function(){
    	var xhr = new XMLHttpRequest();
    	xhr.open(this.method,this.url,this.async);
    	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=utf-8");
    	xhr.send(this.postData);
    	xhr.onreadystatechange = function(){
    		if(xhr.status === 200 && xhr.readyState === 4){
    			this.success(xhr.response)
    		}
    	}.bind(this)
    }
}