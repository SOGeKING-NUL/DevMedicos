const { app } = require("express")();
const sqlite = require("sqlite3").verbose();        //verbose makes debugging easier

const db=  new sqlite.Database("./DevMedicos.db", (err)=>{
    if(err){
        console.log(err.message);  //API
    }
    else{
        console.log("you are connected")  ;  //API
    }
})


