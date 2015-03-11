// JavaScript Document
function init() {
	document.addEventListener("deviceready", deviceReady, true);
	delete init;
}

function checkPreAuth() {
	console.log("checkPreAuth");
	var form = $("#loginForm");
	if (window.localStorage["c_code"] != undefined) {
		$("#c_code", form).val(window.localStorage["c_code"]);
	}
	if (window.localStorage["username"] != undefined) {
		$("#username", form).val(window.localStorage["username"]);
	}
	if(window.localStorage["c_code"] != undefined && window.localStorage["username"] != undefined){
		handleLogin();
	}
}

function handleLogin() {
	var form = $("#loginForm");
	//disable the button so we can't resubmit while we wait
	$("#submitButton", form).attr("disabled", "disabled");
	var c = $("#c_code", form).val();
	var username = $("#username", form).val();
	if (c != '' && username != '') {
		$.mobile.loading('show', {
			theme: "b"
		});
		$.post("http://www.chiklive.co.il/authentication/check_code.php", { c_code: c, username: username }, function (res) {
			if (res == 'false') {
				//store
				navigator.notification.alert("הקוד לא קיים, נסה שוב", function () { }, " ");
			} else {
				window.localStorage["c_code"] = c;
				window.localStorage["username"] = username;
				window.localStorage["c_name"] = res;
				$.mobile.changePage("app_menu.html");
			}
			$.mobile.loading("hide");
			$("#submitButton").parent().removeClass("ui-btn-active");
			$("#submitButton").removeAttr("disabled");
		}, "json").fail(function(){
			$.mobile.loading("hide");
			$("#submitButton").parent().removeClass("ui-btn-active");
			$("#submitButton").removeAttr("disabled");
		});
	} else {
		if(username == ''){
			navigator.notification.alert("הכנס שם אירוע", function () { }, " ");
		}
		else{
			navigator.notification.alert("הכנס קוד אירוע", function () { }, " ");
		}
		$("#submitButton").parent().removeClass("ui-btn-active");
		$("#submitButton").removeAttr("disabled");
	}
	return false;
}

var pictureSource;   // picture source
var destinationType; // sets the format of returned value

