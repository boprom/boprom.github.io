'use strict';

window.boprom = window.boprom || {};
window.boprom.places = {
    exzenterhaus: {
        title: 'Exzenterhaus',
        street: 'Universitätsstr. 60',
        postal: '44789',
        lat: 51.473891,
        lon: 7.225681,
        quote: 'Es war das klassische Die-Katze-fängt-ihren-Schwanz-Problem.'
    },
    jahrhunderthalle: {
        title: 'Jahrhunderthalle',
        street: 'An der Jahrhunderthalle 1',
        postal: '44793',
        lat: 51.480509,
        lon: 7.198020,
        quote: 'Dann, unter allgemeiner Spannung, nahm der Kronprinz das Wort.'
    },
    musikzentrum: {
        title: 'Musikzentrum',
        street: 'Marienplatz',
        postal: '44787',
        lat: 51.478296,
        lon: 7.214029,
        quote: 'Sind Sie alle an der Schippe?'
    },
    ruhrpark: {
        title: 'Ruhrpark',
        street: 'Am Einkaufszentrum 1',
        postal: '44791',
        lat: 51.495191,
        lon: 7.281083,
        quote: 'Der erste und einzige Preis ist das Wolkenauto.'
    },
    ruhruniversitaet: {
        title: 'Ruhr-Universität',
        street: 'Universitätsstr. 150',
        postal: '44801',
        lat: 51.445237,
        lon: 7.260398,
        quote: 'Eine Bochumer Bank hatte dafür sogar Golddukaten in mehreren Größen prägen lassen.'
    },
    stadtbad: {
        title: 'Stadtbadgalerie',
        street: 'Massenbergstraße 9',
        postal: '44787',
        lat: 51.480932,
        lon: 7.222234,
        quote: 'Eine so verblüffende Durchsichtigkeit des Wassers hat man bisher noch in keinem Hallenbad gesehen.'
    },
    u35: {
        title: 'U35',
        street: 'Kurt-Schumacher-Platz',
        postal: '44787',
        lat: 51.478969,
        lon: 7.222633,
        quote: 'Die griechische Antike ist nur zehn Minuten U-Bahnfahrt vom Bochumer Hauptbahnhof entfernt.'
    }
};

