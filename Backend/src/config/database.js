const mongoose = require("mongoose")

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
    }
    catch (err) {
        throw err
    }
}

module.exports = connectToDB