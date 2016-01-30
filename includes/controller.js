var Gender = {
	MALE : 0,
	FEMALE : 1
};

var values;

var loadCalculator = function() {
	var assumption_val = commaSeparateNumber(getUserProperty("assumption_pens"));
	$('#assumpTxt').html(assumption_val);
	var gender = getUserProperty("gender");
	$('document').ready(function() {
		var queryDict = {};
		location.search.substr(1).split("&").forEach(function(item) {
			queryDict[item.split("=")[0]] = item.split("=")[1];
		});
		var isBack = (queryDict['back'] == "true");
		$.getJSON("includes/data.json", function(data) {
			calculator_params = data["calculator_scales"];
			initParams(calculator_params);
			values = new Array(calculator_params.length);
			for (var i = 0; i < calculator_params.length; i++) {
				var id = "range" + i;
				var sHTML = '<section class="slider"><section class="questionContainer"><p>';
				if (gender == Gender.MALE) {
					sHTML += calculator_params[i]["male_q"];
				} else if (gender == Gender.FEMALE) {
					sHTML += calculator_params[i]["female_q"];
				}
				sHTML += '</p></section><section class="expContainer"><p>';
				sHTML += calculator_params[i]["exp"];
				sHTML += '</p></section><input type="text" id="' + id + '" value="" name="range"></section><section class="hrLine"></section>';
				var slider = $(sHTML);
				$("#sliders").append(slider);
				if (isBack) {
					calculator_params[i]["default"] = getUserProperty(id);
					console.log(id + ": " + calculator_params[i]["default"]);
				}
				if (calculator_params[i]["is_fixed"]) {
					calculator_params[i]["default"] = translateDefault(i, calculator_params[i]["default"]);
					createFixedSlider(i, calculator_params[i]);
				} else {
					createSlider(i, calculator_params[i]);
				}
			}
			var btn = '<section class="continueBtn"><section class="continueBtnTxt">עבור לתוצאות המחשבון</section></section>';
			if (getUserProperty("gender") == Gender.FEMALE) {
				btn = '<section class="continueBtn"><section class="continueBtnTxt">עברי לתוצאות המחשבון</section></section>';
			}
			$("#sliders").append(btn);
			$('.continueBtn').click(function() {
				setUserProperty("result_pens", pens_finite);
				saveUserResults();
				if (!isBack) {
					var user_pension_val = $('#pensionTxt').text();
					var user_pension_result = parseInt(user_pension_val.replace(',', ''));
					var salary = values[0];
					var dbgender;
					(getUserProperty("gender") == Gender.MALE) ? dbgender = "Male" : dbgender = "Female";
					var duration = Number(values[1]) + Number(getUserProperty("pre_years"));
					var pens_perc = values[3];
					var emp_perc = values[4];
					var mng_mon = values[7];
					var mng_year = values[8];
					var data = {
						'result' : user_pension_result,
						'salary' : salary,
						'gender' : dbgender,
						'duration' : duration,
						'pens_perc' : pens_perc,
						'emp_perc' : emp_perc,
						'mng_mon' : mng_mon,
						'mng_year' : mng_year
					};
					console.log(data);
					$.post("processDB.php", data, function(response, status) {// Required Callback Function
						//"response" receives - whatever written in echo of above PHP script.
						//alert("*----Received Data----*\n\nResponse : " + response + "\n\nStatus : " + status);
						//window.location.href = 'finish.php';
					});
				}
				window.location.href = 'finish.html';
			});
			getParams();
			calculate();
		});
	});
};

// on fixed slider, we need to translate the array index to the actual value
var translateDefault = function(i, def) {
	switch(i) {
	case 3:
		if (Number(def) == 5.5)
			return 0;
		else if (Number(def) == 6)
			return 1;
		else
			return 2;
		break;
	case 4:
		if (Number(def) == 11)
			return 0;
		else if (Number(def) == 12)
			return 1;
		else
			return 2;
		break;
	default:
		return 0;
	}
};

// save all user inputs to value array
var saveUserResults = function() {
	for (var i = 0; i < values.length; i++) {
		var id = "range" + i;
		setUserProperty(id, values[i]);
	}
};

