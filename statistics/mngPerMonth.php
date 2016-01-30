<?php
	require ("../includes/config.php");
	require ("menu.php");
?>
<!DOCTYPE HTML>
<html>
	<head>
		<?php echo $links ?>
		<title>Management Fee per Month</title>
	</head>
	<body>
		<!-- Fixed navbar -->
		<nav class="navbar navbar-default navbar-fixed-top">
			<section class="container">
				<?php echo $menu ?>
			</section>
		</nav>
		<section id="chartContainer" style="margin-top:100px"></section>
		<script>
			$(document).ready(function() {
				var dataPoints = [];
				var chart = new CanvasJS.Chart("chartContainer", {
					title:{
						text: "Management Fee per Month"
					},
					axisX : {
						labelAngle : 0,
						labelWrap : true,
						labelAutoFit : false,
						labelFontSize : 15,
						labelMaxWidth : 200,
						labelFontColor : "black"
					},
					data : [{
						indexLabelPlacement : "outside",
						indexLabelFontWeight : "bold",
						indexLabelFontColor : "black",
						type : "column",
						dataPoints : []
					}]
				});

				// Ajax request for getting JSON data

				$.getJSON("data.php?filter=mon", function(data) {
					for (var i = 0; i < data.length; i++) {
						dataPoints.push({
							label : data[i].mng_percentage_mon,
							y : parseInt(data[i].num)
						});
					}
					chart.options.data[0].dataPoints = dataPoints;
					chart.render();
				});
			});
		</script>
	</body>
</html>