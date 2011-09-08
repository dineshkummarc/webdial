function WebDial(canvas) {
    var continents;

    function drawMap() {
        var w = canvas.width();
        var h = canvas.height();
        function lon2x(lon) {
            return (lon + 180.0) * w / 360.0;
        }

        function lat2y(lat) {
            return (90.0 - lat) * h / 180.0;
        }

        var ctx = canvas[0].getContext("2d");
        ctx.fillStyle = "rgb(0, 192, 0)";
        $.each(continents, function(continent, polygons) {
            console.debug("Drawing", continent);
            $.each(polygons, function(i, points) {
                ctx.beginPath();
                ctx.moveTo(points[points.length-1]);
                $.each(points, function(j, point) {
                    ctx.lineTo(lon2x(point[0]), lat2y(point[1]));
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