// create slider with fixed values
var createFixedSlider = function(id, scale) {
	console.log(id + ": " + scale["default"]);
	$("#range" + id).ionRangeSlider({
		keyboard : true,
		min : scale["min_val"],
		max : scale["max_val"],
		from : scale["default"],
		type : 'single',
		values : scale["values"],
		prefix : scale["prefix"],
		grid_num : id,
	});
	$("#range" + id).on("change", function() {
		var $this = $(this),
		    value = $this.prop("value");
		values[id] = value;
		getParams();
		calculate();
	});
	$("#range" + id).on("update", function() {
		var $this = $(this),
		    value = $this.prop("value");
		values[id] = value;
		getParams();
		calculate();
	});
	$("#range" + id).on("finish", function() {
		var $this = $(this),
		    value = $this.prop("value");
		values[id] = value;
		getParams();
		calculate();
	});
	values[id] = $("#range" + id).prop("value");
};

// create slider with range values
var createSlider = function(id, scale) {
	console.log(id + ": " + scale["default"]);
	var from = scale["default"];
	if (id == 0) {
		from = salary;
	} else if (id == 9) {
		from = savings;
	}
	$("#range" + id).ionRangeSlider({
		keyboard : true,
		min : scale["min_val"],
		max : scale["max_val"],
		from : from,
		type : 'single',
		step : scale["steps"],
		prefix : scale["prefix"],
		grid_num : id,
		onChange : function(data) {
			var $this = $(this);
			values[$this.prop("grid_num")] = data.from;
			getParams();
			calculate();
		},
		onUpdate : function(data) {
			var $this = $(this);
			values[$this.prop("grid_num")] = data.from;
			getParams();
			calculate();
		},
		onFinish : function(data) {
			var $this = $(this);
			values[$this.prop("grid_num")] = data.from;
			getParams();
			calculate();
		}
	});
	values[id] = $("#range" + id).prop("value");
};

// store user value in local storage
var setUserProperty = function(property, value) {
	localStorage.setItem(property, value);
};

// get user value from local storage
var getUserProperty = function(property) {
	return localStorage.getItem(property);
};

var getUserGender = function() {
	window.onload = function() {
		$("#male").click(function() {
			setUserProperty("gender", Gender.MALE);
			window.location.href = 'question2.html';
		}).css("cursor", "pointer");
		$("#female").click(function() {
			setUserProperty("gender", Gender.FEMALE);
			window.location.href = 'question2.html';
		}).css("cursor", "pointer");
	};
};

var goToCalculator = function() {
	window.location.href = 'calculator.html';
};

// generate output for user after calculator page
var generateResult = function() {
	var asmp = Number(getUserProperty("assumption_pens"));
	var pens = Number(getUserProperty("result_pens"));
	$('#assumpTxt').html(commaSeparateNumber(asmp));
	$('#pensionTxt').html(commaSeparateNumber(pens));
	resizeResultContainer(pens);
	var diff = asmp - pens;
	$('document').ready(function() {
		$.getJSON("includes/data.json", function(data) {
			var resp_txt,
			    small,
			    big,
			    i,
			    gender_index = "male";
			console.log(data);
			if (diff > 0) {
				i = 0;
				if (getUserProperty("gender") == Gender.FEMALE) {
					gender_index = "female";
					$('.continueBtnTxt').html('חזרי למחשבון');
					$('.shareTxt').html('שתפי');

				}
			} else {
				i = 1;
				if (getUserProperty("gender") == Gender.FEMALE) {
					gender_index = "female";
					$('.continueBtnTxt').html('חזרי למחשבון');
					$('.shareTxt').html('שתפי');
				}
			}
			resp_txt = data["response"][i][gender_index]["text"];
			big = data["response"][i][gender_index]["big"];
			small = data["response"][i][gender_index]["small"];
			console.log(resp_txt);
			console.log(big);
			console.log(small);
			$('#result_text_pens').html(getUserProperty("result_pens"));
			$('#result_text_assump').html(getUserProperty("assumption_pens"));
			$('.txt').html(resp_txt);
			$('.bigTlt').html(big);
			$('.smallTlt').html(small);
			$('.continueBtn').click(function() {
				window.location.href = "calculator.html?back=true";
			});
			attachSocialPlugins();
		});
	});
};

