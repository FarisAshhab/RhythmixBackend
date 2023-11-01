import MongoService from '@service/Mongo/MongoService';
const mongoService = MongoService();

function MongoCtrl() {
    let ctrl = {
        async queryMongo(body){
            try {
                return await mongoService.queryMongo(body.action, body.data.dataSource, body.data.database, body.data.collection, body.data.pipeline, body.data.filter);
            } catch (e) {
                console.log(e)
                throw e
            }
        },
        async insertMongo(body){
            try {
                return await mongoService.insertMongo(body.action, body.data.dataSource, body.data.database, body.data.collection,body.data.document);
            } catch (e) {
                console.log(e)
                throw e
            }
        }
    }
    return ctrl
}

export default MongoCtrl