var buttons = ["FB", "TW", "PI"];
var sharer = function(id){
	var urlSharer = function(url, callback){
		window.open(url, "_system");
		if(callback){
			callback();
		}
	}
	var plugins = {
		"shareFB": {
			go: function(callback){
				var linkurl = "http://chiklive.co.il";
				var imgPath = window.uploadedPhoto;
				var url = [
					"http://www.facebook.com/sharer.php?u=",
					imgPath
				];
				urlSharer(url.join(""), callback);
			}
		},
		"shareTW": {
			go: function(callback){
				var imgPath = window.uploadedPhoto;
				imgPath = encodeURI(imgPath);
				var url = [
					"https://twitter.com/intent/tweet?url=",
					imgPath
				];
				urlSharer(url.join(""), callback);
			}
		},
		"sharePI": {
			go: function(callback){
				var imgPath = window.uploadedPhoto;
				imgPath = encodeURI(imgPath);
				var url = [
					"http://pinterest.com/pin/create/button/?media=",
					imgPath
				];
				urlSharer(url.join(""), callback)
			}
		}
	};
	this.go = function(callback){
		console.log(id + " plugin not installed, skipping to callback");
		if(callback){
			callback();
		}
	};
	var plugin = plugins[id];
	if(plugin){
		this.go = plugin.go;
	}
};
var sharing = false;
var doShare = function(e){
	var id = e.currentTarget.classList[0];
	console.log(id);
	console.log("uploading..");
	if(!sharing){
		sharing = true;
		$.mobile.loading('show', {
			theme: "b"
		});
		uploadPhoto();
		window.uploadCallback = function(callback){
			var s = new sharer(id);
			s.go(function(){
				sharing = false;
				console.log("share complete");
				if(callback){
					callback();
				}
			});
		};
	}
};
function deviceReady() {
	pictureSource = navigator.camera.PictureSourceType; // for camera
	destinationType = navigator.camera.DestinationType; // for camera
	console.log("deviceReady");
	$("#loginPage").on("pageinit", function () {
		console.log("pageinit run");
		$("#loginForm").on("submit", handleLogin);
		$("input, select, textarea").bind("focus",function() {
			$(".istudio_footer").hide()
		});
		$("input, select, textarea").bind("blur",function() {
			$(".istudio_footer").show()
		});
		checkPreAuth();
	});
	$.mobile.changePage("#loginPage");
	$(document).delegate(".submitbackbtn", "click", function(){
		$.mobile.changePage("app_menu.html");
	});
};
$(document).delegate('#choose_imagePage', 'pageshow', function () {
	$(".smallImage").attr("src", window.localStorage["temp_cap_image"]);
	for(var i in buttons){
		$(".share" + buttons[i]).on("click", doShare);
	}
	$(document).delegate(".shareNormal", "click", doShare);
});
$(document).delegate("#chooseLocal_imagePage", "pageshow", function () {
	var src = window.localStorage["temp_cap_image"];
	console.log(src);
	$(".smallLocalImage").attr("src", src);
	$(document).delegate("#submitlocalbtn", "click", doShare);
});
$(document).delegate("#app_menuPage", "pageshow", function () {
	var temp_name;
	temp_name = window.localStorage["c_name"];
	$("#cname").html(temp_name);

	var c = window.localStorage["c_code"];
	//var isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
	//if (isAndroid){
		var uploading = false;
		$("#btnSelectLocal").on("click", function(){
			var options = {
		    	quality: 75,
		    	correctOrientation: true,
		    	mediaType: Camera.MediaType.PICTURE,
				encodingType: Camera.EncodingType.JPEG,
				destinationType: navigator.camera.DestinationType.FILE_URI,
				sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
				targetWidth: 1280,
				targetHeight: 1280
			};
			if(!uploading){
				$.mobile.loading('show', {
					theme: "b"
				});
				uploading = true;
				$('#progressSelected').text("מעלה את התמונה...");
			    navigator.camera.getPicture(function(imageURI){
					$.mobile.loading('hide');
					window.localStorage.removeItem("temp_cap_image");
					window.localStorage["temp_cap_image"] = imageURI;
					$.mobile.changePage("select_local_images.html");
			    }, function(message) {
					$.mobile.loading('hide');
			    	console.log('get picture failed');
					$('#progressSelected').text("");
					navigator.notification.alert("שגיאה בהעלת התמונה", function () { }, " ");
			    	uploading = false;
			    }, options);
			}
		});
	/*}
	else{
		console.log("ios");
		var maxfiles = 5;
		var uploader = new plupload.Uploader({
	        runtimes : 'html5',
	        browse_button: "btnSelectLocal",
	        container: "btnSelectLocalContainer", 
	        max_file_count: maxfiles,
	        max_file_size : '10mb',
	        url : 'http://chiklive.co.il/authentication/pl_upload.php?c_code=' + c,
	        filters : [
	            { title: "Image files", extensions: "jpg,gif,png" }
	        ],
	        init: {
	        	Init: function(up, params){
				    console.log("Current runtime environment: " + params.runtime);
	        	},
	        	FilesAdded: function(up, params) {
					$.mobile.loading('show', {
						theme: "b"
					});
	        		$('#progressSelected').html("");
			        console.log("Starting upload.");
			        //up.refresh();
			        up.start();
	            },
	            Error: function(up, err){
				    console.log("Error: " + err.code + ", Message: " + err.message + (err.file ? ", File: " + err.file.name : ""));
	            },
	            FileUploaded: function(up, file, response){
					$.mobile.loading('hide');
			        console.log("File uploaded, File: " + file.name + ", Response: " + response.response);
					// navigator.notification.alert("העלאת התמונות עבר בהצלחה", function () { }, " ");
					$('#progressSelected').html("העלאת התמונות עברה בהצלחה");
	            },
	            UploadProgress: function(up, file){
					var speed = parseInt(up.total.bytesPerSec / 1024);
					var totalUploaded = up.total.loaded / up.total.size * 100;
					$('#progressSelected').html(file.percent + '% ' + speed + 'Kb/s...........' + up.total.percent + '%');
	            }
	        }
	    });
		uploader.init();
	}*/
});

///////////////// upload photo function
window.uploadedPhoto = null;
function uploadPhoto() {
	var form = $("#messageForm");
	//disable the button so we can't resubmit while we wait
	$("#submitbtn", form).attr("disabled", "disabled");
	var comment = $("#comment", form).val();
	////
	var options = new FileUploadOptions();
	options.fileKey = "file";
	var flink = window.localStorage["temp_cap_image"];
	var c = window.localStorage["c_code"];
	options.fileName = flink.substr(flink.lastIndexOf('/') + 1) + '.png';
	options.mimeType = "image/jpeg";
	options.chunkedMode = false;
	options.headers = {
		Connection: "close"
	};
	var params = new Object();

	options.params = params;

	var ft = new FileTransfer();
	var time = (new Date()).getTime();
	window.uploadedPhoto = "http://chiklive.co.il/authentication/images/" + c + "_" + time + "_image.jpg";
	ft.upload(flink, encodeURI("http://chiklive.co.il/authentication/upload.php?c_code=" + c + "&comment=" + comment + "&f_code=" + time), winup, failup, options, true);
}

