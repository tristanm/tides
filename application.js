var startTime  = moment().startOf("day");
var endTime = startTime.clone().add(5, "days");

var handleCsv = function(results) {
  var rawData = results.data.slice(3, -1);
  var normalizedData = normalizeData(rawData);
  drawChart(normalizedData);
};

var normalizeData = function(rawData) {
  var normalizedData = [];

  _.each(rawData, function(row) {
    var day = row[0];
    var month = row[2];
    var year = row[3];

    // There are exactly three or exactly four tides per row.
    _.times(4, function(i) {
      var offset = i * 2 + 4;
      var time = row[offset];
      var height = row[offset + 1];

      if (_.isEmpty(time) && _.isEmpty(height)) {
        return;
      }

      time = time.split(":");
      var hour = time[0];
      var minute = time[1];
      var dateTime = moment([year, month - 1, day, hour, minute]);

      if (dateTime.isAfter(startTime) && dateTime.isBefore(endTime)) {
        normalizedData.push({
          x: dateTime.toDate(),
          y: Number(height)
        });
      }
    });
  });

  return normalizedData;
};

var drawChart = function(data) {
  var chart = new CanvasJS.Chart("chart", {
    title: {
      text: "Thames Tides"
    },
    toolTip: {
      // content: function(e) {
      //   return "hello";
      // }
    },
    axisX: {
      minimum: startTime.toDate(),
      maximum: endTime.toDate(),
      // interval: 4,
      labelAngle: 45,
      gridThickness: 2,
      valueFormatString: "DDD D MMM YYYY HH:mm"
    },
    axisY: {
      suffix: "m"
    },
    data: [
      {
        type: "spline",
        dataPoints: data
      }
    ]
  });

  chart.render();
};

// Data courtesty of LINZ:
// http://www.linz.govt.nz/sea/tides/tide-predictions.
//
// Rocky Point is the closes "secondary port" to Thames.
var url = "https://cdn.rawgit.com/tristanm/tides/master/rocky_point_2015.csv";

Papa.parse(url, {
  download: true,
  complete: handleCsv
});
