var request = require('request');
var path = require('path');

function vk ()
{
    this.options={
        json: true,
        method: 'GET'
    };
    this.apiUrl = 'https://api.vk.com';
    this.loginUrl = 'https://oauth.vk.com';
    this.appId = '4073657';
    this.secretKey = 'dl9N6Dcl7TFu5IuvirSL';
    this.accessToken = '533bacf01e11f55b536a565b57531ac114461ae8736d6506a3';
}

vk.prototype.prepareParams = function (params, url)
{
    params.access_token=this.access_token;
    var queryString=false;
    if (Object.keys(params.queryParams).length>0)
    {
        queryString=[];
        //create string with get params
        for (var a in params.queryParams)
        {
            queryString.push(a+ '=' +params.queryParams[a]);
        }
    }
    //concatenate url parts
    this.options.uri=(url || this.apiUrl) +  params.url + (queryString ? '?'+queryString.join('&') : '');
    console.log(this.options.uri);
//    return options;
};

vk.prototype.login = function(params)
{
    params.queryParams.client_id = this.appId;
    params.queryParams.client_secret = this.secretKey;
    var url = this.prepareParams(params,this.loginUrl);
};

//vk.prototype.sendRequest = function (params, callback)
//{
//    send request to api and retrieve data
//    request(this.prepareParams(params),callback);
//};


module.exports=new vk();