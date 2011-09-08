function WebDial(canvas) {
    var continents;

    function drawPoly(ctx, w, h, points) {
        ctx.beginPath();
        var lastPoint = points[points.length-1];
        ctx.moveTo(lon2x(lastPoint[1]), lat2y(lastPoint[0]));
        $.each(points, function(j, point) {
            ctx.lineTo(lon2x(point[1]), lat2y(point[0]));
        });
        ctx.fill();
    }

    function drawMap(ctx, w, h) {
        function lon2x(lon) {
            return Math.round((lon + 180.0) * w / 360.0);
        }

        function lat2y(lat) {
            return Math.round((90.0 - lat) * h / 180.0);
        }

        ctx.fillStyle = "rgb(0, 192, 0)";
        $.each(continents, function(continent, polygons) {
            console.debug("Drawing", continent);
            $.each(polygons, function(i, points) {
            });
        });
    }

    function drawNight(ctx, w, h) {
        ctx.fillStyle = "rgba(0, 0, 0, 128)";
        var jd = Sun.cal_to_jd(new Date());
        var epsilon = Sun.obliquity(jd);
        var geometric_lon = Sun.longitude_radius_low(jd).longitude;
        var lon = Sun.apparent_longitude_low(jd, geometric_lon);
        var equ = Sun.ecl_to_equ(lon, 0.0, epsilon);
        var st = Sun.sidereal_time_greenwich(jd);
        var geo = Sun.equ_to_geo(ra, dec, st);
        var points = Sun.terminator(geo.latitude, geo.longitude,
                                    Sun.sun_rst_altitude, w, h);
        ctx.beginPath();
        var lastPoint = points[points.length-1];
        ctx.moveTo(lon2)
        $.each(points, function(i, point) {
            
        });
    }

    function draw() {
        var ctx = canvas[0].getContext("2d");
        var w = canvas[0].width;
        var h = canvas[0].height;
        drawMap(ctx, w, h);
        drawNight(ctx, w, h);
    }

    function mapCallback(data) {
        continents = data;
        draw();
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