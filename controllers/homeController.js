const homeController = {
	welcome(req, res) {
		res.render("home/welcome");
	},

	aboutUs(req, res) {
		res.render("home/aboutUs", { title: "About Us | Food Donate" });
	},

	mission(req, res) {
		res.render("home/mission", { title: "Our mission | Food Donate" });
	},

	contactUs(req, res) {
		res.render("home/contactUs", { title: "Contact us | Food Donate" });
	}
};

module.exports = homeController;
