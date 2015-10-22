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

Zepto(function ($) {

    var initMap = function () {
            var $mapWrapper = $('.map-wrapper'),
                $bomap = $mapWrapper.find('#bomap'),
                $zoomHover = $bomap.find('.zoom-hover'),
                $zoomOut = $bomap.find('.control-zoom-out'),
                $places = $bomap.find('.place'),
                $addressInfo = $('<div id="address-info" />').insertAfter($mapWrapper),
                $addressInfoInner = $('<div id="address-info_inner" />').appendTo($addressInfo),
                $addressInfoTitle = $('<h3 id="address-info_title" />').appendTo($addressInfoInner),
                $addressInfoQuote = $('<div id="address-info_quote" />').appendTo($addressInfoInner),
                $addressInfoStreet = $('<div id="address-info_street" />').appendTo($addressInfoInner),
                $addressInfoCity = $('<div id="address-info_city" />').appendTo($addressInfoInner),
                $addressInfoNavigate = $('<a id="address-info_navigate">Navigation starten</a>').appendTo($addressInfoInner),
                navActionEnd = function () {
                    $places.each(function () {
                        this.classList.remove('active');
                    });
                    $addressInfo.removeClass('active');
                },
                zoomClass = 'zoom',
                latlon,
                mapUrl;

            $zoomHover.on('click', function () {
                $bomap.addClass(zoomClass);
            });
            $zoomOut.on('click', function () {
                $bomap.removeClass(zoomClass);
                navActionEnd();
            });
            $places.on('click', function () {
                var $this = $(this),
                    name = $this.attr('id'),
                    placeObj;
                if (!boprom.places[name]) {
                    return;
                }

                navActionEnd();
                this.classList.add('active');
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
                $('body').scrollTop($mapWrapper.parent().prop('scrollHeight'));
            });

        },
        initPlayer = function () {
            var $player = $('.player'),
                $playerBtn = $player.find('.player-button'),
                $playerProgressTrack = $player.find('.player-progress_track'),
                $playerProgressBar = $player.find('.player-progress_bar'),
                $playerMessageText = $player.find('.player-message_text'),
                $playerMessageBtnNext = $player.find('.player-message_btn--next'),
                $playerMessageBtnBack = $player.find('.player-message_btn--back'),
                playerLoadingClass = 'player--loading',
                playerBtnActiveClass = 'player--playing',
                playerMessageActiveClass = 'player--message',
                playerOptionNext = 'Mehr hören',
                playerOptionLast = 'Erneut hören',
                playerTextNext = 'Möchten Sie mehr hören?',
                playerTextLast = 'Möchten Sie alle Stücke erneut hören?',
                playlist = [],
                currentSound = 0,
                setProgressBar = function (progress) {
                    $playerProgressBar.width((progress * 100) + '%');
                },
                addTrack = function (trackname) {
                    playlist.push(new buzz.sound('/audio/' + trackname, {
                        formats: ['ogg', 'mp3']
                        })
                        .bind('ended', trackend)
                        .bind('loadstart seeking', function (e) {
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
                    if (!playlist[currentSound]) {
                        addTrack(boprom.audio[currentSound]);
                    }
                    playlist[currentSound].play();
                    playing = true;
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
                playing = false,
                playTimer,
                position,
                duration;

            //addTrack(boprom.audio[0]);

            $playerBtn.click(function () {
                if (!playing) {
                    if ($player.hasClass(playerMessageActiveClass)) {
                        next();
                    }
                    $player.removeClass(playerMessageActiveClass);
                    $player.addClass(playerBtnActiveClass);
                    play();
                } else {
                    $player.removeClass(playerBtnActiveClass);
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

            $playerMessageBtnNext.click(function (e) {
                next();
                play();
                $player.addClass(playerBtnActiveClass);
                $player.removeClass(playerMessageActiveClass);
            })

            $playerMessageBtnBack.click(function (e) {
                seek(0);
                $player.removeClass(playerMessageActiveClass);
            });
        };

    initMap();
    /* Player */
    if (boprom.audio) {
        initPlayer();
    }

});