screen = 0;
nextEnable = 0;

var Gender = {
  MALE: 0,
  FEMALE: 1
};

var questions = [
    "גבר או אישה?",
    "מה לדעתך יהיה גובה הפנסיה החודשית שלך?",
    "מהי ההכנסה החודשית שלך?",
    "כמה שנים אתה כבר חוסך לפנסיה?",
    "כמה שנים את כבר חוסכת לפנסיה?"
];

var values;
var user_prop;

// resize height mechanism
/*var setHeights = function() {
	console.log("set height");
	windowWidth = $(window).innerWidth();
	//console.log(windowWidth);
	if(windowWidth > 851) {
		windowHeight = $(window).innerHeight();
		//console.log(windowHeight);
		//$('#resultsContainer').css('top', (windowHeight/10)+'px');
		//$('#logoContainerCalc').css('top', (windowHeight/3)+'px');
		$('#questionContainer').css('height', (windowHeight/4)+'px');
		$('#logoContainerCalc').css('height', (windowHeight/6)+'px');
	} else {
		$(window).off("resize", setHeights);
		$(window).resize(checkWidth);
	}
};

var checkWidth = function() {
	windowWidth = $(window).innerWidth();
	console.log("check width");
	if(windowWidth > 850) {
		$(window).off("resize", checkWidth);
		$(window).resize(setHeights);
	}
};*/

