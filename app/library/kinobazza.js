var request = require('request');
var path = require('path');

function kinobazza ()
{
    this.apiUrl = 'http://api.kinobaza.tv';

}

kinobazza.prototype.prepareParams = function (params)
{
    var options={
        json: true,
        method: 'GET',
        timeout:1000
    };

    var queryString=false;
    if (Object.keys(params.queryParams).length>0)
    {
        queryString=[];
        //create string with get params
        for (var a in params.queryParams)
        {
            queryString.push(a + '=' + params.queryParams[a]);
        }
    }
    //concatenate url parts
    options.uri=this.apiUrl + params.url + (queryString ? '?' + queryString.join('&') : '');

    return options;
};

kinobazza.prototype.sendRequest = function (params, callback)
{
    //send request to api and retrieve data
    request(this.prepareParams(params),callback);
};


module.exports=new kinobazza();