function winup(r) {
	console.log("Code = " + r.responseCode);
	console.log("Response = " + r.response);
	console.log("Sent = " + r.bytesSent);
	if(window.uploadCallback){
		window.uploadCallback(function(){
			navigator.notification.alert("העלאת התמונות עבר בהצלחה", function () { }, " ");
			$.mobile.changePage("app_menu.html");
		});
	}
	//alert("העלאת התמונות עבר בהצלחה");
}

function failup(error) {
	alert("An error has occurred: Code = " + error.code);
	console.log("upload error source " + error.source);
	console.log("upload error target " + error.target);
}
//////////////////////////////////////////////////////////////////////////////////////

function SelectLocalImages() {
	$.mobile.changePage("select_local_images.html", {
		transition: "fade",
		allowSamePageTransition: true,
		reloadPage: true
	});
}
//////////////////////////////////////////////////////////////////////////////////////

var customPopup = {
	isOpen: false,
	prepareShare: function(e){
		var id = e.currentTarget.classList[0];
		var item = $(".ps-carousel-content .ps-carousel-item")[1];
		window.uploadedPhoto = $(item).find("img").attr("src");

		var s = new sharer(id);
		s.go();
		customPopup.close();
	},
	open: function(){
		var self = this;
    	$("#sheet0parent").fadeIn();
    	this.isOpen = true;
    	for(var i in buttons){
			$(".share" + buttons[i]).on("click", this.prepareShare);
		}
	},
	close: function(noAnimation){
		var self = this;
		if(noAnimation){
			$("#sheet0parent").hide();
		}
		else{
	    	$("#sheet0parent").fadeOut();
	    }
    	this.isOpen = false;
	},
	toggle: function(){
		if(this.isOpen){
			this.close();
		}
		else{
			this.open();
		}
	}
}

function OpenServerImages() {
	$.mobile.changePage("open_server_images.html", {
		transition: "fade",
		allowSamePageTransition: true,
		reloadPage: true
	});

	var c = window.localStorage["c_code"];
	//-----------------------------------------------------------------------
	// 2) Send a http request with AJAX http://api.jquery.com/jQuery.ajax/
	//-----------------------------------------------------------------------
	$.ajax({
		url: 'http://chiklive.co.il/authentication/retrieve_images.php',    //the script to call to get data          
		data: "c_code=" + c,                        //you can insert url argumnets here to pass to api.php
		//for example "id=5&parent=6"
		dataType: 'json',                //data format      
		success: function (data)          //on recieve of reply
		{
			for (var i = 0; i < data.length; i++) {
				//--------------------------------------------------------------------
				// 3) Update html content
				//--------------------------------------------------------------------
				$('#Gallery').append('<li><a href="' + data[i].imageURL + '"><img src="' + data[i].thumbURL+ '" alt="' +'" /></a></li>');
				//$('#output').html("<b>id: </b>"+id+"<b> url: </b>"+url); //Set output element html
				//recommend reading up on jquery selectors they are awesome 
				// http://api.jquery.com/category/selectors/
			}
			var myPhotoSwipe = $("#Gallery a").photoSwipe({
				getToolbar: function(){
					return [
						'<div class="ps-toolbar-close"><div class="ps-toolbar-content"></div></div>',
						'<div class="ps-toolbar-play"><div class="ps-toolbar-content"></div></div>',
						'<div class="ps-toolbar-previous"><div class="ps-toolbar-content"></div></div>',
						'<div class="ps-toolbar-next"><div class="ps-toolbar-content"></div></div>',
						'<div class="psShareButton"><div data-role="actionsheet" data-sheet="sheet0" class="ps-toolbar-content" style="background-image:url(\'res/share.png\');background-size:44px 44px;"></div></div>'
					].join("");
				},
				jQueryMobile: true,
				enableMouseWheel: false,
				enableKeyboard: false,
				captionAndToolbarAutoHideDelay: 0
			});
			myPhotoSwipe.addEventHandler(window.Code.PhotoSwipe.EventTypes.onBeforeHide, function(e) {
			    customPopup.close(true);
			});
			myPhotoSwipe.addEventHandler(window.Code.PhotoSwipe.EventTypes.onShow, function(e) {
			    $(document).off('touchend', '.psShareButton div').on('touchend', '.psShareButton div', function(){
			    	customPopup.toggle();
			    });
			});
		}
	});

}
///////////////////////////////////////////////////////// above this authentication code
///////////////////////////////////////////////////////// below this camera code starts
// Called when a photo is successfully retrieved
function onPhotoDataSuccess(imageData) {
	$.mobile.loading('show', {
		theme: "b"
	});
	var smallImage = document.getElementById('smallImage');
	// smallImage.style.display = 'block';
	// smallImage.src = imageData;
	window.localStorage.removeItem("temp_cap_image");
	window.localStorage["temp_cap_image"] = imageData;
	$.mobile.changePage("choose_image.html");
}

