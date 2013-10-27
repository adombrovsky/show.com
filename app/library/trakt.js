var request = require('request');
var path = require('path');

function trakt ()
{
    this.apiUrl = 'http://api.trakt.tv';
    this.apiKey = '5226cc6a0f7925a03b9a9eb153037c40';
}

trakt.prototype.prepareParams = function (params)
{
    var options={
        json: true,
        method: 'GET'
    };
    params.apikey=this.apiKey;
    var queryString=false;
    if (Object.keys(params.queryParams).length>0)
    {
        queryString=[];
        //create string with get params
        for (var a in params.queryParams)
        {
            queryString.push(params.queryParams[a]);
        }
    }
    //concatenate url parts
    options.uri=this.apiUrl +  params.url + this.apiKey + '/' + (queryString ? queryString.join('/') : '');
    console.log(options.uri);
    return options;
};

trakt.prototype.sendRequest = function (params, callback)
{
    //send request to api and retrieve data
    request(this.prepareParams(params),callback);
};


module.exports=new trakt();