/* globals $, feather */

feather.replace();

// #region Event handlers


$("#menu-button").click(() => {
	toggleSideMenu();
});


$("#theme-button").click(() => {
	switchTheme();
});


// #endregion

/** Open and close the side menu */
let toggleSideMenu = () => {
	if ($("#side-menu").attr("data-open")) {
		$("#side-menu")[0].style.width = "0px";
		$("#side-menu").removeAttr("data-open");
	} else {
		$("#side-menu")[0].style.width = "250px";
		$("#side-menu").attr("data-open", true);
	}
};

/** Change the app theme */
let switchTheme = () => {
	let switchToLightTheme = $("#theme-button").attr("data-theme") === "dark";
	if (switchToLightTheme) {
		$(":root").css("--main-color", "white");
		$(":root").css("--background-color", "hsla(0, 0%, 90%, 1)");
		$(":root").css("--semi-transparent-hover", "hsla(0, 0%, 30%, 0.3)");
		$(":root").css("--text-color", "hsla(0, 0%, 20%, 1)");
		$(":root").css("--icon-color", "hsla(0, 0%, 20%, 1)");
		$("#light-theme-icon").css("display", "none");
		$("#dark-theme-icon").css("display", "initial");

	} else {
		$(":root").css("--main-color", "hsla(0, 0%, 20%, 1)");
		$(":root").css("--background-color", "hsla(0, 0%, 15%, 1)");
		$(":root").css("--semi-transparent-hover", "hsla(0, 0%, 70%, 0.3)");
		$(":root").css("--text-color", "hsla(0, 0%, 90%, 1)");
		$(":root").css("--icon-color", "hsla(0, 0%, 90%, 1)");
		$("#light-theme-icon").css("display", "initial");
		$("#dark-theme-icon").css("display", "none");
	}

	$("#theme-button").attr("data-theme", switchToLightTheme ? "light" : "dark");
};
