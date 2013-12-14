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
            name : ''
        },
        googleApi:{
            clientID: '',
            clientSecret: '',
            callbackURL: "http://showcom.herokuapp.com/login/google/callback"
        },
        mailer:{
            from: 'no-reply@example.com',
            host: 'smtp.gmail.com', // hostname
            secureConnection: true, // use SSL
            port: 465, // port for secure SMTP
            transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
            auth: {
                user: '',
                pass: ''
            }
        }
    },
    local:{
        http:{
            host:'http://show.adombrovsky.name',
            port:5000
        },
        db:{
            user : '',
            pass : '',
            host : '',
            name : ''
        },
        googleApi:{
            clientID: '',
            clientSecret: '',
            callbackURL: "http://show.adombrovsky.name/login/google/callback"
        },
        mailer:{
            from: '',
            host: 'smtp.gmail.com', // hostname
            secureConnection: true, // use SSL
            port: 465, // port for secure SMTP
            transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
            auth: {
                user: '',
                pass: ''
            }
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
