"use strict";

/*
 * jCal calendar multi-day and multi-month datepicker plugin for jQuery
 *	version 0.3.7
 * Author: Jim Palmer
 * Released under MIT license.
 */
(function ($) {

    var defaults = {
        day: new Date(),     // date to drive first cal
        days: 1,		     // default number of days user can select
        showMonths: 1,	     // how many side-by-side months to show
        monthSelect: false,	 // show selectable month and year ranges via animated comboboxen
        dCheck: function (day) {
            return 'day';
        },			// handler for checking if single date is valid or not - returns class to add to day cell
        callback: function (day, days) {
            return true;
        },		// callback function for click on date
        drawBack: function () {
            return true;
        },				// callback function for month being drawn
        selectedBG: 'rgb(0, 143, 214)',							// default bgcolor for selected date cell
        defaultBG: 'rgb(255, 255, 255)',						// default bgcolor for unselected date cell
        dayOffset: 0,											// 0=week start with sunday, 1=week starts with monday
        scrollSpeed: 150,										// default .animate() speed used
        forceWeek: false,										// true=force selection at start of week, false=select days out from selected day
        dow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],		// days of week - change this to reflect your dayOffset
        ml: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        ms: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        minDate: null,
        minDateOrg: null,
        maxDate: null,
        maxDateOrg: null,
        selectedDay: null,
        selectedDays: null,
        onReset: function () {
        },
        onCancel: function () {
        },
        timezoneOffset: -1*(new Date().getTimezoneOffset() / 60)
    };

    var methods = {
        init: function (inOptions) {
            var $this = $(this),
                data = $this.data('jCal');

            var options = $.extend({_target: this}, inOptions);


            if (options.minDate && options.timezoneOffset) {

                if(!options.minDateOrg) {
                    options.minDateOrg = options.minDate;
                }
                var sourceDate = moment(options.minDateOrg)
                    .utcOffset(options.timezoneOffset);

                options.minDate = moment()
                    .startOf('day')
                    .year(sourceDate.year())
                    .month(sourceDate.month())
                    .date(sourceDate.date())
                    .toDate();
            }

            if (options.maxDate && options.timezoneOffset) {

                if(!options.maxDateOrg) {
                    options.maxDateOrg = options.maxDate;
                }

                sourceDate = moment(options.maxDateOrg)
                    .utcOffset(options.timezoneOffset);

                options.maxDate = moment()
                    .startOf('day')
                    .year(sourceDate.year())
                    .month(sourceDate.month())
                    .date(sourceDate.date())
                    .toDate();
            }


            $.jCal(this, options);

            return $this;
        },
        select: function (date) {
            var $this = $(this),
                data = $this.data('jCal');

            var sourceDate = moment(date)
                .utcOffset(data.timezoneOffset);

            var selectDate = moment()
                .startOf('day')
                .year(sourceDate.year())
                .month(sourceDate.month())
                .date(sourceDate.date())
                .toDate();

            // var xDate = new Date(selectDate);
            // xDate.setDate(selectDate.getDate() - 3);
            //
            // if ( data.maxDate && xDate > data.maxDate ) {
            //     xDate = new Date(data.maxDate);
            //
            //     xDate.setDate(xDate.getDate() - 3);
            //     selectDate = xDate;
            // }

            // selectDate.setTime( selectDate.getTime() + (data.timezoneOffset*60 + x.getTimezoneOffset()) *60*1000  );

            $this.jCal($.extend(data, {day: selectDate}));
            reSelectDates(data._target, selectDate, $(data._target).data('days'), data);
        },
        reset: function () {
            var $this = $(this),
                data = $this.data('jCal');

            $this.find('.jCal-reset').trigger('click');
        }
    };

    $.fn.jCal = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.jCal');
        }

        return this;
    };

    $.jCal = function (target, opt) {
        opt = $.extend(defaults, opt);

        opt.day = new Date(opt.day.getFullYear(), opt.day.getMonth(), 1);


        if (!$(opt._target).data('days')) {
            $(opt._target).data('days', opt.days);
        }

        $(target).stop().empty();

        for (var sm = 0; sm < opt.showMonths; sm++) {
            $(target).append('<div class="jCalMo"></div>');
        }

        opt.cID = 'c' + $('.jCalMo').length;

        $('.jCalMo', target).each(function (ind) {
            drawCalControl($(this), $.extend({}, opt, {
                'ind': ind,
                'day': new Date(new Date(opt.day.getTime()).setMonth(new Date(opt.day.getTime()).getMonth() + ind))
            }));
            drawCal($(this), $.extend({}, opt, {
                'ind': ind,
                'day': new Date(new Date(opt.day.getTime()).setMonth(new Date(opt.day.getTime()).getMonth() + ind))
            }));
        });

        if ($(opt._target).data('day') && $(opt._target).data('days')) {
            reSelectDates(target, $(opt._target).data('day'), $(opt._target).data('days'), opt);
        }

        if (typeof opt.drawBack == 'function') {
            opt.drawBack();
        }

        $(target).append('<span class="jCal-first-day first-day"></span>');
        if (opt.showMonths > 1) {
            $(target).prepend('<div class="jCal-header"><button class="jCal-btn jCal-reset"><span class="jcal-btn__text">Выбрать все даты</span></button></div>');
            $(target).find('.jCal-reset').on('click', $.extend({}, opt), function (e) {
                $(target).find('.jCalMo .day').removeClass('selectedDay_first selectedDay selectedDay_last');
                opt.onReset();
            });

        } else {
            $(target).append('<div class="jCal-footer"><button class="jCal-btn jCal-btn_confirm jCal-confirm"><span class="jcal-btn__text">Ок</span></button><button class="jCal-btn jCal-btn_cancel jCal-cancel"><span class="jcal-btn__text">Отмена</span></button></div>');
            $(target).find('.jCal-cancel').on('click', $.extend({}, opt), function (e) {
                opt.onCancel();
            });
        }

        var $jCalConfirm = $('.jCal-confirm');

        $jCalConfirm.on('click', function (e) {
            var $this = $(this);
            var osDate = $this.data('osDate');
            var di = $this.data('di');
            opt.day = osDate;
            if (opt.callback(osDate, di)) {
                $(opt._target).data('day', opt.day).data('days', di);
            }
        });

        // Save options
        $(opt._target).data('jCal', opt);
    };

    function drawCalControl(target, opt) {
        $(target).append(
            '<div class="jCal">' +
            ( (opt.ind == 0) ? '<div class="left" />' : '' ) +
            '<div class="month">' +
            '<span class="monthYear" data-cal-year="' + opt.day.getFullYear() + '">' + opt.day.getFullYear() + '</span>' +
            '<span class="monthName" data-cal-manth="' + opt.day.getMonth() + '">' + opt.ml[opt.day.getMonth()] + '</span>' +
            '</div>' +
            ( (opt.ind == ( opt.showMonths - 1 )) ? '<div class="right" />' : '' ) +
            '</div>');

        if (opt.monthSelect) {
            $(target).find('.jCal .monthName, .jCal .monthYear')
                .on('mouseover', $.extend({}, opt), function (e) {
                    $(this).removeClass('monthYearHover monthNameHover');
                    if ($('.jCalMask', e.data._target).length == 0) {
                        $(this).addClass($(this).attr('class') + 'Hover');
                    }
                })
                .on('mouseout', function () {
                    $(this).removeClass('monthYearHover').removeClass('monthNameHover');
                })
                .on('click', $.extend({}, opt), function (e) {

                    $(e.data._target).stop();

                    $('.jCalMo .monthSelector, .jCalMo .monthSelectorShadow').remove();

                    var monthName = $(this).hasClass('monthName'),
                        pad = Math.max(parseInt($(this).css('padding-left')), parseInt($(this).css('padding-left'))) || 2,
                        calcTop = ( $(this).position().top - ( ( monthName ? e.data.day.getMonth() : 2 ) * ( $(this).height() + 0 ) ) );

                    if (calcTop < 0) {
                        calcTop = 0;
                    }
                    var topDiff = $(this).position().top - calcTop;

                    $('<div class="monthSelectorShadow" style="' +
                        'top:' + $(e.data._target).position().top + 'px; ' +
                        'left:' + $(e.data._target).position().left + 'px; ' +
                        'width:' + ( $(e.data._target).width() + ( parseInt($(e.data._target).css('paddingLeft')) || 0 ) + ( parseInt($(e.data._target).css('paddingRight')) || 0 ) ) + 'px; ' +
                        'height:' + ( $(e.data._target).height() + ( parseInt($(e.data._target).css('paddingTop')) || 0 ) + ( parseInt($(e.data._target).css('paddingBottom')) || 0 ) ) + 'px;">' +
                        '</div>')
                        .css('opacity', 0.01).appendTo($(this).parent());

                    $('<div class="monthSelector" style="' +
                        'top:' + calcTop + 'px; ' +
                        'left:' + ( $(this).position().left ) + 'px; ' +
                        'width:' + ( $(this).width() + ( pad * 2 ) ) + 'px;">' +
                        '</div>')
                        .css('opacity', 0).appendTo($(this).parent());

                    for (var di = ( monthName ? 0 : -2 ), dd = ( monthName ? 12 : 3 ); di < dd; di++) {

                        var _id, _html;
                        if (monthName) {
                            _id = (di + 1) + '_1_' + e.data.day.getFullYear();
                            _html = e.data.ml[di];
                        } else {
                            _id = (e.data.day.getMonth() + 1) + '_1_' + (e.data.day.getFullYear() + di);
                            _html = e.data.day.getFullYear() + di;
                        }

                        $(this).clone()
                            .removeClass('monthYearHover monthNameHover')
                            .addClass('monthSelect')
                            .attr('id', _id)
                            .html(_html)
                            .css('top', ( $(this).height() * di ))
                            .appendTo($(this).parent().find('.monthSelector'));
                    }


                    var moSel = $(this).parent().find('.monthSelector').get(0),
                        diffOff = $(moSel).height() - ( $(moSel).height() - topDiff );

                    $(moSel)
                        .css('clip', 'rect(' + diffOff + 'px ' + ( $(this).width() + ( pad * 2 ) ) + 'px ' + diffOff + 'px 0px)')
                        .animate({
                            'opacity': .92,
                            'clip': 'rect(0px ' + ( $(this).width() + ( pad * 2 ) ) + 'px ' + $(moSel).height() + 'px 0px)'
                        }, e.data.scrollSpeed, function () {
                            $(this).parent().find('.monthSelectorShadow').on('mouseover click', function () {
                                $(this).parent().find('.monthSelector').remove();
                                $(this).remove();
                            });
                        })
                        .parent().find('.monthSelectorShadow')
                        .animate({'opacity': .1}, e.data.scrollSpeed);

                    // Выбор месяца
                    $('.jCalMo .monthSelect', e.data._target).on('mouseover mouseout click', $.extend({}, e.data), function (e) {

                        if (e.type == 'click') {
                            $(e.data._target).jCal($.extend(e.data, {day: new Date($(this).attr('id').replace(/_/g, '/'))}));

                        } else {
                            $(this).toggleClass('monthSelectHover');
                        }

                    });

                    if (typeof opt.drawBack == 'function') {
                        opt.drawBack();
                    }
                });
            ;
        }


        /**
         * Событие по нажатию клавиши в влево.
         */
        $(target).find('.jCal .left').on('click', $.extend({}, opt), function (e) {


            if ($('.jCalMask', e.data._target).length > 0) {
                return false;
            }

            $(e.data._target).stop();

            var mD = {
                w: 0,
                h: 0
            };

            $('.jCalMo', e.data._target).each(function () {
                var $this = $(this);
                mD.w += $this.width() + parseInt($this.css('padding-left')) + parseInt($this.css('padding-right'));
                var cH = $this.height() + parseInt($this.css('padding-top')) + parseInt($this.css('padding-bottom'));
                mD.h = ((cH > mD.h) ? cH : mD.h);
            });

            $(e.data._target).prepend('<div class="jCalMo"></div>');

            e.data.day = new Date($('div[id*=' + e.data.cID + 'd_]:first', e.data._target)
                .attr('id')
                .replace(e.data.cID + 'd_', '')
                .replace(/_/g, '/'));

            e.data.day.setDate(1);
            e.data.day.setMonth(e.data.day.getMonth() - 1);

            drawCalControl($('.jCalMo:first', e.data._target), e.data);
            drawCal($('.jCalMo:first', e.data._target), e.data);

            if (e.data.showMonths > 1) {
                $('.right', e.data._target)
                    .clone(true)
                    .appendTo($('.jCalMo:eq(1) .jCal', e.data._target));

                $('.left:last, .right:last', e.data._target).remove();
            }

            var hh = mD.h;
            if (opt.showMonths == 1) {
                hh -= 0;
            }

            $(e.data._target).append('<div class="jCalSpace" style="width:' + mD.w + 'px; height:' + hh + 'px;"></div>');

            $('.jCalMo', e.data._target).wrapAll(
                '<div class="jCalMask" style="clip:rect(0px ' + mD.w + 'px ' + mD.h + 'px 0px); width:' + ( mD.w + ( mD.w / e.data.showMonths ) ) + 'px; height:' + mD.h + 'px;">' +
                '<div class="jCalMove"></div>' +
                '</div>');

            $('.jCalMove', e.data._target)
                .css('margin-left', ( ( mD.w / e.data.showMonths ) * -1 ) + 'px')
                .css('opacity', 0.5)
                .css('marginTop', '52px')
                .animate({marginLeft: '0px'}, e.data.scrollSpeed, function () {
                    $(this).children('.jCalMo:not(:last)').appendTo($(e.data._target));
                    $('.jCalSpace, .jCalMask', e.data._target).empty().remove();

                    if ($(e.data._target).data('day')) {
                        reSelectDates(e.data._target, $(e.data._target).data('day'), $(e.data._target).data('days'), e.data);
                    }

                    if (typeof opt.drawBack == 'function') {
                        opt.drawBack();
                    }
                    if (opt.showMonths == 1) {
                        $(e.data._target).append($('.jCal-footer'));
                    }

                });

            if (opt.showMonths == 1) {
                $(e.data._target).append($('.jCal-footer'));
            }

            if (opt._target.data('selected-day') && opt._target.data('selected-days')) {

                $(opt._target).find('.jCalMo .day').removeClass('selectedDay_first selectedDay selectedDay_last');
                reSelectDates(opt._target, opt._target.data('selected-day'), opt._target.data('selected-days'), opt, true);
            }

        });

        /**
         * Событие по нажатию клавиши в право.
         */
        $(target).find('.jCal .right').on('click', $.extend({}, opt), function (e) {

            if ($('.jCalMask', e.data._target).length > 0) {
                return false;
            }

            $(e.data._target).stop();

            var mD = {w: 0, h: 0};

            $('.jCalMo', e.data._target).each(function () {
                mD.w += $(this).width() + parseInt($(this).css('padding-left')) + parseInt($(this).css('padding-right'));
                var cH = $(this).height() + parseInt($(this).css('padding-top')) + parseInt($(this).css('padding-bottom'));
                if (cH > mD.h) {
                    mD.h = cH;
                }
            });


            $(e.data._target).append('<div class="jCalMo"></div>');

            e.data.day = new Date($('div[id^=' + e.data.cID + 'd_]:last', e.data._target).attr('id').replace(e.data.cID + 'd_', '').replace(/_/g, '/'));

            e.data.day.setDate(1);
            e.data.day.setMonth(e.data.day.getMonth() + 1);

            drawCalControl($('.jCalMo:last', e.data._target), e.data);
            drawCal($('.jCalMo:last', e.data._target), e.data, 'right');

            //
            if (e.data.showMonths > 1) {
                $('.left', e.data._target).clone(true).prependTo($('.jCalMo:eq(1) .jCal', e.data._target));
                $('.left:first, .right:first', e.data._target).remove();
            }


            var hh = mD.h;
            if (opt.showMonths == 1) {
                hh -= 0;
            }

            $(e.data._target).append('<div class="jCalSpace" style="width:' + mD.w + 'px; height:' + hh + 'px;"></div>');

            $('.jCalMo', e.data._target).wrapAll(
                '<div class="jCalMask" style="clip:rect(0px ' + mD.w + 'px ' + mD.h + 'px 0px); width:' + ( mD.w + ( mD.w / e.data.showMonths ) ) + 'px; height:' + mD.h + 'px;">' +
                '<div class="jCalMove"></div>' +
                '</div>');

            if(e.data._target)  {
                $('.jCalMove', e.data._target)
                    .css('opacity', 0.5)
                    .animate({marginLeft: ( ( mD.w / e.data.showMonths ) * -1 ) + 'px'}, e.data.scrollSpeed, function () {


                        $(this).children('.jCalMo:not(:first)')
                            .appendTo($(e.data._target));

                        $('.jCalSpace, .jCalMask', e.data._target)
                            .empty()
                            .remove();

                        if ($(e.data._target).data('day')) {

                            reSelectDates(e.data._target, $(e.data._target).data('day'), $(e.data._target).data('days'), e.data);
                        }

                        //setPostDay(opt);

                        $(this).children('.jCalMo:not(:first)').removeClass('');

                        if (typeof opt.drawBack == 'function')
                            opt.drawBack();

                        if (opt.showMonths == 1) {
                            $(e.data._target).append($('.jCal-footer'));
                        }

                    });

            }


            if (opt.showMonths == 1) {
                $(e.data._target).append($('.jCal-footer'));
            }

            if (opt._target.data('selected-day') && opt._target.data('selected-days')) {

                $(opt._target).find('.jCalMo .day').removeClass('selectedDay_first selectedDay selectedDay_last');
                reSelectDates(opt._target, opt._target.data('selected-day'), opt._target.data('selected-days'), opt, true);
            }

        });

    }

    function reSelectDates(target, day, days, opt, isnCallback) {


        var fDay = new Date(day.getTime());
        var sDay = new Date(day.getTime());
        for (var fC = false, di = 0, dC = days; di < dC; di++) {
            var dF = $(target).find('div[id*=d_' + (sDay.getMonth() + 1) + '_' + sDay.getDate() + '_' + sDay.getFullYear() + ']');
            if (dF.length > 0) {
                dF.stop().addClass('selectedDay');
                fC = true;
            }
            sDay.setDate(sDay.getDate() + 1);
            if (di == 0) {
                dF.addClass('selectedDay_first');
            } else if (di == dC - 1) {
                dF.addClass('selectedDay_last');
            }

        }

        if (fC && typeof opt.callback == 'function' && !isnCallback) {
            opt.callback(day, days);
        }

    }

    function setPostDay(opt) {


        var currentDate = new Date();
        var maxDate = null;

        if (opt.minDate && opt.minDate > currentDate) {
            currentDate = new Date(opt.minDate);
        }
        if (opt.maxDate) {
            maxDate = new Date(opt.maxDate);
        }

        var currentDay = currentDate.getDate();
        var currentMonth = currentDate.getMonth();
        var currentYear = currentDate.getFullYear();

        var $days;

        $('.jCalMo').each(function () {
            var $this = $(this);
            $days = $this.find('.day');

            if ($this.find('.monthName') && $this.find('.monthYear')) {
                var iMonth = $this.find('.monthName').data('cal-manth');
                var iYear = $this.find('.monthYear').data('cal-year');

                if (currentYear > iYear) {
                    $days.each(function (i) {
                        var $this = $(this);
                        $this.addClass('day_past');
                    });
                } else if (currentYear == iYear) {
                    if (currentMonth > iMonth) {
                        $days.each(function (i) {
                            var $this = $(this);
                            $this.addClass('day_past');
                        });
                    } else if (currentMonth == iMonth) {
                        $days.each(function (i) {
                            var $this = $(this);
                            var iDay = +$this.text();
                            if (iDay < currentDay) {
                                $this.addClass('day_past');
                            }
                        });
                    }
                }

                if (maxDate) {
                    var maxYear = maxDate.getFullYear();
                    var maxMonth = maxDate.getMonth();
                    var maxDay = maxDate.getDate();

                    if (iYear > maxYear) {
                        $days.each(function (i) {
                            var $this = $(this);
                            $this.addClass('day_past');
                        });
                    } else if (iYear == maxYear) {
                        if (iMonth > maxMonth) {
                            $days.each(function (i) {
                                var $this = $(this);
                                $this.addClass('day_past');
                            });
                        } else if (iMonth == maxMonth) {
                            $days.each(function (i) {
                                var $this = $(this);
                                var iDay = +$this.text();
                                if (iDay > maxDay) {
                                    $this.addClass('day_past');
                                }
                            });
                        }
                    }
                }
            }

        });


    }

    function drawCal(target, opt, turn) {

        for (var ds = 0, length = opt.dow.length; ds < length; ds++)
            $(target).append('<div class="dow">' + opt.dow[ds] + '</div>');

        var fd = new Date(new Date(opt.day.getTime()).setDate(1));
        var ldlm = new Date(new Date(fd.getTime()).setDate(0));
        var ld = new Date(new Date(new Date(fd.getTime()).setMonth(fd.getMonth() + 1)).setDate(0));
        var copt = {fd: fd.getDay(), lld: ldlm.getDate(), ld: ld.getDate()};
        var offsetDayStart = ( ( copt.fd < opt.dayOffset ) ? ( opt.dayOffset - 7 ) : 1 );
        var offsetDayEnd = ( ( ld.getDay() < opt.dayOffset ) ? ( 7 - ld.getDay() ) : ld.getDay() );


        for (var d = offsetDayStart, dE = ( copt.fd + copt.ld + ( 7 - offsetDayEnd ) ); d < dE; d++) {
            var text = '';
            if (d <= copt.fd - opt.dayOffset) {
                text = '<div id="' + opt.cID + 'd' + d + '" class="pday">' + ( copt.lld - ( ( copt.fd - opt.dayOffset ) - d ) ) + '</div>';
            } else if (d > copt.fd - opt.dayOffset + copt.ld) {
                text = '<div id="' + opt.cID + 'd' + d + '" class="aday">' + ( d - ( ( copt.fd - opt.dayOffset ) + copt.ld ) ) + '</div>';
            } else {
                text = '<div id="' + opt.cID + 'd_' + (fd.getMonth() + 1) + '_' + ( d - ( copt.fd - opt.dayOffset ) ) + '_' + fd.getFullYear() + '" class="' +
                    ( opt.dCheck(new Date((new Date(fd.getTime())).setDate(d - ( copt.fd - opt.dayOffset )))) || 'invday' ) +
                    '">' + ( d - ( copt.fd - opt.dayOffset ) ) + '</div>';
            }
            $(target).append(text);
        }


        $(target).find('div[id^=' + opt.cID + 'd]:first, div[id^=' + opt.cID + 'd]:nth-child(7n+2)').before('<br style="clear:both;" />');


        $(target).find('div[id^=' + opt.cID + 'd_]:not(.invday)').on("mouseover mouseout click", $.extend({}, opt), function (e) {

            if ($('.jCalMask', e.data._target).length > 0) {
                return false;
            }

            var osDate = new Date($(this).attr('id').replace(/c[0-9]{1,}d_([0-9]{1,2})_([0-9]{1,2})_([0-9]{4})/, '$1/$2/$3'));

            if (e.data.forceWeek) {
                osDate.setDate(osDate.getDate() + (e.data.dayOffset - osDate.getDay()));
            }

            var sDate = new Date(osDate.getTime());
            if (e.type == 'click') {

                $('div[id*=d_]', e.data._target)
                    .stop()
                    .removeClass('selectedDay selectedDay_first selectedDay_last overDay');

                var _dayClicked = $(e.target).closest('.day');
                var _jCalMo = _dayClicked.closest('.jCalMo');

                if (!_jCalMo.next().hasClass('jCalMo') && _dayClicked.nextAll('.day').length < 3) {
                    _jCalMo.find('.right').trigger('click');
                }

                $('div[id*=d_]', e.data._target)
                    .stop()
                    .removeClass('selectedDay selectedDay_first selectedDay_last overDay');
                $('body').append($('.jCal-first-day'));
            }


            for (var di = 0, ds = $(e.data._target).data('days'); di < ds; di++) {
                var currDay = $(e.data._target).find('#' + e.data.cID + 'd_' + ( sDate.getMonth() + 1 ) + '_' + sDate.getDate() + '_' + sDate.getFullYear());

                if (currDay.length == 0 || $(currDay).hasClass('invday')) {
                    break;
                }
                var ss = $('.jCal-first-day');

                var next1 = currDay.hasClass('day_past');
                var next2 = currDay.next().hasClass('day_past');
                var next3 = currDay.next().next().hasClass('day_past');
                var next4 = currDay.next().next().next().hasClass('day_past');
                var prev1 = currDay.hasClass('day_past');
                var prev2 = currDay.prev().hasClass('day_past');
                var prev3 = currDay.prev().prev().hasClass('day_past');
                var prev4 = currDay.prev().prev().prev().hasClass('day_past');

                if ((!next1 && !next2 && !next3 && !next4) || (!prev1 && !prev2 && !prev3 && !prev4)) {
                    if (e.type == 'mouseover') {

                        if (di == 0) {
                            ss.removeClass('hidden');
                            $(currDay).addClass('overDay_first').append(ss);
                        } else if (di == ds - 1) {
                            $(currDay).addClass('overDay_last');
                        }
                        $(currDay).addClass('overDay');
                    } else if (e.type == 'mouseout') {
                        if (di == 0) {
                            $(currDay).removeClass('overDay_first');
                        } else if (di == ds - 1) {
                            $(currDay).removeClass('overDay_last');
                        }
                        $(currDay).stop().removeClass('overDay');
                        ss.addClass('hidden');
                    } else if (e.type == 'click') {
                        if (di == 0) {
                            $(currDay).addClass('selectedDay_first');
                        } else if (di == ds - 1) {
                            $(currDay).addClass('selectedDay_last');
                        }
                        $(currDay).addClass('selectedDay');
                    }
                    sDate.setDate(sDate.getDate() + 1);

                    if (e.type == 'click') {
                        var $jCalConfirm = $('.jCal-confirm');
                        $jCalConfirm.data('osDate', osDate);
                        $jCalConfirm.data('di', di);

                        opt._target.data('selected-day', osDate);
                        opt._target.data('selected-days', di + 1);

                        e.data.day = osDate;
                        var x = moment(osDate)
                            .utcOffset(opt.timezoneOffset)
                            .startOf('day')
                            .year(osDate.getFullYear())
                            .month(osDate.getMonth())
                            .date(osDate.getDate())
                            .toDate();

                        if (e.data.callback(x, di, this)) {
                            $(e.data._target).data('day', e.data.day).data('days', di + 1);
                        }

                        // if (opt.showMonths > 1) {
                        //
                        //
                        // }
                    }
                }

            }

        });

        setPostDay(opt);
    }
})(jQuery);