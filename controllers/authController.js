const userService = require("../services/userService.js");

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

			await userService.createUser({ firstName, lastName, email, password: password1, role });
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

	postLoginRedirect(req, res) {
		res.redirect(req.session.returnTo || `/${req.user.role}/dashboard`);
	},

	logout(req, res) {
		req.logout(function (err) {
			if (err) {
				req.flash("error", "An error occurred while logging out.");
				return res.redirect("back");
			}
			req.flash("success", "Logged-out successfully");
			res.redirect("/");
		});
	}
};

module.exports = authController;
