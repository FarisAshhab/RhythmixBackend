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
            var params = {
                Name: parameter
            }
        
            var request = await ssmClient.getParameter(params).promise();
            return request.Parameter.Value;
        },

        async uploadToBucket(key, body, bucket, contentType) {
            const S3 = new AWS.S3()
            try {
                const params = {
                    Key: key,
                    Body: body,
                    Bucket: bucket,
                    ContentType: contentType
                }
                return await S3.upload(params).promise()
            } catch (e) {
                console.log(e)
                throw e
            }
        }

    }

    return sv
}

export default AwsService; 



