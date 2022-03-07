/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/vesi/zfioac4_valpec/zfioac4_valpec/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});