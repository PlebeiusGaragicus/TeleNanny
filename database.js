// const { MongoClient } = require('mongodb');
import { MongoClient } from 'mongodb';

const uri = "mongodb://localhost:27017/test";
const client = new MongoClient(uri, { useNewUrlParser: true });

async function performOperations() {
    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("devices");
        // Insert a single document
        await collection.insertOne({ device: "mobile", status: "active" });
        console.log("Document inserted");
        // Find all documents in the collection
        const docs = await collection.find({}).toArray();
        console.log(docs);
        // Update a single document
        await collection.updateOne({ device: "mobile" }, { $set: { status: "inactive" } });
        console.log("Document updated");
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

performOperations();








const devices = [
    { deviceId: "device1", ipAddress: "192.168.1.100", status: "active", miningCapacity: 10 },
    { deviceId: "device2", ipAddress: "192.168.1.101", status: "active", miningCapacity: 20 },
    { deviceId: "device3", ipAddress: "192.168.1.102", status: "inactive", miningCapacity: 30 }
];

async function insertDevices() {
    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("devices");
        // Insert multiple documents
        await collection.insertMany(devices);
        console.log("Devices inserted");
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

insertDevices();




async function updateDeviceStatus(deviceId, status) {
    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("devices");
        // Update a single document
        await collection.updateOne({ deviceId: deviceId }, { $set: { status: status } });
        console.log("Device status updated");
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

updateDeviceStatus("device1", "inactive");





async function getDevices() {
    try {
        await client.connect();
        const db = client.db("test");
        const collection = db.collection("devices");
        // Find all documents in the collection
        const devices = await collection.find({}).toArray();
        console.log(devices);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

getDevices();



