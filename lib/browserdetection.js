 var BrowserDetectionUtils = (function () {

	var browserDetectionUtils = { };

	browserDetectionUtils.isSafari = 
	    navigator.appVersion.search('Safari') != -1 
	 && navigator.appVersion.search('Chrome') == -1 
	 && navigator.appVersion.search('CrMo') == -1 
	 && navigator.appVersion.search('CriOS') == -1;

	browserDetectionUtils.isIe = (
	    navigator.userAgent.toLowerCase().indexOf("msie") != -1 
	 || navigator.userAgent.toLowerCase().indexOf("trident") != -1 );

	browserDetectionUtils.inMobileMode =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

	return browserDetectionUtils;
	
})();