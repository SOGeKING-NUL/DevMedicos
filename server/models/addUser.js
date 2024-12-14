const { connectDB, closeDB, addUser, verifyUser } = require("../utils/connect_user_db.js")




const username = "TestUser3";
const password = "GNX@2024";





(async () => {
    try {
        await connectDB();

        await addUser(username, password);
        
        const token = await verifyUser(username, password);
        
        if (token) {
            console.log("JWT Token:", token);  
        } else {
            console.log("Authentication failed or password is incorrect.");
        }
    } catch (err) {
        console.error("Error during user operations:", err);
    } finally {

        await closeDB();
    }
})();