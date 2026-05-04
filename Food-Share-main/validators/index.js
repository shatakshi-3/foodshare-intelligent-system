const Joi = require("joi");

const signupSchema = Joi.object({
	firstName: Joi.string().trim().min(1).max(50).required()
		.messages({ "string.empty": "First name is required" }),
	lastName: Joi.string().trim().min(1).max(50).required()
		.messages({ "string.empty": "Last name is required" }),
	email: Joi.string().trim().email().required()
		.messages({ "string.email": "Please enter a valid email" }),
	password1: Joi.string().min(4).max(128).required()
		.messages({ "string.min": "Password must be at least 4 characters" }),
	password2: Joi.string().valid(Joi.ref("password1")).required()
		.messages({ "any.only": "Passwords do not match" }),
	role: Joi.string().valid("admin", "donor", "agent").required()
		.messages({ "any.only": "Invalid role selected" })
});

const donationSchema = Joi.object({
	foodType: Joi.string().trim().min(1).max(200).required()
		.messages({ "string.empty": "Food type is required" }),
	quantity: Joi.number().positive().required()
		.messages({
			"number.base": "Quantity must be a number",
			"number.positive": "Quantity must be a positive number"
		}),
	cookingTime: Joi.date().iso().required()
		.messages({ "date.format": "Invalid cooking time format" }),
	address: Joi.string().trim().min(1).max(500).required()
		.messages({ "string.empty": "Address is required" }),
	phone: Joi.number().integer().min(1000000000).max(9999999999).required()
		.messages({ "number.base": "Phone must be a 10-digit number" }),
	donorToAdminMsg: Joi.string().trim().max(1000).allow("", null)
});

const profileSchema = Joi.object({
	firstName: Joi.string().trim().min(1).max(50).required()
		.messages({ "string.empty": "First name is required" }),
	lastName: Joi.string().trim().min(1).max(50).required()
		.messages({ "string.empty": "Last name is required" }),
	gender: Joi.string().valid("male", "female").allow("", null),
	address: Joi.string().trim().max(500).allow("", null),
	phone: Joi.number().integer().min(1000000000).max(9999999999).allow(null)
		.messages({ "number.base": "Phone must be a 10-digit number" })
});

const recipientSchema = Joi.object({
	name: Joi.string().trim().min(1).max(200).required()
		.messages({ "string.empty": "Organization name is required" }),
	type: Joi.string().valid("ngo", "shelter", "community_kitchen", "orphanage", "other").required()
		.messages({ "any.only": "Please select a valid organization type" }),
	location: Joi.string().trim().min(1).max(500).required()
		.messages({ "string.empty": "Location is required" }),
	contactName: Joi.string().trim().min(1).max(100).required()
		.messages({ "string.empty": "Contact person name is required" }),
	contactEmail: Joi.string().trim().email().required()
		.messages({ "string.email": "Please enter a valid contact email" }),
	contactPhone: Joi.number().integer().min(1000000000).max(9999999999).required()
		.messages({ "number.base": "Phone must be a 10-digit number" })
});

const demandSchema = Joi.object({
	recipient: Joi.string().trim().required()
		.messages({ "string.empty": "Please select a recipient" }),
	foodType: Joi.string().trim().min(1).max(200).required()
		.messages({ "string.empty": "Food type is required" }),
	quantityNeeded: Joi.number().positive().required()
		.messages({
			"number.base": "Quantity must be a number",
			"number.positive": "Quantity must be a positive number"
		}),
	urgency: Joi.string().valid("low", "medium", "high").required()
		.messages({ "any.only": "Please select a valid urgency level" }),
	location: Joi.string().trim().min(1).max(500).required()
		.messages({ "string.empty": "Location is required" }),
	notes: Joi.string().trim().max(1000).allow("", null)
});

function validate(schema) {
	return (req, res, next) => {
		// Determine the data object to validate — handles both nested (donation[field]) and flat body
		let data;
		if (req.body.donation) {
			data = req.body.donation;
		} else if (req.body.donor) {
			data = req.body.donor;
		} else if (req.body.admin) {
			data = req.body.admin;
		} else if (req.body.agent) {
			data = req.body.agent;
		} else if (req.body.recipient) {
			data = req.body.recipient;
		} else if (req.body.demand) {
			data = req.body.demand;
		} else {
			data = req.body;
		}

		const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

		if (error) {
			const errors = error.details.map(d => ({ msg: d.message }));

			// For form submissions, flash errors and redirect back
			if (req.headers["content-type"]?.includes("application/x-www-form-urlencoded")) {
				req.flash("error", errors.map(e => e.msg).join(". "));
				return res.redirect("back");
			}

			return res.status(400).json({ errors });
		}

		// Store validated data for downstream use
		req.validatedBody = value;
		next();
	};
}

module.exports = { signupSchema, donationSchema, profileSchema, recipientSchema, demandSchema, validate };
