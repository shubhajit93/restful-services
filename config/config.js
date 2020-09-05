

const config = {

    appInfo : {
        ip:"",
        port:'',
        dbtype: ''
    },
    
    operatorInfo : {
        op_name:''
    },

    serviceInfo : {
        serviceID : ""
    },
    
    urls : {

        smslogInUrl:'',
        refreshUrl:'',
        sendSmsOnlineUrl:'',
        dpplogInUrl:'',
        dppRegistryUrl : "",
        mailServerUrl : ""
    
    },
    
    headers_parameters : {
        sms:{
            oauth_client_key:'',
            device_id:'',
        // -------------------------------------------------------------
        // These four parameters are needed to generate signature. 
            username:'',
            password:'',
            secret_key:'' ,
            a_url:'',
        // --------------------------------------------------------------- 
            source_channel: '',
            country_code: ''
        },
        dpp:{
            oauth_client_key:'',
            device_id:'',
        // -------------------------------------------------------------
        // These four parameters are needed to generate signature. 
            username:'',
            password:'',
            secret_key:'' ,
            a_url:'',
        // --------------------------------------------------------------- 
            source_channel: '',
            country_code: ''
    
        }
    
    },
        
    smsRequest_parameters : {
    
        applnType: '',
        profile: '',
        subProfile: '',
        languageType: ''
    
    },
    
    smsHandlerInfo : {
    
        jsonEnable:'',
        method:'',
        baseUrl:''
    
    },
    
    mailHandlerInfo : {
        mailServerEnable : true,
        mailServerInfo:{
            host: '', 
            port: '', 
            secure: '', 
            auth: {
                user: '', 
                pass: '', 
            }
        },
        mailerAPIIinfo : {
            url : "",
            API_key : ""
        } 
    },
    
    notificationHandlerInfo : {
        firebaseInfo : {
    
            credential: {
                serverKey: ""
            },
        
            sendUrl:   '' 
    
        }
    
    },
    
    mysqlDB : {
        host: '',
        database: '',
        user: '',
        password: '',
        port: '',
        acquireTimeout: '',
        dateStrings: true,
        multipleStatements: true
    },
    
    redisDB : {
        host: '',
        port: '',
        password: ''
    }
    
    
}


module.exports = config;
