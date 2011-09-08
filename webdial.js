function WebDial(canvas) {
    var continents;

    function drawMap() {
        var w = canvas.width();
        var h = canvas.height();
        function lon2x(lon) {
            return Math.round((lon + 180.0) * w / 360.0);
        }

        function lat2y(lat) {
            return Math.round((90.0 - lat) * h / 180.0);
        }

        var ctx = canvas[0].getContext("2d");
        ctx.fillStyle = "rgb(0, 192, 0)";
        $.each(continents, function(continent, polygons) {
            console.debug("Drawing", continent);
            $.each(polygons, function(i, points) {
                ctx.beginPath();
                var lastPoint = points[points.length-1];
                ctx.moveTo(lon2x(lastPoint[1]), lat2y(lastPoint[0]));
                $.each(points, function(j, point) {
                    ctx.lineTo(lon2x(point[1]), lat2y(point[0]));
                });
                ctx.fill();
            });
        });
    }

    function mapCallback(data) {
        continents = data;
        drawMap();
    }

    function errCallback(xhr, status, error) {
        console.debug("error: ", xhr, status, error);
    }

    this.go = function() {
        $.ajax("continent.json",
               {dataType: "json",
                success: mapCallback,
                error: errCallback
               });
    }
}