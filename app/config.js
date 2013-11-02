exports.appConfig = {
    production:{
        http:{
            host:'',
            port:5000
        },
        db:{
            user : '',
            pass : '',
            host : '',
            port : 47458,
            name : 'show_com'
        },
        googleApi:{
            clientID: '',
            clientSecret: '',
            callbackURL: "http://showcom.herokuapp.com/login/google/callback"
        }
    },
    local:{
        http:{
            host:'',
            port:8888
        },
        db:{
            user : 'farw',
            pass : '111',
            host : 'localhost',
            name : 'show'
        },
        googleApi:{
            clientID: '',
            clientSecret: '',
            callbackURL: "http://show.com:8888/login/google/callback"
        }
    }
};

exports.loadConfig = function(cfg)
{
    var environment = process.env.NODE_ENV || 'production';

    if (typeof cfg[environment] !== 'undefined')
    {
        return cfg[environment]
    }
    else
    {
        throw new Error('There is not configuration for environment: '+ environment);
    }
};