var shareWhatsapp = function() {
	// Share via whatsapp
	$(document).on("click", '.whatsapp', function() {
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			var text = $(this).attr("data-text");
			var url = $(this).attr("data-link");
			var message = encodeURIComponent(text) + " - " + encodeURIComponent(url);
			var whatsapp_url = "whatsapp://send?text=" + message;
			window.location.href = whatsapp_url;
		} else {
			alert("Please use a Mobile Device to Share this App");
		}
	});
};

var attachSocialPlugins = function() {
	shareWhatsapp();

	// Share via facebook
	$('.facebook').snsShare('בדקו את הפנסיה שלכם במחשבון הפנסיה של כלכליסט', 'http://shenkar.html5-book.co.il/2015-2016/lab/dev_13/');

	// Share via email
	$(document).on("click", '.email', function() {
		window.location.href = "mailto:?subject=כשתהיו בני 67&body=בדקו את הפנסיה שלכם במחשבון הפנסיה של כלכליסט http://shenkar.html5-book.co.il/2015-2016/lab/dev_13/";
	});

	// download excell
	$(document).on("click", '.excell', function() {
		// **************** get user parameters!!!! ************************
		var data = generateData();
		//var data = [{"Vehicle":"BMW","Date":"30, Jul 2013 09:24 AM","Location":"Hauz Khas, Enclave, New Delhi, Delhi, India","Speed":42},{"Vehicle":"Honda CBR","Date":"30, Jul 2013 12:00 AM","Location":"Military Road,  West Bengal 734013,  India","Speed":0},{"Vehicle":"Supra","Date":"30, Jul 2013 07:53 AM","Location":"Sec-45, St. Angel's School, Gurgaon, Haryana, India","Speed":58},{"Vehicle":"Land Cruiser","Date":"30, Jul 2013 09:35 AM","Location":"DLF Phase I, Marble Market, Gurgaon, Haryana, India","Speed":83},{"Vehicle":"Suzuki Swift","Date":"30, Jul 2013 12:02 AM","Location":"Behind Central Bank RO, Ram Krishna Rd by-lane, Siliguri, West Bengal, India","Speed":0},{"Vehicle":"Honda Civic","Date":"30, Jul 2013 12:00 AM","Location":"Behind Central Bank RO, Ram Krishna Rd by-lane, Siliguri, West Bengal, India","Speed":0},{"Vehicle":"Honda Accord","Date":"30, Jul 2013 11:05 AM","Location":"DLF Phase IV, Super Mart 1, Gurgaon, Haryana, India","Speed":71}];
		// *****************************************************************
		JSONToCSVConvertor(data, "", true);
	});
};

var putBackLink = function() {
	$('document').ready(function() {
		// modify back link
		var queryDict = {};
		location.search.substr(1).split("&").forEach(function(item) {
			queryDict[item.split("=")[0]] = item.split("=")[1];
		});
		//queryDict['ref']
		$("#backlink").attr("href", queryDict['ref']+".html");
		
		// attach social plugins
		shareWhatsapp();
	
		// Share via facebook
		$('.facebook').snsShare('בדקו את הפנסיה שלכם במחשבון הפנסיה של כלכליסט', 'http://shenkar.html5-book.co.il/2015-2016/lab/dev_13/');
	
		// Share via email
		$(document).on("click", '.email', function() {
			window.location.href = "mailto:?subject=כשתהיו בני 67&body=בדקו את הפנסיה שלכם במחשבון הפנסיה של כלכליסט http://shenkar.html5-book.co.il/2015-2016/lab/dev_13/";
		});
		
	});
};

