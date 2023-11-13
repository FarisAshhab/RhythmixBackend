var AWS = require('aws-sdk')
import axios from "axios";
import * as dotenv from 'dotenv'

dotenv.config()
console.log('AWS_APPLICATION_CREDENTIALS:', process.env.AWS_APPLICATION_CREDENTIALS);
AWS.config.credentials = JSON.parse(process.env.AWS_APPLICATION_CREDENTIALS)
console.log(process.env.AWS_APPLICATION_CREDENTIALS)
const ssmClient = new AWS.SSM({
    apiVersion: '2014-11-06',
    region: 'us-east-2'
})



function AwsService() {

    let sv = {
        
        async fetchCredential(parameter){
            console.log(ssmClient);
            console.log(AWS.config)
            var params = {
                Name: parameter
            }
        
            var request = await ssmClient.getParameter(params).promise();
            return request.Parameter.Value;
        }

    }

    return sv
}

export default AwsService; 



