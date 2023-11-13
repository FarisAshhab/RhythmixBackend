import { connect } from "mongoose";
import AwsService from "../service/Aws/AwsService"

const awsService = AwsService()
/*
	used to connect to the database, if the connection is already open, it will return the existing connection but if not it will create a new one
*/
let isConnected;
export default async () => {
    const TOKEN = await awsService.fetchCredential("MONGO_URI");

    if (isConnected) {
        console.log("=> using existing database connection");
        return;
    }

    console.log("=> using new database connection");
    return connect(TOKEN).then((db) => {
        isConnected = db.connections[0].readyState;
    });
};