var loadCalculator = function() {
	var assumption_val = commaSeparateNumber(getUserProperty("assumption_pens"));
	$('#assumpTxt').html(assumption_val);
	var gender = getUserProperty("gender");
	$('document').ready(function() {
		var queryDict = {};
		location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1];});
		var isBack = (queryDict['back'] == "true");
		$.getJSON("includes/data.json", function(data) {
			calculator_params = data["calculator_scales"];
			initParams(calculator_params);
			values = new Array(calculator_params.length);
			for (var i = 0; i < calculator_params.length; i++) {
				var id = "range"+i;
				var sHTML = '<section class="slider"><section class="questionContainer"><p>';
				if(gender == Gender.MALE) {
					sHTML += calculator_params[i]["male_q"];
				} else if (gender == Gender.FEMALE) {
					sHTML += calculator_params[i]["female_q"];
				}
				sHTML += '</p></section><section class="expContainer"><p>';
				sHTML += calculator_params[i]["exp"];
				sHTML += '</p></section><input type="text" id="'+id+'" value="" name="range"></section><section class="hrLine"></section>';
				var slider = $(sHTML);
				$("#sliders").append(slider);				
				if(isBack) {
					calculator_params[i]["default"] = getUserProperty(id);
					console.log(id + ": "+calculator_params[i]["default"]);
				}
				if(calculator_params[i]["is_fixed"]) {
					calculator_params[i]["default"] = translateDefault(i, calculator_params[i]["default"]);
					createFixedSlider(i, calculator_params[i]);
				} else {
					createSlider(i, calculator_params[i]);	
				}
			}
			var btn = '<section class="continueBtn"><section class="continueBtnTxt">עבור לתוצאות המחשבון</section></section>';
			$("#sliders").append(btn);
			$('.continueBtn').click(function() {
				if(!isBack) {
					
				}
			   	setUserProperty("result_pens", pens_finite);
			   	saveUserResults();
			   	if(!isBack) {
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
				   	var data = {'result':user_pension_result, 'salary':salary, 'gender':dbgender, 'duration':duration, 'pens_perc':pens_perc,
				        		'emp_perc':emp_perc, 'mng_mon':mng_mon, 'mng_year':mng_year};
				    console.log(data);
	     			$.post("processDB.php", data, function(response,status){ // Required Callback Function
						//"response" receives - whatever written in echo of above PHP script.
						alert("*----Received Data----*\n\nResponse : " + response+"\n\nStatus : " + status);
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

var translateDefault = function(i, def) {
	switch(i) {
		case 3:
			if (Number(def) == 5.5)
				return 0;
			else if(Number(def) == 6)
				return 1;
			else return 2;
			break;
		case 4:
			if (Number(def) == 11)
				return 0;
			else if(Number(def) == 12)
				return 1;
			else return 2;
			break;
		default:
			return 0;
	}
};

var saveUserResults = function() {
	for (var i = 0; i < values.length; i++) {
		var id = "range"+i;
		setUserProperty(id, values[i]);
	}
};

var createFixedSlider = function(id, scale) {
	console.log(id + ": "+scale["default"]);
	$("#range"+id).ionRangeSlider({
    	keyboard: true,
        min: scale["min_val"],
        max: scale["max_val"],
        from: scale["default"],
        type: 'single',
        values: scale["values"],
        prefix: scale["prefix"],
        grid_num: id,
	});
	$("#range"+id).on("change", function () {
    		var $this = $(this), value = $this.prop("value");
        	values[id] = value;
        	getParams();
        	calculate();
	});
	$("#range"+id).on("update", function () {
    		var $this = $(this), value = $this.prop("value");
        	values[id] = value;
        	getParams();
        	calculate();
	});
	$("#range"+id).on("finish", function () {
    		var $this = $(this), value = $this.prop("value");
        	values[id] = value;
        	getParams();
        	calculate();
	});
	values[id] = $("#range"+id).prop("value");
};

var createSlider = function(id, scale) {
	console.log(id + ": "+scale["default"]);
	var from = scale["default"];
	// if(id == 0) {
		// from = salary;
	// } else 
	if (id == 9) {
		from = savings;
	}
	$("#range"+id).ionRangeSlider({
    	keyboard: true,
        min: scale["min_val"],
        max: scale["max_val"],
        from: from,
        type: 'single',
        step: scale["steps"],
        prefix: scale["prefix"],
        grid_num: id,
		onChange: function (data) {
		  	var $this = $(this);
		    values[$this.prop("grid_num")] = data.from;
        	getParams();
        	calculate();
		},
		onUpdate: function (data) {
       		var $this = $(this);
		    values[$this.prop("grid_num")] = data.from;
        	getParams();
        	calculate();
    	},
    	onFinish: function (data) {
      		var $this = $(this);
		    values[$this.prop("grid_num")] = data.from;
        	getParams();
        	calculate();
    	}
	});
	values[id] = $("#range"+id).prop("value");
};


var nextDisabled = function() {
	nextEnable = 0;
	if (screen==3) {
		var btn_disabled = '<section id="calc_disabled"></section>';
	} else {
		var btn_disabled = '<section id="btn_disabled"></section>';
	}
	$('#next_btn').html(btn_disabled);
	$('#next_btn').unbind('click');
};

var nextEnabled = function() {
	if(!nextEnable) {
		if (screen==3) {
			var btn_enabled = '<section id="calc_enabled"></section>';
		} else {
			var btn_enabled = '<section id="btn_enabled"></section>';	
		}
		$('#next_btn').html(btn_enabled);
		$("#next_btn").click(function() {
			screen++;
			setScreen();
		});
		nextEnable = 1;
	}
};

var incrementCircles = function() {
	var circles = '<ul>';
	for (var i=0; i<4; i++) {
		if(i==0) {
			if (i == 3-screen) {
				circles += '<li class="selected left"></li>';
			} else {
				circles += '<li class="left"></li>';	
			}
		} else {
			if (i == 3-screen) {
			circles += '<li class="selected"></li>';
			} else {
				circles += '<li></li>';
			}	
		}
	}
	$("#circles").html(circles);
	if(screen == 3) {
		$("#circles").css("top", "90px");
	}
};

var setUserProperty = function(property, value) {
	localStorage.setItem(property, value);
};

var getUserProperty = function(property) {
	return localStorage.getItem(property);
};

var getUserGender = function() {
	nextDisabled();
	$('#question').html(questions[0]);
	$('#icon').html('<section id="female"></section><section id="male"></section>');
	$("#male").html('<img src="img/malered.png">');
	$("#female").html('<img src="img/femalered.png">');
	$("#male").click(function() {
		setUserProperty("gender", Gender.MALE);
		$("#male").html('<img src="img/maleblue.png">');
		$("#female").html('<img src="img/femalered.png">');
		nextEnabled();
	}).css("cursor", "pointer");
	$("#female").click(function() {
		setUserProperty("gender", Gender.FEMALE);
		$("#male").html('<img src="img/malered.png">');
		$("#female").html('<img src="img/femaleblue.png">');
		nextEnabled();
	}).css("cursor", "pointer");
};

var getUserAssumption = function() {
	nextDisabled();
	$('#question').fadeOut('slow', function() {
		$('#question').html(questions[1]);
	    $('#question').fadeIn('slow').css("font-size", "80px");
	});
	$('#icon').fadeOut('slow', function() {
		$('#icon').html('<img src="img/graphred.png">');
		$('#icon').fadeIn('slow');
	});
	$('#user_input').fadeOut('slow', function() {
		$('#user_input').html('<section id="line"><img src="img/line.png"></section>');
		$('#user_input').append('<section id="currency"><img src="img/layer_15.png"></section>');
		$('#user_input').append('<input type="text" id="inp_field">');
		$("#inp_field").bind('keyup', function() {
			var sanitized = $(this).val().replace(/[^0-9]/g,'');
  			$(this).val(sanitized);
			var empty = false;
            if ($(this).val() == '') {
                empty = true;
            } else if ($(this).val().length > 8) {
            	this.value = this.value.substring(0, 8);
            }
            if (empty) {
            	$('#icon').html('<img src="img/graphred.png">');
            	nextDisabled();
        	} else {
        		$('#icon').html('<img src="img/graphblue.png">');
            	nextEnabled();
        	}
        });
	    $('#user_input').fadeIn('slow');
	});
};

var getUserSalary = function() {
	nextDisabled();
	$('#question').fadeOut('slow', function() {
		$('#question').html(questions[2]);
	    $('#question').fadeIn('slow').css("font-size", "80px");
	});
	$('#icon').fadeOut('slow', function() {
		$('#icon').html('<img src="img/salaryred.png">');
		$('#icon').fadeIn('slow').css({"left":"20px","top":"80px"});
	});
	$('#user_input').fadeOut('slow', function() {
		$('#user_input').html('<section id="line"><img src="img/line.png"></section>');
		$('#user_input').append('<section id="currency"><img src="img/layer_15.png"></section>');
		$('#user_input').append('<input type="text" id="inp_field">');
		$("#inp_field").bind('keyup', function() {
			var sanitized = $(this).val().replace(/[^0-9]/g,'');
  			$(this).val(sanitized);
			var empty = false;
            if ($(this).val() == '') {
                empty = true;
            } else if ($(this).val().length > 8) { 
            	this.value = this.value.substring(0, 8);	
            }
            if (empty) {
            	$('#icon').html('<img src="img/salaryred.png">');
            	nextDisabled();
        	} else {
        		$('#icon').html('<img src="img/salaryblue.png">');
            	nextEnabled();
        	}
        });
	    $('#user_input').fadeIn('slow');
	});
	$('footer').html('<div id="footer_container"><img src="img/arrow_r.png">'+localStorage.getItem("assumption_pens")+' שח<img src="img/arrow_l.png"></div>');
};

var getUserYears = function() {
	nextDisabled();
	$("#inp_field").val('');
	$('#question').fadeOut('slow', function() {
		$('#question').html(questions[3+Number(getUserProperty("gender"))]);
	    $('#question').fadeIn('slow');
	});
	$('#icon').fadeOut('slow', function() {
		$('#icon').html('<img src="img/savingred.png">');
		$('#icon').fadeIn('slow').css({"left":"20px","top":"100px"});
	});
	$('#user_input').fadeOut('slow', function() {
		$('#user_input').html('<section id="small_line"><img src="img/linesmall.png"></section>');
		$('#user_input').append('<section id="years"><img src="img/years.png"></section>');
		$('#user_input').append('<input type="text" id="small_inp">');
		$("#small_inp").bind('keyup', function() {
			var sanitized = $(this).val().replace(/[^0-9]/g,'');
  			$(this).val(sanitized);
			var empty = false;
            if ($(this).val() == '') {
                empty = true;
            } else if ($(this).val().length > 2) {
            	this.value = this.value.substring(0, 2);	
            }	 
            if (empty) {
            	$('#icon').html('<img src="img/savingred.png">');
            	nextDisabled();
        	} else {
        		$('#icon').html('<img src="img/savingblue.png">');
            	nextEnabled();
        	}
        });
	    $('#user_input').fadeIn('slow');
	});
	$('footer').html('<div id="footer_container"><img src="img/arrow_r.png">'+localStorage.getItem("assumption_pens")+' שח<img src="img/arrow_l.png"></div>');

};

var goToCalculator = function() {
	window.location.href = 'calculator.html';
};

var loadQuestions = function() {
	
};

var setScreen = function() {
	incrementCircles();
	switch(screen){
		case 1:
			getUserAssumption();
			break;
		case 2:
			var assumption = parseInt($('#inp_field').val());
			setUserProperty("assumption_pens",assumption);
			getUserSalary();
			break;
		case 3:
			var salary = parseInt($('#inp_field').val());
			setUserProperty("salary",salary);
			getUserYears();
			break;
		case 4:
			var years = parseInt($('#small_inp').val());
			setUserProperty("pre_years",years);
			goToCalculator();
			break;
		default:
			getUserGender();
			break;
	}
};

var generateResult = function() {
	var asmp = Number(getUserProperty("assumption_pens"));
	var pens = Number(getUserProperty("result_pens"));
	$('#assumpTxt').html(commaSeparateNumber(asmp));
	$('#pensionTxt').html(commaSeparateNumber(pens));
	resizeResultContainer(pens);
	var diff = asmp - pens;
	$('document').ready(function() {
		$.getJSON("includes/data.json", function(data) {
			var resp_txt;
			if(diff > 0) {
				$('#result_bar').html('<section id="pens_lower"><section id="result_text_pens"></section></section>'+
										'<section id="assump_higher"><section id="result_text_assump"></section></section>');
				if(getUserProperty("gender") == Gender.MALE) {
					resp_txt = data["response"][0]["text_male"];	
				} else {
					resp_txt = data["response"][0]["text_female"];	
				}
			} else {
				$('#result_bar').html('<section id="pens_higher"><section id="result_text_pens"></section></section>'+
										'<section id="assump_lower"><section id="result_text_assump"></section></section>');
				if(getUserProperty("gender") == Gender.MALE) {
					resp_txt = data["response"][1]["text_male"];	
				} else {
					resp_txt = data["response"][1]["text_female"];
				}
			}
			$('#result_text_pens').html(getUserProperty("result_pens"));
			$('#result_text_assump').html(getUserProperty("assumption_pens"));
			$('#center_txt').html(resp_txt);
			$('.continueBtn').click(function() {
				window.location.href="calculator.html?back=true";
			});
			attachSocialPlugins();
		});
	});
};


var attachSocialPlugins = function() {
	// Share via whatsapp
	$(document).on("click", '.whatsapp', function() {
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			var text = $(this).attr("data-text");
			var url = $(this).attr("data-link");
			var message = encodeURIComponent(text) + " - " + encodeURIComponent(url);
			var whatsapp_url = "whatsapp://send?text=" + message;
			window.location.href = whatsapp_url;
		} else {
			alert("Please use an Mobile Device to Share this Article");
		}
	});
	
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

var generateData = function() {
	var data = new Array(1);
	data[0] = {};
	data[0]["Salary"] = getUserProperty("range0");
	data[0]["Years_of_savings"] = getUserProperty("range1"); 
	data[0]["Future_salary"] = getUserProperty("range2"); 
	data[0]["Pension_percentage"] = Number(getUserProperty("range3"))+Number(getUserProperty("range4"));
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
    fileName += ReportTitle.replace(/ /g,"_");   
    
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

var resizeResultContainer = function(pension) {
	var assumption_val = commaSeparateNumber(getUserProperty("assumption_pens"));
	if(assumption_val.length > 7 && $('#assumpContainer').hasClass('smaller')) {
		$('#pensionTxtContainer').removeClass();
		$('#pensionTxtContainer').addClass('smallTxt');
	} else {
		$('#pensionTxtContainer').removeClass();
		$('#pensionTxtContainer').addClass('regularTxt');
	}
	if(Number(getUserProperty("assumption_pens")) < Number(pension)) {
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

//$('#elementID').html(commaSeparateNumber(1234567890));
var commaSeparateNumber = function(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
};

//resize text function!

/* $(document).scroll(function() {
			  var y = $(this).scrollTop();
			  if (y > 500) {
			    $('.bottomFinish').fadeIn('fast');
			    $('.bottomFinish').click(function() {
			    	setUserProperty("result_pens", pens_finite);
					window.location.href = 'finish.html';
				});
			  }
		}); */