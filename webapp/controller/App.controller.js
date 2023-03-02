sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.vesi.zfac4_valtoker.controller.App", {
		onInit: function () {
			var sLang = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase(),
				aImplementedLanguage = ["FR", "EN"];
			sLang = sLang.slice(0, 2);
			if (aImplementedLanguage.indexOf(sLang) === -1) {
				sap.ui.getCore().getConfiguration().setLanguage("en");
			}
		}
	});
});