// data for csv file
var generateData = function() {
	var data = new Array(1);
	data[0] = {};
	data[0]["Salary"] = getUserProperty("range0");
	data[0]["Years_of_savings"] = getUserProperty("range1");
	data[0]["Future_salary"] = getUserProperty("range2");
	data[0]["Pension_percentage"] = Number(getUserProperty("range3")) + Number(getUserProperty("range4"));
	data[0]["Annual_return"] = getUserProperty("range5");
	data[0]["Severance_pay_withdraw"] = getUserProperty("range6");
	data[0]["Management_fee_per_month"] = getUserProperty("range7");
	data[0]["Management_fee_per_year"] = getUserProperty("range8");
	data[0]["Savings"] = getUserProperty("range9");
	data[0]["Pension_assumptiom"] = getUserProperty("assumption_pens");
	data[0]["Future_pension"] = getUserProperty("result_pens");
	return data;
};

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
	// If JSONData is not an object then JSON.parse will parse the JSON string in an Object
	var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
	var CSV = '';
	// Set Report title in first row or line

	CSV += ReportTitle + '\r\n\n';

	//This condition will generate the Label/Header
	if (ShowLabel) {
		var row = "";
		//This loop will extract the label from 1st index of on array
		for (var index in arrData[0]) {
			//Now convert each value to string and comma-seprated
			row += index + ',';
		}
		row = row.slice(0, -1);
		//append Label row with line break
		CSV += row + '\r\n';
	}

	console.log(CSV);

	//1st loop is to extract each row
	for (var i = 0; i < arrData.length; i++) {
		var row = "";
		//2nd loop will extract each column and convert it in string comma-seprated
		for (var index in arrData[i]) {
			row += '"' + arrData[i][index] + '",';
		}
		row.slice(0, row.length - 1);
		//add a line break after each row
		CSV += row + '\r\n';
	}

	if (CSV == '') {
		alert("Invalid data");
		return;
	}

	//Generate a file name
	var fileName = "my_pension";
	//this will remove the blank-spaces from the title and replace it with an underscore
	fileName += ReportTitle.replace(/ /g, "_");

	//Initialize file format you want csv or xls
	var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

	//this trick will generate a temp <a /> tag
	var link = document.createElement("a");
	link.href = uri;

	//set the visibility hidden so it will not effect on your web-layout
	link.style = "visibility:hidden";
	link.download = fileName + ".csv";

	//this part will append the anchor tag and remove it after automatic click
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

// resize results baloon 
var resizeResultContainer = function(pension) {
	var assumption_val = commaSeparateNumber(getUserProperty("assumption_pens"));
	if (assumption_val.length > 7 && $('#assumpContainer').hasClass('smaller')) {
		$('#pensionTxtContainer').removeClass();
		$('#pensionTxtContainer').addClass('smallTxt');
	} else {
		$('#pensionTxtContainer').removeClass();
		$('#pensionTxtContainer').addClass('regularTxt');
	}
	if (Number(getUserProperty("assumption_pens")) < Number(pension)) {
		$('#assumpContainer').removeClass();
		$('#assumpContainer').addClass('smaller');
		$('#pensionContainer').removeClass();
		$('#pensionContainer').addClass('bigger');
		$('#resultsArrow').removeClass();
		$('#resultsArrow').addClass('pinkArrow');
	} else {
		$('#assumpContainer').removeClass();
		$('#assumpContainer').addClass('bigger');
		$('#pensionContainer').removeClass();
		$('#pensionContainer').addClass('smaller');
		$('#resultsArrow').removeClass();
		$('#resultsArrow').addClass('whiteArrow');
	}
};

var commaSeparateNumber = function(val) {
	while (/(\d+)(\d{3})/.test(val.toString())) {
		val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
	}
	return val;
};

var startByCLick = function() {
	window.onload = function() {
		$("#btnback_start").click(function() {
			window.location.href = 'questions.html';
		});
	};
};

var attachBtnEvent = function() {
	$(document).ready(function() {
		$("#btnbg_start").click(function() {
			window.location.href = "calculator.html";
		}).css("cursor","pointer");
	});
};

