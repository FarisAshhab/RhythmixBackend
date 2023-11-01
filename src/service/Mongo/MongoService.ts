import * as dotenv from 'dotenv';
// import AwsService from '@service/Aws/AwsService';
import axios from 'axios';

dotenv.config();
// const awsService = AwsService();
import { MONGO_URL } from '@config/apiURL';

/**
* The Mongo functions in this service are used only for one-off query/inserts e.g. certain logging functions that are only used once (clicks on Reporting feature, etc.). Since these functions are only used once, we will not require strict data validation via Mongoose as in LoggingService. 
* If inserts will be utilized in multiple places and/or require stricter data validation, DO NOT use these services - create its own microservice endpoint. 
*
*/
const MONGO_API_KEY = ''
function MongoService() {
    let sv = {
        async queryMongo(action: string, dataSource: string, database: string, collection: string, pipeline?: any[], filter?: any){   
            // const MONGO_API_KEY = await awsService.getSSMParameter('MONGO_API_KEY')
            var body = {
                dataSource: dataSource,
                database: database,
                collection: collection,
            }
            if (pipeline !== undefined){
                body['pipeline'] = pipeline
            }
            if (filter !== undefined){
                body['filter'] = filter
            }
            const mongoResponse = await axios.post(`${MONGO_URL}/${action}`,
                body,
                {
                    headers: {
                        "api-key": MONGO_API_KEY
                    }
                }
            )
            return mongoResponse.data
        },

        async insertMongo(action: string, dataSource: string, database: string, collection: string, document: any){
            // const MONGO_API_KEY = await awsService.getSSMParameter('MONGO_API_KEY')
            var body = {
                dataSource: dataSource,
                database: database,
                collection: collection,
            }
            if (document !== undefined){
                body['document'] = document
            }
            const mongoResponse = await axios.post(`${MONGO_URL}/${action}`,
                body,
                {
                    headers: {
                        "api-key": MONGO_API_KEY
                    }
                }
            )
            return mongoResponse.data
        }
    }
    return sv
}

export default MongoService;
