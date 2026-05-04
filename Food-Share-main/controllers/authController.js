const userService = require("../services/userService.js");
const auditService = require("../services/auditService.js");

const authController = {
	getSignup(req, res) {
		res.render("auth/signup", { title: "User Signup" });
	},

	async postSignup(req, res) {
		const { firstName, lastName, email, password1, role } = req.validatedBody;

		try {
			const existingUser = await userService.findByEmail(email);
			if (existingUser) {
				req.flash("error", "This Email is already registered. Please try another email.");
				return res.render("auth/signup", {
					title: "User Signup",
					firstName, lastName, errors: [{ msg: "This Email is already registered." }], email, password1, password2: password1
				});
			}

			const newUser = await userService.createUser({ firstName, lastName, email, password: password1, role });
			await auditService.log({
				action: "user_registered",
				performedBy: newUser._id,
				targetModel: "user",
				targetId: newUser._id,
				details: { email, role },
				ipAddress: req.ip
			});
			req.flash("success", "You are successfully registered and can log in.");
			res.redirect("/auth/login");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	getLogin(req, res) {
		res.render("auth/login", { title: "User login" });
	},

	async postLoginRedirect(req, res) {
		await auditService.log({
			action: "user_login",
			performedBy: req.user._id,
			targetModel: "user",
			targetId: req.user._id,
			details: { role: req.user.role },
			ipAddress: req.ip
		});
		res.redirect(req.session.returnTo || `/${req.user.role}/dashboard`);
	},

	logout(req, res) {
		const userId = req.user?._id;
		req.logout(async function (err) {
			if (err) {
				req.flash("error", "An error occurred while logging out.");
				return res.redirect("back");
			}
			if (userId) {
				await auditService.log({
					action: "user_logout",
					performedBy: userId,
					targetModel: "user",
					targetId: userId,
					ipAddress: req.ip
				});
			}
			req.flash("success", "Logged-out successfully");
			res.redirect("/");
		});
	}
};

module.exports = authController;
