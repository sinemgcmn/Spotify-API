(function () {
    var more = $(".more");
    more.hide();
    var nextUrl = "";
    var userInput;
    var artistOrAlbum;

    //submit button check
    $(".submit-button").on("click", function () {
        //console.log('I clicked the button')
        userInput = $("input").val();
        // console.log(userInput);
        artistOrAlbum = $("select").val();
        // console.log(artistOrAlbum);
        makeAjaxRequest("https://spicedify.herokuapp.com/spotify");
    });

    more.on("click", function () {
        // console.log("I clicked the more button");
        makeAjaxRequest(nextUrl, true);
    });

    function makeAjaxRequest(urlToMakeRequestTo, moreButtonClicked) {
        $.ajax({
            method: "GET",
            url: urlToMakeRequestTo,
            data: {
                query: userInput,
                type: artistOrAlbum,
            },
            success: function (response) {
                response = response.artists || response.albums;
                // console.log(response);
                if (response.items.length) {
                    $("#result").html(
                        'Results for "' + userInput + '"' + "🎤 "
                    );
                } else {
                    $("#result").html("No results found!");
                }
                //adding next 20 to the end of the first batch
                var resultsHtml = callSpotify(response.items);
                if (moreButtonClicked) {
                    $(".results-container").append(resultsHtml);
                } else {
                    $(".results-container").html(resultsHtml);
                }

                //getting next 20 by replacing the url
                nextUrl =
                    response.next &&
                    response.next.replace(
                        "api.spotify.com/v1/search",
                        "spicedify.herokuapp.com/spotify"
                    );
                console.log(response.next);

                //if there is no next batch, do not show the more button, otherwise show it
                if (response.next == null) {
                    more.css("display", "none");
                }
                if (location.search.indexOf("scroll=infinite") > -1) {
                    more.css("display", "none");
                    infiniteCheck();
                } else {
                    more.toggle();
                }
            },
        });
    }

    function callSpotify(items) {
        var resultsHtml = "";

        for (var i = 0; i < items.length; i++) {
            var defaultImage =
                "https://www.scdn.co/i/_global/twitter_card-default.jpg";

            if (items[i].images.length > 0) {
                defaultImage = items[i].images[0].url;
            }
            var exUrl = items[i].external_urls.spotify;

            resultsHtml +=
                "<a href=" +
                exUrl +
                '">' +
                "<div>" +
                items[i].name +
                "</div>" +
                '<img src="' +
                defaultImage +
                '"/> </a>';
        }
        return resultsHtml;
    }

    function infiniteCheck() {
        var reachedBottom =
            $(window).scrollTop() + $(window).height() >=
            $(document).height() - 300;

        // console.log("reachedBottom: ", reachedBottom);
        if (reachedBottom) {
            makeAjaxRequest(nextUrl, true);
        } else {
            setTimeout(infiniteCheck, 1000);
        }
    }
    infiniteCheck();
})();