// attach explanation to sidebar according to question index
var attachExplanations = function() {
	$('#gender').mouseover(function() {
		sHTML = 'המגדר משפיע מהותית על הפנסיה. נשים פורשות בגיל 62 (גברים בגיל 67) וגם חיות יותר שנים. לכן הפנסיה שלהן קטנה יותר.';
		$('#topRight > section.topRightTxt > p').html(sHTML);
	}); 
	$('#preYears').mouseover(function() {
		sHTML = 'המספר הזה יעזור לנו להעריך איזה סכום חסכתם עד היום לפנסיה.';
		$('#topRight > section.topRightTxt > p').html(sHTML);
	});
	$('#salary').mouseover(function() {
		sHTML = 'הסכום שאתם חוסכים בכל חודש נגזר מההכנסה שלכם.';
		$('#topRight > section.topRightTxt > p').html(sHTML);
	}); 
	$('#assumption').mouseover(function() {
		sHTML = 'בהתבסס על כל מה ששמעתם עד היום על הפנסיה, כמה כסף אתם חושבים שתקבלו בכל חודש כשתגיעו לגיל הפרישה?';
		$('#topRight > section.topRightTxt > p').html(sHTML);
	}); 
};

var genderSelected = false;

var questionsValidator = function() {
	attachExplanations();
	$(document).ready(function() {
		$("#male").click(function() {
			setUserProperty("gender", Gender.MALE);
			if (genderSelected) {
			    $('#female').unwrap();
			}
			$("#male").wrap('<section class="genderBorderMale"></section>');
			$('.genderBorderMale').css("bottom","5px");
			genderSelected = true;
			enableBtn();
			
		});
		$("#female").click(function() {
			setUserProperty("gender", Gender.FEMALE);
			if (genderSelected) {
			    $('#male').unwrap();
			}
			$("#female").wrap('<section class="genderBorderFemale"></section>');
			$('.genderBorderFemale').css("bottom","10px");
			genderSelected = true;
			enableBtn();
		});
		inputUserAssumption();
		inputUserYears();
		inputUserSalary();
	});
};

var inputUserYears = function() {
	$("#innerBtnYears").bind('keyup', function() {
		var sanitized = $(this).val().replace(/[^0-9]/g, '');
		$(this).val(sanitized);
		var empty = false;
		if ($(this).val() == '') {
			empty = true;
		} else if ($(this).val().length > 2) {
			this.value = this.value.substring(0, 2);
		}
		enableBtn();
	});
}; 

var inputUserSalary = function() {
	$("#salaryInput").bind('keyup', function() {
		var sanitized = $(this).val().replace(/[^0-9]/g, '');
		$(this).val(sanitized);
		var empty = false;
		if ($(this).val() == '') {
			empty = true;
		} else if ($(this).val().length > 6) {
			this.value = this.value.substring(0, 6);
		}
		enableBtn();
	});
}; 

var inputUserAssumption = function() {
	$("#assumptionInput").bind('keyup', function() {
		var sanitized = $(this).val().replace(/[^0-9]/g, '');
		$(this).val(sanitized);
		var empty = false;
		if ($(this).val() == '') {
			empty = true;
		} else if ($(this).val().length > 6) {
			this.value = this.value.substring(0, 6);
		}
		enableBtn();
	});
}; 


var enableBtn = function() {
	if(genderSelected && ($('#assumptionInput').val() != '') && ($('#salaryInput').val() != '') && ($('#innerBtnYears').val() != '')) {
		$("#btnback_start").css("cursor", "pointer");
		$("#btnback_start").css("background", "#BF1067");
		$("#btnback_start").click(function() {
			// get all inputs
			var assumption = parseInt($('#assumptionInput').val());
			setUserProperty("assumption_pens", assumption);
			var salary = parseInt($('#salaryInput').val());
			setUserProperty("salary", salary);
			var years = parseInt($('#innerBtnYears').val());
			setUserProperty("pre_years", years);
			// continue
			window.location.href = "openingconclusion.html";
		}); 
	} else {
		$("#btnback_start").css("cursor", "default");
		$("#btnback_start").css("background", "#939393");
		$('#btnback_start').unbind('click');
	}
};
