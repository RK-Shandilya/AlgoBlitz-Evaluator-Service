import express, { Express } from 'express';
import serverConfig from './config/server.config.js'

const app: Express =express();
console.log("hello");

app.listen(serverConfig.PORT, ()=> {
    console.log(`Server is running at ${serverConfig.PORT}`)
})