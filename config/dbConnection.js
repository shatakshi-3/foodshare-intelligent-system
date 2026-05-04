const mongoose = require("mongoose");

const connectDB = async() => {
	try
	{
		const db = process.env.MONGO_URI;
		if (!db) {
			console.error("MONGO_URI is not defined in .env");
			process.exit(1);
		}
		await mongoose.connect(db);
		console.log("MongoDB connected...");
	}
	catch(err)
	{
		console.log(err);
		process.exit(1);
	}
}

module.exports = connectDB;