(function ($) {

    $.fn.addClassSVG = function (className) {
        $(this).attr('class', function (index, existingClassNames) {
            return existingClassNames + ' ' + className;
        });
        return this;
    };

    /*
     * .removeClassSVG(className)
     * Removes the specified class to each of the set of matched SVG elements.
     */
    $.fn.removeClassSVG = function (className) {
        $(this).attr('class', function (index, existingClassNames) {
            return existingClassNames.replace(className, '');
        });
        return this;
    };

    $(document).ready(function () {

        var initMap = function () {
                var $bomap = $mapWrapper.find('#bomap'),
                    $zoomHover = $bomap.find('.zoom-hover'),
                    $zoomOut = $bomap.find('.control-zoom-out'),
                    $addressInfo = $('<div id="address-info" />').insertAfter($mapWrapper),
                    $addressInfoInner = $('<div id="address-info_inner" />').appendTo($addressInfo),
                    $addressInfoTitle = $('<h3 id="address-info_title" />').appendTo($addressInfoInner),
                    $addressInfoQuote = $('<div id="address-info_quote" />').appendTo($addressInfoInner),
                    $addressInfoStreet = $('<div id="address-info_street" />').appendTo($addressInfoInner),
                    $addressInfoCity = $('<div id="address-info_city" />').appendTo($addressInfoInner),
                    $addressInfoNavigate = $('<a id="address-info_navigate" target="_blank">Navigation starten</a>').appendTo($addressInfoInner),
                    navActionEnd = function () {
                        $(placesSelector).each(function () {
                            $(this).removeClassSVG('active');
                        });
                        $addressInfo.removeClass('active');
                    },
                    placesSelector = '.place',
                    zoomClass = 'zoom',
                    latlon,
                    mapUrl;

                $zoomHover.on('click', function () {
                    $bomap.addClassSVG(zoomClass);
                });
                $zoomOut.on('click', function () {
                    $bomap.removeClassSVG(zoomClass);
                    navActionEnd();
                });
                $mapWrapper.on('click', '.place', function () {
                    var $this = $(this),
                        name = $this.data('placename'),
                        placeObj;
                    if (!boprom.places[name]) {
                        return;
                    }

                    navActionEnd();
                    $this.addClassSVG('active');
                    placeObj = boprom.places[name];
                    $addressInfoTitle.html(placeObj.title);
                    $addressInfoQuote.html('»' + placeObj.quote + '«');
                    $addressInfoStreet.html(placeObj.street);
                    $addressInfoCity.html(placeObj.postal + ' Bochum');
                    latlon = placeObj.lat + ',' + placeObj.lon;
                    mapUrl = 'https://maps.apple.com/?address=' + latlon +
                        '&ll=' + latlon + '&daddr=' + latlon;
                    $addressInfoNavigate.attr('href', mapUrl);
                    $addressInfo.addClass('active');
                    $('html, body').animate({
                        scrollTop: $addressInfo.offset().top - 30
                    }, 200);
                });

            },
            initPlayer = function () {
                var $player = $('.player'),
                    $playerBtn = $player.find('.player-button'),
                    $playerProgressTrack = $player.find('.player-progress_track'),
                    $playerProgressBar = $player.find('.player-progress_bar'),
                    $playerPlaylist = $player.find('.player-playlist'),
                    $playerMessageText = $player.find('.player-message_text'),
                    $playerMessageBtnNext = $player.find('.player-message_btn--next'),
                    playerLoadingClass = 'player--loading',
                    playerBtnActiveClass = 'player--playing',
                    playerMessageActiveClass = 'player--message',
                    playerOptionNext = 'Mehr hören',
                    playerOptionLast = 'Erneut hören',
                    playerTextNext = 'Möchten Sie mehr hören?',
                    playerTextLast = 'Möchten Sie alle Stücke erneut hören?',
                    trackTitle = boprom.places[boprom.place]['title'],
                    playlist = [],
                    currentSound = 0,
                    setProgressBar = function (progress) {
                        $playerProgressBar.width((progress * 100) + '%');
                    },
                    addTrack = function (trackname) {
                        playlist.push(new buzz.sound('/audio/' + trackname, {
                            formats: ['ogg', 'mp3'],
                            preload: 'metadata',
                        })
                            .bind('ended', trackend)
                            .bind('loadstart seeking', function () {
                                $player.addClass(playerLoadingClass);
                            })
                            .bind('canplay', function () {
                                $player.removeClass(playerLoadingClass)
                            }));
                    },
                    isLastTrack = function () {
                        return currentSound === (boprom.audio.length - 1);
                    },
                    play = function () {
                        if ($player.hasClass(playerMessageActiveClass)) {
                            next();
                        }
                        $player.removeClass(playerMessageActiveClass);
                        $player.addClass(playerBtnActiveClass);
                        if (!playlist[currentSound]) {
                            addTrack(boprom.audio[currentSound]);
                        }
                        playlist[currentSound].play();
                        playing = true;
                        $playerPlaylist
                            .children()
                            .removeClass('active')
                            .filter(':eq(' + currentSound + ')')
                            .addClass('active');
                        playTimer = setInterval(function () {
                            position = playlist[currentSound].getTime();
                            duration = playlist[currentSound].getDuration();
                            setProgressBar(position / duration);
                        }, 250);
                    },
                    pause = function () {
                        clearInterval(playTimer);
                        playlist[currentSound].pause();
                        playing = false;
                        $player.removeClass(playerBtnActiveClass);
                    },
                    seek = function (progress) {
                        var position = Math.min(Math.max(progress, 0), 1) * duration;
                        playlist[currentSound].setTime(position);
                        setProgressBar(progress);
                    },
                    trackend = function () {
                        playing = false;
                        if (isLastTrack()) {
                            $playerMessageBtnNext.text(playerOptionLast);
                            $playerMessageText.text(playerTextLast);
                        } else {
                            $playerMessageBtnNext.text(playerOptionNext);
                            $playerMessageText.text(playerTextNext);
                        }
                        $player.removeClass(playerBtnActiveClass);
                        $player.addClass(playerMessageActiveClass);
                    },
                    next = function () {
                        currentSound = (isLastTrack()) ? 0 : currentSound + 1;
                    },
                    skip = function(index) {
                        playlist[currentSound].stop();
                        currentSound = index;
                        playlist[currentSound].stop();
                        play();
                    },
                    playing = false,
                    playTimer,
                    position,
                    duration;

                $.each(boprom.audio, function(index) {
                    var track = this,
                        title = trackTitle + ' ' + (index + 1);
                    addTrack(track);
                    $playerPlaylist.append($('<span />', {
                        class: 'playlist-track',
                        text: title,
                        'data-track': index
                    }));
                });
                $playerPlaylist.on('click', '.playlist-track', function() {
                    var track = $(this).data('track');
                    skip(track);
                    play();
                });

                $playerBtn.click(function () {
                    if (!playing) {
                        play();
                    } else {
                        pause();
                    }
                });

                $playerProgressTrack.click(function (e) {
                    var $this = $(this),
                        pos, width, progress;
                    if (playing) {
                        pos = e.pageX - $this.offset().left;
                        width = $this.width();
                        progress = pos / width;
                        seek(progress);
                    }
                });

                $playerMessageBtnNext.click(function () {
                    next();
                    play();
                    $player.addClass(playerBtnActiveClass);
                    $player.removeClass(playerMessageActiveClass);
                });
            },
            $mapWrapper = $('.map-wrapper'),
            script;


        if (!Modernizr.inlinesvg) {
            $mapWrapper.append($('<img class="mapFallback" src="img/boprom_map.png" alt="Bochumer Versprechen: Karte aller Hörstationen" usemap="#mapFallback-map"/><map name="mapFallback-map"><area class="place" data-placename="jahrhunderthalle" shape="circle" coords="149, 212, 18"/><area class="place" data-placename="musikzentrum" shape="circle" coords="234, 241, 16"/><area class="place" data-placename="stadtbad" shape="circle" coords="261, 212, 19"/><area class="place" data-placename="exzenterhaus" shape="circle" coords="288, 277, 17"/><area class="place" data-placename="u35" shape="circle" coords="291, 235, 17"/><area class="place" data-placename="ruhruniversitaet" shape="circle" coords="470, 504, 18"/><area class="place" data-placename="ruhrpark" shape="circle" coords="581, 101, 17"/></map>'));
            script = document.createElement('script');
            script.async = 'async';
            script.src = '/vendor/jQuery-rwdImageMaps/jquery.rwdImageMaps.min.js';
            script.onload = function () {
                $('img[usemap]').rwdImageMaps();
            };
            document
                .getElementsByTagName('head')[0]
                .appendChild(script);
        }
        initMap();

        if (boprom.audio) {
            initPlayer();
        }

    });

}(jQuery));