function onPhotoURISuccess(imageURI) {
	var largeImage = document.getElementById('largeImage');
	largeImage.style.display = 'block';
	largeImage.src = imageURI;
}

function capturePhoto() {
	// Take picture using device camera and retrieve image as base64-encoded string
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
		quality: 75,
		encodingType: Camera.EncodingType.JPEG,
		destinationType: destinationType.FILE_URI,
		targetWidth: 1280,
		targetHeight: 1280,
		saveToPhotoAlbum: true,
		correctOrientation: true
	});
}

function capturePhotoEdit() {
	// Take picture using device camera, allow edit, and retrieve image as base64-encoded string
	navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
		quality: 20,
		allowEdit: true,
		destinationType: destinationType.DATA_URL,
		correctOrientation: true
	});
}

function getPhoto(source) {
	// Retrieve image file location from specified source
	navigator.camera.getPicture(onPhotoURISuccess, onFail, {
		quality: 50,
		destinationType: destinationType.FILE_URI,
		sourceType: source,
		correctOrientation: true
	});
}

function onFail(message) {
	//alert('Failed because: ' + message);
}
//////////////////////////////////////////////////////////////////////// camera code ends
/////////////////////////////////////////
/////////////////////////////////////////
$(document).delegate('#local_images_page', 'pageshow', function () {
	var c = window.localStorage["c_code"];
	var maxfiles = 2;
	$("#uploader").pluploadQueue({
		// General settings
		runtimes: 'html5',
		max_file_count: maxfiles,
		url: 'http://chiklive.co.il/authentication/pl_upload.php?c_code=' + c,
		max_file_size: '10mb',
		chunk_size: '1mb',
		unique_names: true,

		// Resize images on clientside if we can
		//resize : {width : 280, height : 240, quality : 90, crop: true},

		// Specify what files to browse for
		filters: [
			{ title: "Image files", extensions: "jpg,gif,png" }
		],
		init: {
			PostInit: function () {
				$('#uploader_browse').text('בחירת תמונות');
				$('.plupload_start').text('העלאת תמונות');
			}
		},
		// Flash settings
		flash_swf_url: '/plupload/js/plupload.flash.swf',

		// Silverlight settings
		silverlight_xap_url: '/plupload/js/plupload.silverlight.xap'

	});
	// Client side form validation
	$('form').submit(function (e) {
		var uploader = $('#uploader').pluploadQueue();
		console.log("form submit");
		// Files in queue upload them first
		if (uploader.files.length > 0) {
			// When all files are uploaded submit form
			uploader.bind('StateChanged', function () {
				if (uploader.files.length === (uploader.total.uploaded + uploader.total.failed)) {
					$('form')[0].submit();
				}
			});

			uploader.start();
		} else {
			alert('You must add at least one image.');
		}

		return false;
	});
});
///////////////////////////////
document.addEventListener("backbutton", function () {
	if ($('.ui-page-active').attr('id') == 'app_menuPage') {
		exitAppPopup();
	} else {
		history.back();
	}
}, false);
/////////////////////////////////
document.addEventListener("backbutton", function () {
	if ($('.ui-page-active').attr('id') == 'loginPage') {
		exitAppPopup();
	} else {
		//history.back();
		exitAppPopup();
	}
}, false);
/////////////////////////////////
function exitAppPopup() {
	navigator.notification.confirm(
          'האם אתה בטוח שאתה רוצה לצאת?'
        , function (button) {
        	if (button == 2) {
        		if (window.localStorage["c_code"]) { 
        			window.localStorage.removeItem("c_code");
        		}
        		if (window.localStorage["username"]) { 
        			window.localStorage.removeItem("username");
        		}
        		navigator.app.exitApp();
        	}
        }
        , 'יציאה'
        , 'לא,כן'
    );
	return false;
}

/////////// GOVNOKOD ends

